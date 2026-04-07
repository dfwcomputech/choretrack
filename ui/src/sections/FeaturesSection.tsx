import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ClipboardList, Star, Gift, BarChart2, Flame, LayoutDashboard, Bell } from 'lucide-react'

const featureIcons = [
  ClipboardList,
  Star,
  Gift,
  BarChart2,
  Flame,
  LayoutDashboard,
  Bell,
]

const featureKeys = [
  'assignChores',
  'earnPoints',
  'rewardSystem',
  'progressTracking',
  'streaks',
  'familyDashboard',
  'notifications',
]

const featureColors = [
  'bg-blue-50 text-blue-600',
  'bg-yellow-50 text-yellow-600',
  'bg-green-50 text-green-600',
  'bg-purple-50 text-purple-600',
  'bg-orange-50 text-orange-600',
  'bg-primary-50 text-primary-600',
  'bg-pink-50 text-pink-600',
]

export default function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('features.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index]
            const colorClass = featureColors[index]
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-50 hover:bg-white rounded-2xl p-6 border border-transparent hover:border-gray-200 hover:shadow-md transition-all"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(`features.items.${key}.title`)}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(`features.items.${key}.description`)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
