import { useTranslation } from 'react-i18next'

interface LanguageSwitcherProps {
  className?: string
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en'

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(currentLanguage === 'en' ? 'es' : 'en')}
      className={className}
      aria-label={currentLanguage === 'en' ? t('language.switchToSpanish') : t('language.switchToEnglish')}
    >
      {currentLanguage === 'en' ? 'ES' : 'EN'}
    </button>
  )
}
