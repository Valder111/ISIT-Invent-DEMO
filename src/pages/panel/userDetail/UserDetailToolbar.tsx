import { Link } from 'react-router-dom'

export function UserDetailToolbar({ userId }: { userId: number }) {
  return (
    <div className="tickets-toolbar">
      <h2 className="page-title">Пользователь #{userId}</h2>
      <Link className="btn btn--secondary btn--sm" to="/panel/admin/users">
        К списку
      </Link>
    </div>
  )
}
