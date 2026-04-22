import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import es from './es.json'

const STORAGE_KEY = 'choretrack.language'
const SUPPORTED_LANGUAGES = new Set(['en', 'es'])

const detectLanguage = () => {
  const storedLanguage = localStorage.getItem(STORAGE_KEY)?.toLowerCase()
  if (storedLanguage && SUPPORTED_LANGUAGES.has(storedLanguage)) {
    return storedLanguage
  }

  const browserLanguage = navigator.language?.split('-')[0]?.toLowerCase()
  if (browserLanguage && SUPPORTED_LANGUAGES.has(browserLanguage)) {
    return browserLanguage
  }

  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (language) => {
  if (SUPPORTED_LANGUAGES.has(language)) {
    localStorage.setItem(STORAGE_KEY, language)
  }
})

export default i18n
