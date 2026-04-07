import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { PlusCircle, CheckSquare, Coins, ShoppingBag } from 'lucide-react'

const steps = [
  { key: 'step1', icon: PlusCircle, color: 'bg-blue-100 text-blue-600', number: '01' },
  { key: 'step2', icon: CheckSquare, color: 'bg-green-100 text-green-600', number: '02' },
  { key: 'step3', icon: Coins, color: 'bg-yellow-100 text-yellow-600', number: '03' },
  { key: 'step4', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', number: '04' },
]

export default function HowItWorksSection() {
  const { t } = useTranslation()

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('howItWorks.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
        </motion.div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-purple-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ key, icon: Icon, color, number }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className={`relative w-24 h-24 rounded-full ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-10 h-10" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {number}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(`howItWorks.steps.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`howItWorks.steps.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
