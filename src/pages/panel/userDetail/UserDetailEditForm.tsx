import type { FormEvent } from 'react'
import type { UserRole } from '../../../shared/api/auth'
import type { UserDetail } from '../../../shared/api/users'
import { roleRu } from '../../../shared/lib/ruLabels'
import { ImgUploadField } from '../../../shared/ui/ImgUploadField'
import { fmt } from './panelUserDetailUtils'

export function UserDetailEditForm({
  user,
  username,
  setUsername,
  email,
  setEmail,
  role,
  setRole,
  password,
  setPassword,
  imgKey,
  setImgKey,
  isActive,
  setIsActive,
  comment,
  setComment,
  pending,
  onSubmit,
}: {
  user: UserDetail
  username: string
  setUsername: (v: string) => void
  email: string
  setEmail: (v: string) => void
  role: UserRole
  setRole: (v: UserRole) => void
  password: string
  setPassword: (v: string) => void
  imgKey: string
  setImgKey: (v: string) => void
  isActive: boolean
  setIsActive: (v: boolean) => void
  comment: string
  setComment: (v: string) => void
  pending: boolean
  onSubmit: (e: FormEvent) => void
}) {
  return (
    <form className="form-grid panel-user-detail__form" onSubmit={onSubmit}>
      <ImgUploadField
        label="Фото профиля"
        prefix="users"
        value={imgKey}
        onChange={setImgKey}
        existingPreviewUrl={user.img_url}
        disabled={pending}
      />

      <label className="field">
        <span className="field__label">Имя</span>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} disabled={pending} />
      </label>
      <label className="field">
        <span className="field__label">Эл. почта</span>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} />
      </label>
      <label className="field">
        <span className="field__label">Роль</span>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={pending}>
          <option value="user">{roleRu('user')}</option>
          <option value="laborant">{roleRu('laborant')}</option>
          <option value="inventory_manager">{roleRu('inventory_manager')}</option>
          <option value="admin">{roleRu('admin')}</option>
        </select>
      </label>
      <label className="field">
        <span className="field__label">Новый пароль</span>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Оставьте пустым, если не меняете"
          disabled={pending}
        />
      </label>
      <label className="field">
        <span className="field__label">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={pending} /> Активен
        </span>
      </label>
      <label className="field">
        <span className="field__label">Комментарий</span>
        <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} disabled={pending} />
      </label>

      <table className="attr-table attr-table--fit panel-user-detail__meta-table">
        <tbody>
          <tr>
            <th>Создан</th>
            <td>{fmt(user.created_at)}</td>
          </tr>
          <tr>
            <th>Обновлён</th>
            <td>{fmt(user.updated_at)}</td>
          </tr>
        </tbody>
      </table>

      <div className="actions-row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
