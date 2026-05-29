import type { WriteOff } from '../../../shared/api/writeoffs'
import { fmt } from './writeoffsPageUtils'

export function WriteOffsHistoryTable({ rows, loading, err }: { rows: WriteOff[] | null; loading: boolean; err: string | null }) {
  return (
    <section className="panel writeoffs-page__history">
      <div className="panel__header">
        <h2 className="panel__title">Журнал списаний</h2>
      </div>
      <div className="panel__body">
        {loading && <p className="muted">Загрузка…</p>}
        {err && <div className="alert alert--error">{err}</div>}
        {!loading && !err && rows && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Акт</th>
                  <th>Название</th>
                  <th>Кол-во</th>
                  <th>Экземпляр</th>
                  <th>Модель</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      Записей нет
                    </td>
                  </tr>
                ) : (
                  rows.map((w) => (
                    <tr key={w.id}>
                      <td>{w.id}</td>
                      <td>
                        <code>{w.act_number}</code>
                      </td>
                      <td>{w.name}</td>
                      <td>{w.quantity}</td>
                      <td>{w.item_id != null ? `#${w.item_id}` : '—'}</td>
                      <td>{w.model?.name ?? w.model_id}</td>
                      <td>{fmt(w.created_at)}</td>
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
