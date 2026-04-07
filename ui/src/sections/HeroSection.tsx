import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Users, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4" />
              <span>{t('hero.trustedBy')}</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {t('hero.headline')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                {t('hero.headlineAccent')}
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {t('hero.subHeadline')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md"
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: t('hero.stats.families') },
                { icon: CheckCircle, label: t('hero.stats.choresCompleted') },
                { icon: Star, label: t('hero.stats.rewardsEarned') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="flex items-center gap-1.5 justify-center lg:justify-start text-primary-600 mb-1">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: App mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              {/* Header bar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Family Dashboard</h3>
                  <p className="text-sm text-gray-500">Today's progress</p>
                </div>
                <div className="bg-primary-100 text-primary-700 font-bold text-sm px-3 py-1.5 rounded-full">
                  ⭐ 247 pts
                </div>
              </div>

              {/* Chore items */}
              {[
                { name: 'Clean bedroom', points: 20, done: true, child: 'Emma' },
                { name: 'Set the table', points: 10, done: true, child: 'Liam' },
                { name: 'Walk the dog', points: 30, done: false, child: 'Emma' },
                { name: 'Do homework', points: 25, done: false, child: 'Liam' },
              ].map((chore) => (
                <div
                  key={chore.name}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${
                    chore.done ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      chore.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {chore.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${chore.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {chore.name}
                    </p>
                    <p className="text-xs text-gray-500">{chore.child}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    chore.done ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  }`}>
                    +{chore.points}
                  </span>
                </div>
              ))}

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Level 3 Progress</span>
                  <span className="text-primary-600 font-semibold">247 / 300 pts</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">53 points to Level 4 🎉</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
