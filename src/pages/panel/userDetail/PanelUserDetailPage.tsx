import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/http'
import type { UserRole } from '../../../shared/api/auth'
import { usersApi, type UserAdminPatchBody, type UserDetail } from '../../../shared/api/users'
import '../../../css/panel.css'
import '../../../css/panel-user-detail.css'
import { UserDetailAlerts } from './UserDetailAlerts'
import { UserDetailEditForm } from './UserDetailEditForm'
import { UserDetailToolbar } from './UserDetailToolbar'

export function PanelUserDetailPage() {
  const { id } = useParams()
  const numId = Number(id)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [password, setPassword] = useState('')
  const [imgKey, setImgKey] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [comment, setComment] = useState('')

  async function load() {
    if (!Number.isFinite(numId)) {
      setErr('Некорректный ID')
      setLoading(false)
      return
    }
    setLoading(true)
    setErr(null)
    try {
      const u = await usersApi.get(numId)
      setUser(u)
      setUsername(u.username)
      setEmail(u.email)
      setRole(u.role)
      setImgKey(u.img ?? '')
      setIsActive(u.is_active !== false)
      setComment(u.comment ?? '')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [numId])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setPending(true)
    setSaveErr(null)
    setMsg(null)
    try {
      const body: UserAdminPatchBody = {
        username: username.trim() !== user.username ? username.trim() : undefined,
        email: email.trim() !== user.email ? email.trim() : undefined,
        role: role !== user.role ? role : undefined,
        img: imgKey !== (user.img ?? '') ? imgKey : undefined,
        is_active: isActive !== user.is_active ? isActive : undefined,
        comment: comment !== (user.comment ?? '') ? comment : undefined,
      }
      if (password.trim()) body.password = password.trim()
      const hasChange =
        body.username != null ||
        body.email != null ||
        body.role != null ||
        body.password != null ||
        body.img != null ||
        body.is_active != null ||
        body.comment != null
      if (!hasChange) {
        setMsg('Нет изменений для сохранения.')
        setPending(false)
        return
      }
      const updated = await usersApi.patch(user.id, body)
      setUser(updated)
      setPassword('')
      setMsg('Сохранено.')
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : 'Ошибка сохранения')
    } finally {
      setPending(false)
    }
  }

  if (loading) return <p className="muted">Загрузка…</p>
  if (err || !user) return <div className="alert alert--error">{err ?? 'Не найдено'}</div>

  return (
    <div>
      <UserDetailToolbar userId={user.id} />
      <UserDetailAlerts msg={msg} saveErr={saveErr} />
      <div className="profile-layout panel-user-detail__layout">
        <div className="profile-avatar-box">
          {user.img_url ? (
            <img src={user.img_url} alt="" />
          ) : (
            <div className="profile-avatar-placeholder">{(user.username?.[0] ?? '?').toUpperCase()}</div>
          )}
        </div>
        <UserDetailEditForm
          user={user}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          role={role}
          setRole={setRole}
          password={password}
          setPassword={setPassword}
          imgKey={imgKey}
          setImgKey={setImgKey}
          isActive={isActive}
          setIsActive={setIsActive}
          comment={comment}
          setComment={setComment}
          pending={pending}
          onSubmit={onSave}
        />
      </div>
    </div>
  )
}
