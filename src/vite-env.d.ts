/// <reference types="vite/client" />

// HTTPS-DEPLOY-LOGIC: опциональные переменные только для production-сборки
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PUBLIC_APP_URL?: string
  readonly VITE_BASE_URL?: string
  readonly VITE_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
