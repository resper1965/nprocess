'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, Translations, detectLocale, getTranslations } from './index'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
  translate: (path: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en-US')


  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  const t = getTranslations(locale)

  const translate = (path: string): string => {
    const keys = path.split('.')
    let value: any = t
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key as keyof typeof value]
      } else {
        return path // Return path if translation not found
      }
    }
    
    return typeof value === 'string' ? value : path
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translate }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

