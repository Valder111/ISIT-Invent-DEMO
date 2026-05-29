import { cachedListFetchViaMeta } from './cache/fetch'
import { cacheKeys } from './cache/keys'
import { publishCacheStatus } from './cache/status'
import { apiAxios } from './axiosInstance'
import { generatedApi, generatedRequest } from './generatedClient'
import { ApiError, messageFromAxiosError } from './http'
import { isAxiosError } from 'axios'
import type { ResponseResponse } from './generated/data-contracts'

export type EquipmentStatusRow = {
  status: string
  count: number
}

export type ReportEquipmentStatusData = {
  report_type?: string
  data?: EquipmentStatusRow[]
}

export type LaborantLoadRow = Record<string, unknown>

export const reportsApi = {
  async equipmentStatus() {
    const r = await cachedListFetchViaMeta<ReportEquipmentStatusData>(cacheKeys.reportEquipmentStatus(), () =>
      generatedRequest(() => generatedApi.reports.reportsEquipmentStatusList()),
    )
    publishCacheStatus({
      resource: 'report:equipment-status',
      clientSource: r.source,
      serverCache: r.serverCache ?? r.meta?.cache,
      at: Date.now(),
    })
    return r.data
  },
  laborantLoad() {
    return generatedRequest<{ report_type?: string; data?: LaborantLoadRow[] }>(() =>
      generatedApi.reports.reportsLaborantLoadList(),
    )
  },
}

/** Скачать PDF-отчёт (сессия в cookie). */
export async function downloadReportPdf(apiPath: string, filename: string): Promise<void> {
  try {
    const res = await apiAxios.get(apiPath, { responseType: 'blob' })
    const blob = res.data as Blob
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    if (isAxiosError(e) && e.response?.data instanceof Blob) {
      try {
        const text = await e.response.data.text()
        const j = JSON.parse(text) as ResponseResponse
        if (j?.error?.message) {
          throw new ApiError(j.error.message, { status: e.response.status })
        }
      } catch (parseErr) {
        if (parseErr instanceof ApiError) throw parseErr
      }
    }
    if (e instanceof ApiError) throw e
    if (isAxiosError(e)) {
      throw new ApiError(messageFromAxiosError(e), { status: e.response?.status })
    }
    throw new ApiError('Ошибка скачивания')
  }
}
