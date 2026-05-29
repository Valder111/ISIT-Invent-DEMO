import { useEffect, useRef, useState } from 'react'
import { authApi } from '../../shared/api/auth'
import { useAuthState } from '../../shared/auth/useAuthState'
import { uploadFile } from '../../shared/api/files'
import { ApiError } from '../../shared/api/http'
import { roleRu } from '../../shared/lib/ruLabels'
import '../../css/panel.css'
import '../../css/profile-page.css'

export function ProfilePage() {
  const { me, refreshMe } = useAuthState()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState(false)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (me) {
      setUsername(me.username ?? '')
      setEmail(me.email ?? '')
    }
  }, [me])

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !me) return
    setUploading(true)
    setErr(null)
    setMsg(null)
    try {
      const up = await uploadFile(f, 'users')
      await authApi.patchMe({ img: up.key })
      await refreshMe()
      setMsg('Фото профиля сохранено.')
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка загрузки или сохранения')
    } finally {
      setUploading(false)
    }
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!me) return
    setPending(true)
    setErr(null)
    setMsg(null)
    try {
      const body: {
        username?: string
        email?: string
        current_password?: string
        new_password?: string
      } = {}
      if (username.trim() && username.trim() !== me.username) body.username = username.trim()
      if (email.trim() && email.trim() !== me.email) body.email = email.trim()
      if (newPassword) {
        body.new_password = newPassword
        body.current_password = currentPassword
      }
      await authApi.patchMe(body)
      setCurrentPassword('')
      setNewPassword('')
      await refreshMe()
      setMsg('Изменения сохранены.')
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка сохранения')
    } finally {
      setPending(false)
    }
  }

  if (!me) return <p className="muted">Нет данных профиля</p>

  return (
    <div className="profile-page">
      <h1 className="page-title">Профиль</h1>

      <div className="profile-layout">
        <div className="profile-avatar-box">
          {me.img_url ? (
            <img src={me.img_url} alt="" />
          ) : (
            <div className="profile-avatar-placeholder">{(me.username?.[0] ?? '?').toUpperCase()}</div>
          )}
          <p className="muted" style={{ marginTop: 12, fontSize: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploading}
              aria-hidden
              onChange={(e) => void onPhoto(e)}
            />
            <button type="button" className="btn btn--secondary btn--sm" disabled={uploading} onClick={() => photoInputRef.current?.click()}>
              Загрузить
            </button>
            {uploading && <span>Загрузка…</span>}
          </p>
        </div>

        <div>
          {msg && <div className="alert" style={{ marginBottom: 12 }}>{msg}</div>}
          {err && <div className="alert alert--error">{err}</div>}

          <table className="attr-table attr-table--fit">
            <tbody>
              <tr>
                <th>Имя пользователя</th>
                <td>{me.username}</td>
              </tr>
              <tr>
                <th>Эл. почта</th>
                <td>{me.email}</td>
              </tr>
              <tr>
                <th>Роль</th>
                <td>{roleRu(me.role)}</td>
              </tr>
              <tr>
                <th>Статус</th>
                <td>{me.is_active === false ? 'Неактивен' : 'Активен'}</td>
              </tr>
              <tr>
                <th>Комментарий</th>
                <td>{me.comment || '—'}</td>
              </tr>
            </tbody>
          </table>

          <form className="panel" style={{ marginTop: 20 }} onSubmit={(e) => void onSaveProfile(e)}>
            <div className="panel__header">
              <h2 className="panel__title">Личные данные</h2>
            </div>
            <div className="panel__body form-grid">
              <label className="field">
                <span className="field__label">Имя пользователя</span>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={100} />
              </label>
              <label className="field">
                <span className="field__label">Эл. почта</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <p className="muted">Смена пароля — укажите текущий и новый (необязательно).</p>
              <label className="field">
                <span className="field__label">Текущий пароль</span>
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={pending}
                />
              </label>
              <label className="field">
                <span className="field__label">Новый пароль</span>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={pending}
                  minLength={6}
                />
              </label>
              <div className="actions-row">
                <button type="submit" className="btn" disabled={pending}>
                  {pending ? 'Сохранение…' : 'Сохранить изменения'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
