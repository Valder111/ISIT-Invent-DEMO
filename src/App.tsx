import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/layout/AppLayout'
import { CategoryDetailPage } from './pages/equipment/CategoryDetailPage'
import { EquipmentListPage } from './pages/equipment/list/EquipmentListPage'
import { GlobalSearchPage } from './pages/equipment/globalSearch/GlobalSearchPage'
import { InstanceDetailPage } from './pages/equipment/InstanceDetailPage'
import { ModelDetailPage } from './pages/equipment/ModelDetailPage'
import { MainPage } from './pages/main/home/MainPage'
import { AuthPage } from './pages/auth/AuthPage'
import { TicketCreatePage } from './pages/tickets/TicketCreatePage'
import { TicketDetailPage } from './pages/tickets/detail/TicketDetailPage'
import { TicketsListPage } from './pages/tickets/TicketsListPage'
import { RequireAuth } from './shared/auth/RequireAuth'
import { RequirePanel } from './shared/auth/RequirePanel'
import { RequireRole } from './shared/auth/RequireRole'
import { AuthSessionSync } from './shared/auth/AuthSessionSync'
import { PanelLayout } from './pages/panel/PanelLayout'
import { PanelEquipmentSection } from './pages/panel/equipment/PanelEquipmentSection'
import { PanelTicketsSection } from './pages/panel/tickets/PanelTicketsSection'
import { PanelUsersPage } from './pages/panel/PanelUsersPage'
import { PanelUserDetailPage } from './pages/panel/userDetail/PanelUserDetailPage'
import { PanelLaborantQueueSection } from './pages/panel/PanelLaborantQueueSection'
import { PanelStorageSection } from './pages/panel/PanelStorageSection'
import { ProfilePage } from './pages/profile/ProfilePage'
import { DocumentsPage } from './pages/documents/DocumentsPage'
import { LogsFullPage } from './pages/logs_page/LogsFullPage'
import { WriteOffsPage } from './pages/writeoffs/page/WriteOffsPage'

function App() {
  return (
    <>
      <AuthSessionSync />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/auth" element={<AuthPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <MainPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment"
            element={
              <RequireAuth>
                <EquipmentListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment/search"
            element={
              <RequireAuth>
                <GlobalSearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment/category/:id"
            element={
              <RequireAuth>
                <CategoryDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment/model/:id"
            element={
              <RequireAuth>
                <ModelDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment/instance/:id"
            element={
              <RequireAuth>
                <InstanceDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/equipment/scan/:qrToken"
            element={
              <RequireAuth>
                <InstanceDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tickets"
            element={
              <RequireAuth>
                <TicketsListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <RequireAuth>
                <TicketCreatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <RequireAuth>
                <TicketDetailPage />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/documents"
            element={
              <RequireAuth>
                <DocumentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/logs"
            element={
              <RequireAuth>
                <RequireRole allowed={['laborant', 'inventory_manager', 'admin']}>
                  <LogsFullPage />
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route
            path="/writeoffs"
            element={
              <RequireAuth>
                <RequireRole allowed={['admin', 'inventory_manager']}>
                  <WriteOffsPage />
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route
            path="/panel/admin"
            element={
              <RequireAuth>
                <RequirePanel panel="admin">
                  <PanelLayout basePath="/panel/admin" panel="admin" />
                </RequirePanel>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="equipment" replace />} />
            <Route path="equipment" element={<PanelEquipmentSection panel="admin" />} />
            <Route path="tickets" element={<PanelTicketsSection panel="admin" />} />
            <Route path="storage" element={<PanelStorageSection />} />
            <Route path="users" element={<PanelUsersPage />} />
            <Route path="users/:id" element={<PanelUserDetailPage />} />
          </Route>

          <Route
            path="/panel/inventory"
            element={
              <RequireAuth>
                <RequirePanel panel="inventory">
                  <PanelLayout basePath="/panel/inventory" panel="inventory" />
                </RequirePanel>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="equipment" replace />} />
            <Route path="equipment" element={<PanelEquipmentSection panel="inventory" />} />
            <Route path="tickets" element={<PanelTicketsSection panel="inventory" />} />
          </Route>

          <Route
            path="/panel/laborant"
            element={
              <RequireAuth>
                <RequirePanel panel="laborant">
                  <PanelLayout basePath="/panel/laborant" panel="laborant" />
                </RequirePanel>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="equipment" replace />} />
            <Route path="queue" element={<PanelLaborantQueueSection />} />
            <Route path="equipment" element={<PanelEquipmentSection panel="laborant" />} />
            <Route path="tickets" element={<PanelTicketsSection panel="laborant" />} />
            <Route path="storage" element={<PanelStorageSection />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
