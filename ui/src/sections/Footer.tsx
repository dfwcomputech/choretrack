import { useTranslation } from 'react-i18next'
import { CheckSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-white">
            <CheckSquare className="w-5 h-5 text-primary-400" />
            <span className="font-bold text-lg">{t('footer.brand')}</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-left">{t('footer.tagline')}</p>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            {(['privacy', 'terms', 'contact', 'faq'] as const).map((key) => (
              <Link
                key={key}
                to={`/${key}`}
                className="hover:text-white transition-colors"
              >
                {t(`footer.links.${key}`)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
