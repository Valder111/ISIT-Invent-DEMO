import type { ReactNode } from 'react'
import type { ActivityLog } from '../../../shared/api/activity'
import { fmtDate } from './mainPageUtils'

export function MainActivityPanel({
  staffLink,
  logLoading,
  logErr,
  logs,
}: {
  staffLink: ReactNode
  logLoading: boolean
  logErr: string | null
  logs: ActivityLog[] | null
}) {
  return (
    <section className="panel main-activity-panel">
      <div className="panel__header main-page__activity-header">
        <h2 className="panel__title">Последние действия на платформе</h2>
        {staffLink}
      </div>
      <div className="panel__body">
        {logLoading && <p className="muted">Загрузка…</p>}
        {logErr && <div className="alert alert--error">{logErr}</div>}
        {!logLoading && !logErr && (
          <div className="table-scroll main-activity-panel__table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Действие</th>
                  <th>Тип</th>
                </tr>
              </thead>
              <tbody>
                {(logs ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted">
                      Записей пока нет
                    </td>
                  </tr>
                ) : (
                  logs!.map((row) => (
                    <tr key={row.id}>
                      <td>{fmtDate(row.created_at)}</td>
                      <td>{row.activity}</td>
                      <td>{row.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
