import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/useAuth'
import { listSeasonTemplates, type SeasonTemplateResponse } from '../../services/libraryService'
import { applySeasonTemplate, SeasonPassServiceError } from '../../services/seasonPassService'
import type { RewardItem } from '../dashboard/types'

interface SeasonTemplateModalProps {
  isOpen: boolean
  hasExistingRewards: boolean
  onClose: () => void
  onApplied: (rewards: RewardItem[]) => void
}

export default function SeasonTemplateModal({ isOpen, hasExistingRewards, onClose, onApplied }: SeasonTemplateModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [templates, setTemplates] = useState<SeasonTemplateResponse[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<SeasonTemplateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSelectedTemplate(null)
    setErrorMessage('')
    setShowConfirm(false)
    void loadTemplates()
  }, [isOpen])

  const loadTemplates = async () => {
    if (!token) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await listSeasonTemplates(token)
      setTemplates(data)
    } catch {
      setErrorMessage(t('seasonTemplates.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTemplate = (template: SeasonTemplateResponse) => {
    setSelectedTemplate(template)
    setErrorMessage('')
  }

  const handleApplyClick = () => {
    if (!selectedTemplate) return
    if (hasExistingRewards) {
      setShowConfirm(true)
    } else {
      void doApply(true)
    }
  }

  const doApply = async (replace: boolean) => {
    if (!selectedTemplate || !token) return
    setIsApplying(true)
    setErrorMessage('')
    try {
      const result = await applySeasonTemplate(selectedTemplate.id, { replace }, token)
      const rewardItems: RewardItem[] = result.rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        pointsCost: r.pointCost,
        category: r.category ?? '',
        active: r.active,
        icon: '🎁',
      }))
      onApplied(rewardItems)
      onClose()
    } catch (error) {
      if (error instanceof SeasonPassServiceError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(t('seasonTemplates.applyError'))
      }
    } finally {
      setIsApplying(false)
      setShowConfirm(false)
    }
  }

  if (!isOpen) return null

  if (showConfirm && selectedTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900">{t('seasonTemplates.replaceTitle')}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {t('seasonTemplates.replaceMessage', { name: selectedTemplate.name })}
          </p>
          {errorMessage ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isApplying}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void doApply(true)}
              disabled={isApplying}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isApplying ? t('seasonTemplates.applying') : t('seasonTemplates.replaceConfirm')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 sm:items-center">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t('seasonTemplates.title')}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{t('seasonTemplates.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('common.cancel')}
          >
            ✕
          </button>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading ? (
            <p className="col-span-2 py-6 text-center text-sm text-slate-500">{t('library.loading')}</p>
          ) : templates.length === 0 ? (
            <p className="col-span-2 py-6 text-center text-sm text-slate-500">{t('library.noResults')}</p>
          ) : (
            templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {t('seasonTemplates.rewardCount', { count: template.rewardCount })}
                    </span>
                  </div>
                  {template.description ? (
                    <p className="mt-1 text-sm text-slate-600">{template.description}</p>
                  ) : null}
                  {isSelected && template.rewards.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                      {template.rewards.map((reward) => (
                        <li key={reward.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                          <span className="text-sm font-medium text-slate-800">{reward.name}</span>
                          <span className="shrink-0 text-xs font-semibold text-primary-700">{reward.pointCost} {t('common.pts')}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </button>
              )
            })
          )}
        </div>

        {selectedTemplate ? (
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={isApplying}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isApplying ? t('seasonTemplates.applying') : t('seasonTemplates.applyTemplate')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
