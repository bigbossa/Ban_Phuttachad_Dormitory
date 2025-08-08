import { createContext } from 'react';

export type Language = "en" | "th";

export type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  availableLanguages: Language[];
};

export const LanguageProviderContext = createContext<LanguageProviderState | undefined>(undefined);
