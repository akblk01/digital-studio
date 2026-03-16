"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import tr from "./tr.json"
import en from "./en.json"
import ru from "./ru.json"
import ar from "./ar.json"

export type Locale = "tr" | "en" | "ru" | "ar"

const translations: Record<Locale, Record<string, string>> = { tr, en, ru, ar }

export const LOCALE_CONFIG: Record<Locale, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
  tr: { label: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  ru: { label: "Русский", flag: "🇷🇺", dir: "ltr" },
  ar: { label: "العربية", flag: "🇸🇦", dir: "rtl" },
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: "tr",
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr")

  useEffect(() => {
    // localStorage'dan oku (SSR bypass)
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && translations[saved]) {
      setLocaleState(saved)
      document.documentElement.lang = saved
      document.documentElement.dir = LOCALE_CONFIG[saved].dir
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem("locale", newLocale)
    setLocaleState(newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = LOCALE_CONFIG[newLocale].dir
  }

  const t = (key: string): string => {
    return translations[locale][key] ?? translations["tr"][key] ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
