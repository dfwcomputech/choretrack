import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateRewardPayload } from '../../services/rewardService'
import RewardLibraryModal from './RewardLibraryModal'
import type { RewardTemplateResponse } from '../../services/libraryService'

interface AddRewardFormProps {
  isOpen: boolean
  isSubmitting: boolean
  errorMessage: string
  fieldErrors: Record<string, string>
  prefill?: RewardTemplateResponse | null
  onClose: () => void
  onSubmit: (payload: CreateRewardPayload) => Promise<void>
}

interface RewardFormValues {
  name: string
  description: string
  pointCost: number
  category: string
}

export default function AddRewardForm({ isOpen, isSubmitting, errorMessage, fieldErrors, prefill, onClose, onSubmit }: AddRewardFormProps) {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState<RewardFormValues>({
    name: '',
    description: '',
    pointCost: 100,
    category: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  useEffect(() => {
    if (isOpen && prefill) {
      setFormValues((prev) => ({
        ...prev,
        name: prefill.name,
        description: prefill.description ?? '',
        pointCost: prefill.suggestedPoints,
        category: prefill.category ?? '',
      }))
    }
  }, [isOpen, prefill])

  if (!isOpen) return null

  const handleInputChange = <T extends keyof RewardFormValues>(field: T, value: RewardFormValues[T]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setValidationErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formValues.name.trim()) {
      nextErrors.name = t('rewards.validation.nameRequired')
    }
    if (!Number.isFinite(formValues.pointCost) || formValues.pointCost <= 0) {
      nextErrors.pointCost = t('rewards.validation.pointCostPositive')
    }
    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      pointCost: formValues.pointCost,
      category: formValues.category.trim(),
    })
  }

  const mergedFieldErrors = { ...validationErrors, ...fieldErrors }

  const handleSelectFromLibrary = (template: RewardTemplateResponse) => {
    setFormValues((prev) => ({
      ...prev,
      name: template.name,
      description: template.description ?? '',
      pointCost: template.suggestedPoints,
      category: template.category ?? '',
    }))
    setValidationErrors({})
  }

  return (
    <>
      <RewardLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
      />
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold text-slate-900">{t('rewards.addReward')}</h3>
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="shrink-0 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            {t('library.browseLibrary')}
          </button>
        </div>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label htmlFor="add-reward-name" className="block text-sm font-semibold text-slate-600">
              {t('rewards.name')}
              <input
                id="add-reward-name"
                value={formValues.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder={t('rewards.placeholders.name')}
                aria-invalid={Boolean(mergedFieldErrors.name)}
              />
              {mergedFieldErrors.name ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.name}</p> : null}
            </label>
            <label htmlFor="add-reward-description" className="block text-sm font-semibold text-slate-600">
              {t('rewards.description')}
              <textarea
                id="add-reward-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
                placeholder={t('rewards.placeholders.description')}
              />
            </label>
            <label htmlFor="add-reward-point-cost" className="block text-sm font-semibold text-slate-600">
              {t('rewards.pointCost')}
              <input
                id="add-reward-point-cost"
                type="number"
                min={1}
                value={formValues.pointCost}
                onChange={(event) => {
                  const parsed = Number(event.target.value)
                  handleInputChange('pointCost', Number.isFinite(parsed) ? parsed : 0)
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.pointCost)}
              />
              {mergedFieldErrors.pointCost ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.pointCost}</p> : null}
            </label>
            <label htmlFor="add-reward-category" className="block text-sm font-semibold text-slate-600">
              {t('rewards.category')}
              <input
                id="add-reward-category"
                value={formValues.category}
                onChange={(event) => handleInputChange('category', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder={t('rewards.placeholders.category')}
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? t('common.adding') : t('rewards.addReward')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
