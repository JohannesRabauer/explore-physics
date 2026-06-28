import de from './de.json';
import en from './en.json';

const translations: Record<string, Record<string, string>> = { de, en };

export function t(key: string, lang: string = 'de'): string {
  return translations[lang]?.[key] ?? translations['de'][key] ?? key;
}

export const languages = ['de', 'en'] as const;
export type Lang = (typeof languages)[number];
