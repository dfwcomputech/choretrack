interface DeleteRewardDialogProps {
  isOpen: boolean
  rewardName: string
  isDeleting: boolean
  errorMessage: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeleteRewardDialog({
  isOpen,
  rewardName,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteRewardDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-900">Delete Reward</h3>
        <p className="mt-3 text-sm text-slate-700">
          Are you sure you want to delete {rewardName ? `"${rewardName}"` : 'this reward'}? This action cannot be undone.
        </p>
        {errorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700" disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isDeleting ? 'Deleting...' : 'Delete Reward'}
          </button>
        </div>
      </div>
    </div>
  )
}
