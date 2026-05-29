import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../../shared/api/http'
import { activityApi, type ActivityLog } from '../../../shared/api/activity'
import { instancesApi } from '../../../shared/api/equipment'
import { ticketsApi } from '../../../shared/api/tickets'
import { documentsApi } from '../../../shared/api/documents'
import { reportsApi } from '../../../shared/api/reports'
import { usersApi } from '../../../shared/api/users'
import type { UserRole } from '../../../shared/api/auth'
import { useAuthState } from '../../../shared/auth/useAuthState'
import '../../../css/main.css'
import '../../../css/panel.css'
import '../../../css/main-page.css'
import { MainActivityPanel } from './MainActivityPanel'
import { MainNavCards } from './MainNavCards'
import { MainStatsPanel } from './MainStatsPanel'
import { canOpenWriteOffs, canSeeUserDirectory, canUseEquipmentReport, type Stats } from './mainPagePermissions'

export function MainPage() {
  const { me } = useAuthState()
  const role = me?.role as UserRole | undefined
  const showWriteOffsCard = canOpenWriteOffs(role)
  const showActivityLog = Boolean(me && me.role !== 'user')
  const [logs, setLogs] = useState<ActivityLog[] | null>(null)
  const [logErr, setLogErr] = useState<string | null>(null)
  const [logLoading, setLogLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsErr, setStatsErr] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const showUserStat = useMemo(() => canSeeUserDirectory(me?.role), [me?.role])

  useEffect(() => {
    let cancelled = false
    if (!me || me.role === 'user') {
      setLogs(null)
      setLogErr(null)
      setLogLoading(false)
      return () => {
        cancelled = true
      }
    }
    async function run() {
      setLogLoading(true)
      setLogErr(null)
      try {
        const list = await activityApi.list({ limit: 20, offset: 0 })
        if (!cancelled) setLogs(list)
      } catch (e) {
        if (!cancelled) setLogErr(e instanceof ApiError ? e.message : 'Ошибка загрузки журнала')
      } finally {
        if (!cancelled) setLogLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [me])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setStatsLoading(true)
      setStatsErr(null)
      const next: Stats = {
        equipment: null,
        tickets: null,
        documents: null,
      }
      try {
        if (canUseEquipmentReport(me?.role as UserRole | undefined)) {
          const rep = await reportsApi.equipmentStatus()
          const rows = rep?.data
          let eqTotal: number | null = null
          if (Array.isArray(rows)) {
            eqTotal = rows.reduce((acc, row) => acc + (Number(row.count) || 0), 0)
          }
          if (!cancelled) next.equipment = eqTotal
        }

        const { data: eqList, meta: eqMeta } = await instancesApi.listWithMeta()
        if (!cancelled && (!canUseEquipmentReport(role) || next.equipment === null || next.equipment === 0)) {
          next.equipment =
            eqMeta?.total ?? (Array.isArray(eqList) && eqList.length > 0 ? eqList.length : null)
        }

        const tix = await ticketsApi.list()
        if (!cancelled) next.tickets = tix.length

        const docs = await documentsApi.list()
        if (!cancelled) next.documents = docs.length

        if (role && showUserStat) {
          const { data, meta } = await usersApi.listWithMeta()
          if (!cancelled) next.users = meta?.total ?? data.length
        }

        if (!cancelled) setStats(next)
      } catch (e) {
        if (!cancelled) setStatsErr(e instanceof ApiError ? e.message : 'Ошибка статистики')
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [me?.role, showUserStat, role])

  const staffLink =
    me && me.role !== 'user' ? (
      <Link className="btn btn--secondary btn--sm" to="/logs">
        Все записи журнала
      </Link>
    ) : null

  return (
    <div className="main-page">
      <h1 className="welcome-h1">Добро пожаловать, {me?.username ?? 'пользователь'}</h1>

      <MainStatsPanel statsLoading={statsLoading} statsErr={statsErr} stats={stats} showUserStat={showUserStat} />

      <MainNavCards showWriteOffsCard={showWriteOffsCard} />

      {showActivityLog && <MainActivityPanel staffLink={staffLink} logLoading={logLoading} logErr={logErr} logs={logs} />}
    </div>
  )
}
