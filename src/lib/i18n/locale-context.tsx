"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "bn" | "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "noorzaa_locale";
const LEGACY_STORAGE_KEY = "bloodlink_locale";

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readSavedLocale(): Locale | null {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "bn") return saved;
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === "en" || legacy === "bn") return legacy;
  return null;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");

  useEffect(() => {
    const saved = readSavedLocale();
    if (saved) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === "bn" ? "bn" : "en";
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
