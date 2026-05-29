import { useEffect, useState } from 'react'
import { ApiError } from '../../shared/api/http'
import { reportsApi, downloadReportPdf } from '../../shared/api/reports'
import '../../css/panel.css'

export function ReportsPage() {
  const [eqErr, setEqErr] = useState<string | null>(null)
  const [lErr, setLErr] = useState<string | null>(null)
  const [eqSummary, setEqSummary] = useState<unknown>(null)
  const [lSummary, setLSummary] = useState<unknown>(null)
  const [pdfErr, setPdfErr] = useState<string | null>(null)

  useEffect(() => {
    let c = false
    async function run() {
      setEqErr(null)
      setLErr(null)
      try {
        const r = await reportsApi.equipmentStatus()
        if (!c) setEqSummary(r)
      } catch (e) {
        if (!c) setEqErr(e instanceof ApiError ? e.message : 'Ошибка')
      }
      try {
        const r = await reportsApi.laborantLoad()
        if (!c) setLSummary(r)
      } catch (e) {
        if (!c) setLErr(e instanceof ApiError ? e.message : 'Ошибка')
      }
    }
    void run()
    return () => {
      c = true
    }
  }, [])

  async function dl(path: string, name: string) {
    setPdfErr(null)
    try {
      await downloadReportPdf(path, name)
    } catch (e) {
      setPdfErr(e instanceof ApiError ? e.message : 'Ошибка скачивания')
    }
  }

  return (
    <div>
      <h1 className="page-title">Отчёты</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Агрегированные данные и выгрузка в PDF. Доступ по ролям согласно настройкам сервера.
      </p>

      {pdfErr && <div className="alert alert--error">{pdfErr}</div>}

      <section className="panel">
        <div className="panel__header">
          <h2 className="panel__title">Оборудование по статусам</h2>
        </div>
        <div className="panel__body">
          <div className="actions-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => void dl('/api/reports/equipment-status.pdf', 'equipment-status.pdf')}>
              Скачать PDF
            </button>
          </div>
          {eqErr && <div className="alert alert--error">{eqErr}</div>}
          {!eqErr && eqSummary != null && (
            <pre style={{ fontSize: 13, overflow: 'auto', maxHeight: 240, margin: 0 }}>{JSON.stringify(eqSummary, null, 2)}</pre>
          )}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel__header">
          <h2 className="panel__title">Нагрузка лаборантов</h2>
        </div>
        <div className="panel__body">
          <div className="actions-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => void dl('/api/reports/laborant-load.pdf', 'laborant-load.pdf')}>
              Скачать PDF
            </button>
          </div>
          {lErr && <div className="alert alert--error">{lErr}</div>}
          {!lErr && lSummary != null && (
            <pre style={{ fontSize: 13, overflow: 'auto', maxHeight: 240, margin: 0 }}>{JSON.stringify(lSummary, null, 2)}</pre>
          )}
        </div>
      </section>
    </div>
  )
}
