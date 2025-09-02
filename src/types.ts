export type Item = {
  id: string;
  quote: string;
  author: string;               // DEVE coincidere con la scelta corretta
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  year_or_period: string;
  source_title: string;
  source_link: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  spiciness: 0 | 1 | 2;         // 0=classic,1=mixed,2=spicy
  hint_short: string;
  hint_more: string;
  ambiguity_note: string;
  language_orig: string;
  sensitive?: boolean;
  context: string;              // contestualizzazione educativa
};










