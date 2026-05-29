import { Outlet, useLocation } from 'react-router-dom'
import { useAuthState } from '../../shared/auth/useAuthState'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  const location = useLocation()
  const isAuth = location.pathname === '/auth' || location.pathname.startsWith('/auth/')
  const { me, logout } = useAuthState()

  return (
    <div className={isAuth ? 'app-shell app-shell--auth' : 'app-shell'}>
      <Header me={me} onLogout={logout} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
