import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { MeResponse } from '../../shared/api/auth'
import { inventoryEditPanelHome, laborantPanelHome } from '../../shared/auth/panelNav'
import { isDemoBuild } from '../../shared/lib/demoEnv'
import { staticAssetUrl } from '../../shared/lib/staticAssetUrl'
import logoUrl from '../../assets/images/logo.jpg'

function DemoWatermark() {
  if (!isDemoBuild()) return null
  return (
    <div className="app-header__demo-watermark" role="note">
      Демонстрационная версия. Данные вымышленные
    </div>
  )
}

function UserAvatar({ username, imgUrl }: { username: string; imgUrl?: string }) {
  const initial = (username?.[0] ?? '?').toUpperCase()
  const [imgFailed, setImgFailed] = useState(false)
  const resolvedUrl = imgUrl ? staticAssetUrl(imgUrl) : undefined
  const showPhoto = Boolean(resolvedUrl) && !imgFailed

  useEffect(() => {
    setImgFailed(false)
  }, [imgUrl])

  return (
    <span className="user-avatar-wrap">
      <span className={`user-avatar${showPhoto ? ' user-avatar--photo' : ''}`} data-initial={initial} aria-hidden>
        {showPhoto ? (
          <img className="user-avatar__img" src={resolvedUrl} alt="" onError={() => setImgFailed(true)} />
        ) : (
          <span className="user-avatar__letter">{initial}</span>
        )}
      </span>
      {showPhoto && (
        <span className="user-avatar__pop" aria-hidden>
          <img src={resolvedUrl} alt="" />
        </span>
      )}
    </span>
  )
}

function closeMenus(setOpen: (v: boolean) => void, setNotifOpen: (v: boolean) => void, setMenuOpen: (v: boolean) => void) {
  setOpen(false)
  setNotifOpen(false)
  setMenuOpen(false)
}

export function Header({ me, onLogout }: { me: MeResponse | null; onLogout: () => Promise<void> }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const menuId = 'app-nav-menu'
  const drawerId = 'app-nav-drawer'

  const isAuth = location.pathname === '/auth' || location.pathname.startsWith('/auth/')

  useEffect(() => {
    setOpen(false)
    setNotifOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('body--nav-open', menuOpen)
    return () => document.body.classList.remove('body--nav-open')
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const editPanelPath = me ? inventoryEditPanelHome(me.role) : null
  const laborantPath = me ? laborantPanelHome(me.role) : null
  const showWriteOffsNav = me && ['admin', 'inventory_manager'].includes(me.role)

  const brandBlock = (
    <div className="app-header__brand-block">
      <Link to="/" className="app-header__logo" aria-label="На главную">
        <img src={logoUrl} alt="Лого" />
      </Link>
      <Link to="/" className="app-header__brand">
        ISIT-Инвентарь
      </Link>
    </div>
  )

  const navLinks = (
    <>
      <Link className="app-header__drawer-link" to="/equipment" onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}>
        Оборудование
      </Link>
      <Link className="app-header__drawer-link" to="/tickets" onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}>
        Заявки
      </Link>
      <Link className="app-header__drawer-link" to="/documents" onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}>
        Документы
      </Link>
      {showWriteOffsNav && (
        <Link className="app-header__drawer-link" to="/writeoffs" onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}>
          Списание
        </Link>
      )}
    </>
  )

  if (isAuth) {
    return (
      <header className="app-header">
        <DemoWatermark />
        {brandBlock}
      </header>
    )
  }

  return (
    <header className="app-header">
      <DemoWatermark />
      <div className="app-header__row">
        {brandBlock}

        <div className="app-header__desktop-nav">
          <div className="dropdown" ref={ref}>
            <button
              type="button"
              className="dropdown__toggle"
              aria-expanded={open ? 'true' : 'false'}
              aria-haspopup="menu"
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              Навигация <span aria-hidden>▾</span>
            </button>
            {open && (
              <ul className="dropdown__menu" id={menuId}>
                <li>
                  <Link className="dropdown__item" to="/equipment" onClick={() => setOpen(false)}>
                    Оборудование
                  </Link>
                </li>
                <li>
                  <Link className="dropdown__item" to="/tickets" onClick={() => setOpen(false)}>
                    Заявки
                  </Link>
                </li>
                <li>
                  <Link className="dropdown__item" to="/documents" onClick={() => setOpen(false)}>
                    Документы
                  </Link>
                </li>
                {showWriteOffsNav && (
                  <li>
                    <Link className="dropdown__item" to="/writeoffs" onClick={() => setOpen(false)}>
                      Списание
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {editPanelPath && me && (
            <Link className="btn btn--secondary btn--sm" to={editPanelPath}>
              Режим редактирования
            </Link>
          )}
          {laborantPath && me && (
            <Link className="btn btn--secondary btn--sm" to={laborantPath}>
              Панель лаборанта
            </Link>
          )}

          <div className="app-header__spacer" />

          <div className="app-header__user">
            {me ? (
              <>
                <div className="header-bell" ref={notifRef}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    aria-expanded={notifOpen}
                    onClick={() => setNotifOpen((v) => !v)}
                    title="Уведомления"
                  >
                    Уведомления <span aria-hidden>▾</span>
                  </button>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown__title">Уведомления</div>
                      <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                        Пока нет уведомлений. Здесь появятся события для вашего аккаунта.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="header-profile-trigger"
                  onClick={() => navigate('/profile')}
                  title="Профиль"
                >
                  <UserAvatar username={me.username} imgUrl={me.img_url} />
                  <span className="app-header__username">{me.username}</span>
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => void onLogout()}>
                  Выйти
                </button>
              </>
            ) : (
              <Link className="btn btn--secondary btn--sm" to="/auth">
                Войти
              </Link>
            )}
          </div>
        </div>

        <div className="app-header__mobile-actions">
          {me ? (
            <button
              type="button"
              className="header-profile-trigger header-profile-trigger--icon"
              onClick={() => navigate('/profile')}
              title="Профиль"
              aria-label={`Профиль: ${me.username}`}
            >
              <UserAvatar username={me.username} imgUrl={me.img_url} />
            </button>
          ) : (
            <Link className="btn btn--secondary btn--sm" to="/auth">
              Войти
            </Link>
          )}
          <button
            type="button"
            className="app-header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls={drawerId}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`app-header__menu-icon${menuOpen ? ' app-header__menu-icon--open' : ''}`} aria-hidden />
          </button>
        </div>
      </div>

      {menuOpen &&
        createPortal(
          <div className="app-header__overlay" role="presentation">
            <button
              type="button"
              className="app-header__backdrop"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="app-header__drawer" id={drawerId} aria-label="Навигация">
              <div className="app-header__drawer-head">
                <div className="app-header__drawer-head-row">
                  <span className="app-header__drawer-title">Меню</span>
                  <button
                    type="button"
                    className="app-header__drawer-close"
                    aria-label="Закрыть меню"
                    onClick={() => setMenuOpen(false)}
                  >
                    ×
                  </button>
                </div>
                {me && <span className="app-header__drawer-user muted">{me.username}</span>}
              </div>
              <div className="app-header__drawer-links">{navLinks}</div>
              {me && (editPanelPath || laborantPath) && (
                <div className="app-header__drawer-section">
                  <span className="app-header__drawer-section-title">Панели</span>
                  {editPanelPath && (
                    <Link
                      className="app-header__drawer-link"
                      to={editPanelPath}
                      onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}
                    >
                      Режим редактирования
                    </Link>
                  )}
                  {laborantPath && (
                    <Link
                      className="app-header__drawer-link"
                      to={laborantPath}
                      onClick={() => closeMenus(setOpen, setNotifOpen, setMenuOpen)}
                    >
                      Панель лаборанта
                    </Link>
                  )}
                </div>
              )}
              {me && (
                <div className="app-header__drawer-section">
                  <span className="app-header__drawer-section-title">Уведомления</span>
                  <p className="muted app-header__drawer-note">Пока нет уведомлений.</p>
                </div>
              )}
              {me && (
                <div className="app-header__drawer-foot">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm app-header__drawer-logout"
                    onClick={() => {
                      setMenuOpen(false)
                      void onLogout()
                    }}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </nav>
          </div>,
          document.body,
        )}
    </header>
  )
}
