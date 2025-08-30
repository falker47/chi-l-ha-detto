import { readFileSync } from "fs";
import { z } from "zod";

const ItemSchema = z.object({
  id: z.string().min(1),
  quote: z.string().min(1),
  author: z.string().min(1),
  choices: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  year_or_period: z.string().min(1),
  source_title: z.string().min(1),
  source_link: z.string().url(),
  tags: z.array(z.string()),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  spiciness: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  hint_short: z.string().min(1),
  hint_more: z.string().min(1),
  ambiguity_note: z.string().min(1),
  language_orig: z.string().min(1),
  sensitive: z.boolean().optional(),
  context: z.string().min(1),
});

const data = JSON.parse(readFileSync("src/data/quotes.json", "utf8"));
const parsed = z.array(ItemSchema).safeParse(data);

let ok = true;
const errors: string[] = [];

if (!parsed.success) {
  console.error("Schema validation failed:");
  console.error(parsed.error.format());
  process.exit(1);
}

const items = parsed.data;

// Invarianti extra
const ids = new Set<string>();
const authorsSeen = new Set<string>();

items.forEach((it) => {
  if (ids.has(it.id)) {
    ok = false; errors.push(`ID duplicato: ${it.id}`);
  } else ids.add(it.id);

  if (new Set(it.choices).size !== 4) {
    ok = false; errors.push(`Scelte duplicate nell'item ${it.id}`);
  }
  if (it.choices[it.correctIndex] !== it.author) {
    ok = false; errors.push(`Autore non coincide con la scelta corretta in ${it.id}`);
  }
  if (it.sensitive && it.spiciness === 0) {
    ok = false; errors.push(`Item ${it.id} è sensitive ma spiciness=0`);
  }
  // Nota: Autori corretti unici non obbligatorio -> solo warning
  if (authorsSeen.has(it.author)) {
    console.warn(`Warning: autore corretto già presente: ${it.author}`);
  } else {
    authorsSeen.add(it.author);
  }
});

if (!ok) {
  console.error("\nERRORI:");
  errors.forEach((e) => console.error("- " + e));
  process.exit(1);
} else {
  console.log(`OK: ${items.length} item validi.`);
}


