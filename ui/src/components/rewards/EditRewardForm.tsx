import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UpdateRewardPayload } from '../../services/rewardService'

interface EditRewardFormProps {
  isOpen: boolean
  isSubmitting: boolean
  errorMessage: string
  fieldErrors: Record<string, string>
  initialValues: {
    name: string
    description: string
    pointCost: number
    category: string
    active: boolean
  }
  onClose: () => void
  onSubmit: (payload: UpdateRewardPayload) => Promise<void>
}

interface RewardFormValues {
  name: string
  description: string
  pointCost: number
  category: string
  active: boolean
}

export default function EditRewardForm({
  isOpen,
  isSubmitting,
  errorMessage,
  fieldErrors,
  initialValues,
  onClose,
  onSubmit,
}: EditRewardFormProps) {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState<RewardFormValues>(initialValues)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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
      active: formValues.active,
    })
  }

  const mergedFieldErrors = { ...validationErrors, ...fieldErrors }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-900">{t('rewards.editReward')}</h3>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="mt-4 space-y-3">
            <label htmlFor="edit-reward-name" className="block text-sm font-semibold text-slate-600">
              {t('rewards.name')}
              <input
                id="edit-reward-name"
                value={formValues.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                aria-invalid={Boolean(mergedFieldErrors.name)}
              />
              {mergedFieldErrors.name ? <p className="mt-1 text-xs font-medium text-red-600">{mergedFieldErrors.name}</p> : null}
            </label>
            <label htmlFor="edit-reward-description" className="block text-sm font-semibold text-slate-600">
              {t('rewards.description')}
              <textarea
                id="edit-reward-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
              />
            </label>
            <label htmlFor="edit-reward-point-cost" className="block text-sm font-semibold text-slate-600">
              {t('rewards.pointCost')}
              <input
                id="edit-reward-point-cost"
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
            <label htmlFor="edit-reward-category" className="block text-sm font-semibold text-slate-600">
              {t('rewards.category')}
              <input
                id="edit-reward-category"
                value={formValues.category}
                onChange={(event) => handleInputChange('category', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label htmlFor="edit-reward-active" className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                id="edit-reward-active"
                type="checkbox"
                checked={formValues.active}
                onChange={(event) => handleInputChange('active', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
               {t('rewards.activeReward')}
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
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
