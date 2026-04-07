import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MessageCircleOff, UserCheck, Calendar, Eye, Users } from 'lucide-react'

const benefitItems = [
  { key: 'noNagging', icon: MessageCircleOff, color: 'text-rose-500' },
  { key: 'responsibility', icon: UserCheck, color: 'text-green-500' },
  { key: 'structure', icon: Calendar, color: 'text-blue-500' },
  { key: 'transparent', icon: Eye, color: 'text-purple-500' },
  { key: 'management', icon: Users, color: 'text-orange-500' },
]

export default function BenefitsSection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('benefits.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('benefits.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitItems.map(({ key, icon: Icon, color }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className={`inline-flex p-2 rounded-lg bg-gray-50 mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t(`benefits.items.${key}.title`)}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t(`benefits.items.${key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
