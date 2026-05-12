/**
 * Internationalization (i18n) Context
 * 
 * Scalable locale system: add a new JSON file to src/locales/ and register it
 * in the SUPPORTED_LOCALES map below. The entire app will pick it up automatically.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Import all locale files
import tr from '../locales/tr.json';
import en from '../locales/en.json';

// Register supported locales here — add new languages by importing and adding to this map
const SUPPORTED_LOCALES = {
  tr: { label: 'Türkçe', data: tr },
  en: { label: 'English', data: en },
};

const STORAGE_KEY = 'fmd_app_language';
const DEFAULT_LOCALE = 'tr';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && SUPPORTED_LOCALES[saved] ? saved : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const setLocale = useCallback((newLocale) => {
    if (SUPPORTED_LOCALES[newLocale]) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch { /* ignore */ }
    }
  }, []);

  // Update document lang attribute
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  /**
   * Translation function: t('key') or t('nested.key')
   * Supports dot-notation for nested keys like 'class_names.mouth_sores'
   */
  const t = useCallback((key) => {
    const data = SUPPORTED_LOCALES[locale]?.data || SUPPORTED_LOCALES[DEFAULT_LOCALE].data;
    const keys = key.split('.');
    let value = data;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default locale
        let fallback = SUPPORTED_LOCALES[DEFAULT_LOCALE].data;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return the key itself if not found anywhere
          }
        }
        return fallback;
      }
    }
    return value;
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t,
    supportedLocales: Object.entries(SUPPORTED_LOCALES).map(([code, { label }]) => ({ code, label })),
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
