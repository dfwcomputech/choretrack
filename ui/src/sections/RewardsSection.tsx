import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Coins, Flame, Gift, Trophy } from 'lucide-react'

const rewardItems = [
  { key: 'points', icon: Coins, gradient: 'from-yellow-400 to-orange-400' },
  { key: 'streaks', icon: Flame, gradient: 'from-orange-400 to-red-400' },
  { key: 'rewards', icon: Gift, gradient: 'from-purple-400 to-pink-400' },
  { key: 'milestones', icon: Trophy, gradient: 'from-blue-400 to-primary-400' },
]

export default function RewardsSection() {
  const { t } = useTranslation()

  return (
    <section id="rewards" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('rewards.title')}</h2>
            <p className="text-lg text-gray-600 mb-10">{t('rewards.subtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewardItems.map(({ key, icon: Icon, gradient }) => (
                <div key={key} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {t(`rewards.items.${key}.title`)}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t(`rewards.items.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Progress visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-6">{t('rewards.progressTitle')}</h3>

              {/* Level cards */}
              {[
                { name: 'Emma', level: 4, points: 380, max: 500, color: 'bg-yellow-400' },
                { name: 'Liam', level: 3, points: 247, max: 300, color: 'bg-green-400' },
                { name: 'Sophia', level: 2, points: 95, max: 150, color: 'bg-pink-400' },
              ].map((child, i) => (
                <div key={child.name} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${child.color} flex items-center justify-center text-gray-900 font-bold text-sm`}>
                        {child.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{child.name}</p>
                        <p className="text-white/70 text-xs">{t('rewards.level')} {child.level}</p>
                      </div>
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {child.points}/{child.max}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(child.points / child.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className={`h-full ${child.color} rounded-full`}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    {child.max - child.points} {t('rewards.pointsToNext')}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
