import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X, CheckSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import LanguageSwitcher from './layout/LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { key: 'nav.features', href: '#features' },
    { key: 'nav.howItWorks', href: '#how-it-works' },
    { key: 'nav.rewards', href: '#rewards' },
    { key: 'nav.pricing', href: '#pricing' },
    { key: 'nav.faq', href: '#faq' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <CheckSquare className="w-6 h-6" />
            <span className="text-gray-900">{t('nav.brand')}</span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors"
              >
                {t(key)}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <LanguageSwitcher className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors" />
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              {t('nav.createAccount')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg" />
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium py-2"
                >
                  {t(key)}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="py-2 text-center font-semibold text-gray-700 border border-gray-200 rounded-lg"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="py-2 text-center font-semibold text-white bg-primary-600 rounded-lg"
                >
                  {t('nav.createAccount')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
