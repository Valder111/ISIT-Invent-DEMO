import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

let mswReady = false

export function isMswReady() {
  return mswReady
}

export async function startMsw() {
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`
  await worker.start({
    serviceWorker: {
      url: swUrl,
      options: { scope: import.meta.env.BASE_URL || '/' },
    },
    onUnhandledRequest(request, print) {
      if (request.url.includes('/api/')) {
        print.warning()
      }
    },
    quiet: false,
  })
  mswReady = true
  if (import.meta.env.DEV) {
    console.info('[demo] MSW active, service worker:', swUrl)
  }
  return worker
}

