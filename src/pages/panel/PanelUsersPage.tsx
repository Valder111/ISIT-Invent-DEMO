import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import type { UserRole } from '../../shared/api/auth'
import { usersApi, type UserListItem } from '../../shared/api/users'
import { roleRu, ynRu } from '../../shared/lib/ruLabels'
import '../../css/panel.css'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function PanelUsersPage() {
  const [list, setList] = useState<UserListItem[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'' | UserRole>('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'yes' | 'no'>('all')

  const [regOpen, setRegOpen] = useState(false)
  const [regUser, setRegUser] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('user')
  const [regPending, setRegPending] = useState(false)
  const [regErr, setRegErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      setList(await usersApi.list())
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (!list) return []
    const q = search.trim().toLowerCase()
    return list.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (activeFilter === 'yes' && !u.is_active) return false
      if (activeFilter === 'no' && u.is_active) return false
      if (!q) return true
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
  }, [list, search, roleFilter, activeFilter])

  async function onRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegPending(true)
    setRegErr(null)
    try {
      await usersApi.create({
        username: regUser.trim(),
        email: regEmail.trim(),
        password: regPass,
        role: regRole,
      })
      setRegUser('')
      setRegEmail('')
      setRegPass('')
      setRegRole('user')
      setRegOpen(false)
      await load()
    } catch (ex) {
      setRegErr(ex instanceof ApiError ? ex.message : 'Ошибка регистрации')
    } finally {
      setRegPending(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Пользователи</h2>
        <button type="button" className="btn btn--sm" onClick={() => setRegOpen((v) => !v)}>
          {regOpen ? 'Отмена' : '+ Зарегистрировать пользователя'}
        </button>
      </div>
      <div className="panel__body">
        {regOpen && (
          <form className="panel" style={{ marginBottom: 16, padding: '12px 14px' }} onSubmit={(e) => void onRegister(e)}>
            <h3 className="panel__title" style={{ fontSize: 16, marginBottom: 10 }}>
              Новый пользователь
            </h3>
            {regErr && <div className="alert alert--error">{regErr}</div>}
            <div className="form-grid panel-form-grid">
              <label className="field">
                <span className="field__label">Имя пользователя</span>
                <input className="input" value={regUser} onChange={(e) => setRegUser(e.target.value)} required minLength={3} />
              </label>
              <label className="field">
                <span className="field__label">Эл. почта</span>
                <input className="input" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </label>
              <label className="field">
                <span className="field__label">Пароль</span>
                <input className="input" type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} required minLength={6} />
              </label>
              <label className="field">
                <span className="field__label">Роль</span>
                <select className="select" value={regRole} onChange={(e) => setRegRole(e.target.value as UserRole)}>
                  <option value="user">{roleRu('user')}</option>
                  <option value="laborant">{roleRu('laborant')}</option>
                  <option value="inventory_manager">{roleRu('inventory_manager')}</option>
                  <option value="admin">{roleRu('admin')}</option>
                </select>
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <div className="modal-actions__left">
                <button className="btn" type="submit" disabled={regPending}>
                  {regPending ? 'Сохранение…' : 'Создать'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="doc-filters" style={{ marginBottom: 12 }}>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Поиск (имя, эл. почта)</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="…" />
          </label>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Роль</span>
            <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as '' | UserRole)}>
              <option value="">Все</option>
              <option value="user">{roleRu('user')}</option>
              <option value="laborant">{roleRu('laborant')}</option>
              <option value="inventory_manager">{roleRu('inventory_manager')}</option>
              <option value="admin">{roleRu('admin')}</option>
            </select>
          </label>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Активность</span>
            <select className="select" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}>
              <option value="all">Все</option>
              <option value="yes">Активные</option>
              <option value="no">Неактивные</option>
            </select>
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            Обновить список
          </button>
        </div>

        {loading && <p className="muted">Загрузка…</p>}
        {err && <div className="alert alert--error">{err}</div>}
        {!loading && !err && list && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Эл. почта</th>
                  <th>Роль</th>
                  <th>Активен</th>
                  <th>Создан</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{roleRu(u.role)}</td>
                    <td>{ynRu(u.is_active)}</td>
                    <td>{fmt(u.created_at)}</td>
                    <td>
                      <EntityLink className="btn btn--ghost btn--sm" to={`/panel/admin/users/${u.id}`}>
                        Подробно
                      </EntityLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
