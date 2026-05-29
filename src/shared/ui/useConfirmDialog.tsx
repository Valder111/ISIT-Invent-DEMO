import { useCallback, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'

export type ConfirmDialogOptions = {
  title?: string
  message: string
  danger?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

type OpenState = ConfirmDialogOptions & {
  onConfirm: () => void | Promise<void>
}

/** Диалог подтверждения вместо window.confirm. */
export function useConfirmDialog() {
  const [state, setState] = useState<OpenState | null>(null)
  const [pending, setPending] = useState(false)

  const ask = useCallback((options: ConfirmDialogOptions, onConfirm: () => void | Promise<void>) => {
    setState({ ...options, onConfirm })
  }, [])

  const close = useCallback(() => {
    if (!pending) setState(null)
  }, [pending])

  const handleConfirm = useCallback(async () => {
    if (!state) return
    setPending(true)
    try {
      await state.onConfirm()
      setState(null)
    } finally {
      setPending(false)
    }
  }, [state])

  const dialog = state ? (
    <ConfirmModal
      title={state.title}
      message={state.message}
      danger={state.danger}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      pending={pending}
      onCancel={close}
      onConfirm={() => void handleConfirm()}
    />
  ) : null

  return { ask, dialog }
}
