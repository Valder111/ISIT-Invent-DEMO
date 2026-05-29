import { NavLink, Outlet } from 'react-router-dom'
import type { PanelKind } from '../../shared/auth/RequirePanel'
import '../../css/panel.css'

const TITLES: Record<PanelKind, string> = {
  admin: 'Панель администратора',
  inventory: 'Панель материально ответственного',
  laborant: 'Панель лаборанта',
}

export function PanelLayout({ basePath, panel }: { basePath: string; panel: PanelKind }) {
  const title = TITLES[panel]
  const showUsers = panel === 'admin'
  const laborantQueue = panel === 'laborant'
  const showStorage = panel === 'admin' || panel === 'laborant'

  return (
    <div className="panel-page">
      <h1 className="page-title">{title}</h1>
      <nav className="panel-nav">
        {laborantQueue && (
          <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${basePath}/queue`}>
            Обработка заявок
          </NavLink>
        )}
        <NavLink end className={({ isActive }) => (isActive ? 'active' : '')} to={`${basePath}/equipment`}>
          Инвентарь и оборудование
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${basePath}/tickets`}>
          Заявки
        </NavLink>
        {showStorage && (
          <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${basePath}/storage`}>
            Хранилище файлов
          </NavLink>
        )}
        {showUsers && (
          <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${basePath}/users`}>
            Пользователи
          </NavLink>
        )}
      </nav>
      <Outlet />
    </div>
  )
}
