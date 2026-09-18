import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { appStorage } from "@/services/storage";
import { LANGUAGES, LanguageOption, TRANSLATIONS, TranslationKey } from "@/constants/i18n";

const LANGUAGE_STORAGE_KEY = "user_app_language";

interface LanguageContextValue {
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageOption>(LANGUAGES[0]);

  useEffect(() => {
    (async () => {
      const savedCode = await appStorage.getJson<string>(LANGUAGE_STORAGE_KEY);
      if (savedCode) {
        const found = LANGUAGES.find((l) => l.code === savedCode);
        if (found) setLanguageState(found);
      }
    })();
  }, []);

  const setLanguage = useCallback((lang: LanguageOption) => {
    setLanguageState(lang);
    appStorage.setJson(LANGUAGE_STORAGE_KEY, lang.code);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const langTranslations = TRANSLATIONS[language.code] ?? TRANSLATIONS.en;
      return langTranslations[key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
