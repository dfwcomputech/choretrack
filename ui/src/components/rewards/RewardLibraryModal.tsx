import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/useAuth'
import { searchRewardTemplates, type RewardTemplateResponse } from '../../services/libraryService'

interface RewardLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: RewardTemplateResponse) => void
}

export default function RewardLibraryModal({ isOpen, onClose, onSelect }: RewardLibraryModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RewardTemplateResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setErrorMessage('')
    loadTemplates('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      void loadTemplates(query)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query, isOpen])

  const loadTemplates = async (searchQuery: string) => {
    if (!token) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await searchRewardTemplates(searchQuery, token)
      setResults(data)
    } catch {
      setErrorMessage(t('library.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 sm:items-center">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{t('library.reward.title')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('common.cancel')}
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('library.reward.searchPlaceholder')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <ul className="mt-3 space-y-2">
          {isLoading ? (
            <li className="py-6 text-center text-sm text-slate-500">{t('library.loading')}</li>
          ) : results.length === 0 ? (
            <li className="py-6 text-center text-sm text-slate-500">{t('library.noResults')}</li>
          ) : (
            results.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(template)
                    onClose()
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{template.name}</p>
                      {template.description ? (
                        <p className="mt-0.5 text-sm text-slate-600">{template.description}</p>
                      ) : null}
                      {template.category ? (
                        <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {template.category}
                        </span>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-bold text-primary-700">{template.suggestedPoints} {t('common.pts')}</span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
