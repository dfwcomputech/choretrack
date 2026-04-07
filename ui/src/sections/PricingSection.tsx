import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PricingSection() {
  const { t } = useTranslation()

  const freePlan = {
    key: 'free',
    features: t('pricing.free.features', { returnObjects: true }) as string[],
  }

  const premiumPlan = {
    key: 'premium',
    features: t('pricing.premium.features', { returnObjects: true }) as string[],
  }

  const plans = [freePlan, premiumPlan]

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('pricing.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map(({ key, features }, index) => {
            const isPremium = key === 'premium'
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className={`relative rounded-3xl p-8 ${
                  isPremium
                    ? 'bg-gradient-to-br from-primary-600 to-purple-700 text-white shadow-2xl shadow-primary-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full">
                    {t(`pricing.${key}.badge`)}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                    {t(`pricing.${key}.name`)}
                  </h3>
                  <p className={`text-sm mb-4 ${isPremium ? 'text-white/70' : 'text-gray-500'}`}>
                    {t(`pricing.${key}.description`)}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-extrabold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                      {t(`pricing.${key}.price`)}
                    </span>
                    <span className={`text-sm font-medium ${isPremium ? 'text-white/70' : 'text-gray-500'}`}>
                      {t(`pricing.${key}.period`)}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isPremium ? 'bg-white/20' : 'bg-primary-100'
                      }`}>
                        <Check className={`w-3 h-3 ${isPremium ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    isPremium
                      ? 'bg-white text-primary-700 hover:bg-gray-50 shadow-sm'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                  }`}
                >
                  {t(`pricing.${key}.cta`)}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
