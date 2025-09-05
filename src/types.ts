export interface Item {
  id: string;
  quote: string;
  choices: string[];
  author: string;
  correctIndex: number;
  year_or_period: string;
  source_title: string;
  source_link: string;
  tags: string[];
  difficulty: number;
  spiciness: number;
  context: string;
  ambiguity_note: string;
  language_orig?: string;
  quote_it?: string;
  hint_short?: string;
  hint_more?: string;
}