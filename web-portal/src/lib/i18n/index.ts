import type { Locale, Translations } from './types'
import ptBR from './translations/pt-BR.json'
import enUS from './translations/en-US.json'

export type { Locale, Translations }

const translations: Record<Locale, Translations> = {
  'pt-BR': ptBR as Translations,
  'en-US': enUS as Translations,
}

/**
 * Detect browser language and return appropriate locale
 * If pt-BR, returns pt-BR, otherwise returns en-US
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en-US' // Default for SSR
  }

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en-US'
  
  // Check if browser language is pt-BR
  if (browserLang.toLowerCase().startsWith('pt')) {
    // Check specifically for pt-BR
    if (browserLang.toLowerCase() === 'pt-br' || browserLang.toLowerCase() === 'pt_br') {
      return 'pt-BR'
    }
    // For other Portuguese variants, default to pt-BR
    return 'pt-BR'
  }
  
  // Default to en-US for all other languages
  return 'en-US'
}

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations['en-US']
}

/**
 * Get a nested translation value by path
 * Example: getTranslation(t, 'auth.login.title') => 'Sign in to your account'
 */
export function getTranslation(
  translations: Translations,
  path: string
): string {
  const keys = path.split('.')
  let value: any = translations
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key as keyof typeof value]
    } else {
      return path // Return path if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path
}

