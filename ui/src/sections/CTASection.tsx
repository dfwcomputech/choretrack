import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 to-purple-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {t('cta.primary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-white/70 text-sm">
              {t('cta.secondary')}{' '}
              <Link to="/login" className="text-white font-semibold underline underline-offset-2">
                {t('cta.login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
