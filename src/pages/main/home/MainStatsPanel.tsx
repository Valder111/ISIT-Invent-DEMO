import type { Stats } from './mainPagePermissions'

export function MainStatsPanel({
  statsLoading,
  statsErr,
  stats,
  showUserStat,
}: {
  statsLoading: boolean
  statsErr: string | null
  stats: Stats | null
  showUserStat: boolean
}) {
  const statTiles = stats && (
    <>
      <div className="stat-card">
        <div className="stat-card__value">{stats.equipment ?? '—'}</div>
        <div className="stat-card__label">Оборудование (оценка)</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__value">{stats.tickets ?? '—'}</div>
        <div className="stat-card__label">Заявки (в выборке)</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__value">{stats.documents ?? '—'}</div>
        <div className="stat-card__label">Документы платформы</div>
      </div>
      {showUserStat && (
        <div className="stat-card">
          <div className="stat-card__value">{stats.users != null ? stats.users : '—'}</div>
          <div className="stat-card__label">Пользователи</div>
        </div>
      )}
    </>
  )

  return (
    <section className="panel main-infopanel">
      <div className="panel__header main-infopanel__header">
        <h2 className="panel__title">Информационная сводка</h2>
      </div>
      <div className="panel__body main-infopanel__body">
        {statsLoading && <p className="muted">Загрузка показателей…</p>}
        {statsErr && <div className="alert alert--error">{statsErr}</div>}
        {!statsLoading && stats && (
          <div className={`main-stats-grid main-stats-grid--count-${showUserStat ? 4 : 3}`}>{statTiles}</div>
        )}
      </div>
    </section>
  )
}
