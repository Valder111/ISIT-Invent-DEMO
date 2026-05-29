import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { store } from './shared/store/index.ts'
import { isDemoBuild } from './shared/lib/demoEnv.ts'

const Router = isDemoBuild() ? HashRouter : BrowserRouter

async function bootstrap() {
  if (isDemoBuild()) {
    try {
      const { startMsw } = await import('./mocks/browser.ts')
      await startMsw()
    } catch (err) {
      console.error('[demo] MSW failed to start — API mock не работает', err)
    }
  }

  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
  )
}

void bootstrap()
