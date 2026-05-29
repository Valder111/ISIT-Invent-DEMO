import type { ReactNode } from 'react'
import '../../css/equipment-detail-page.css'
import { SafeImage } from '../../shared/ui/SafeImage'

export type DetailRow = { label: string; value: ReactNode }

type Props = {
  title: string
  rows: DetailRow[]
  imageUrl?: string | null
  children?: ReactNode
}

export function EquipmentDetailShell({ title, rows, imageUrl, children }: Props) {
  return (
    <div className="equipment-detail-page">
      <h1 className="page-title">{title}</h1>
      <div className="detail-grid detail-grid--spaced equipment-detail-layout">
        <div className="equipment-detail-main">
          <table className="attr-table attr-table--fit">
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th>{r.label}</th>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {children}
        </div>
        <div className="equipment-detail-photo">
          <div className="detail-photo">
            <SafeImage src={imageUrl} alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}
