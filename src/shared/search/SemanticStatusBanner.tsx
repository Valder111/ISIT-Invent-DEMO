import type { EmbeddingStatus } from './embeddingClient'
import type { IndexState } from './useSemanticSearch'

export function SemanticStatusBanner({
  modelStatus,
  indexState,
  alwaysOn,
}: {
  modelStatus: EmbeddingStatus
  indexState: IndexState
  alwaysOn?: boolean
}) {
  if (modelStatus.kind === 'idle' && !alwaysOn) return null

  let body: React.ReactNode = null
  let tone: 'info' | 'ok' | 'err' = 'info'

  if (modelStatus.kind === 'error') {
    tone = 'err'
    body = <>Не удалось включить умный поиск. {modelStatus.message}</>
  } else if (modelStatus.kind === 'loading') {
    const pct = Math.round((modelStatus.progress ?? 0) * 100)
    body = (
      <>
        Загружается модель умного поиска ({pct}%)… При первом запуске это может занять до минуты.
      </>
    )
  } else if (modelStatus.kind === 'ready' && indexState.kind === 'building') {
    const done = indexState.total > 0 ? Math.round((indexState.encoded / indexState.total) * 100) : 0
    body = (
      <>
        Подготавливаем каталог для поиска… {done > 0 ? `${done}%` : 'ещё немного'}
      </>
    )
  } else if (modelStatus.kind === 'ready' && indexState.kind === 'error') {
    tone = 'err'
    body = <>Не удалось подготовить поиск: {indexState.message}</>
  } else if (modelStatus.kind === 'ready' && indexState.kind === 'ready') {
    tone = 'ok'
    body = <>Умный поиск готов · в каталоге {indexState.size} позиций</>
  } else if (alwaysOn) {
    body = <>Готовится умный поиск…</>
  }

  if (!body) return null

  return (
    <div className={`ai-banner ai-banner--${tone}`} role="status">
      <span className="ai-banner__chip">ИИ</span>
      <span className="ai-banner__text">{body}</span>
    </div>
  )
}
