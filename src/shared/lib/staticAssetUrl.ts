/** Нормализованный base path приложения (без trailing slash). */
export function appBasePath(): string {
  const envBase = import.meta.env.BASE_URL ?? '/'
  let normalized = envBase.replace(/\/+$/, '')
  if (normalized) return normalized

  if (typeof window !== 'undefined') {
    let path = window.location.pathname
    if (path.endsWith('/index.html')) {
      path = path.slice(0, -'/index.html'.length)
    }
    normalized = path.replace(/\/+$/, '')
    if (normalized) return normalized
  }

  return ''
}

/** Публичные файлы из /static/… с учётом Vite base (GitHub Pages subpath). */
export function staticAssetUrl(path: string): string {
  if (!path) return path
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const base = appBasePath()
  if (base && path.startsWith(`${base}/`)) {
    return path
  }

  if (path.startsWith('/static/')) {
    return `${base}${path}`
  }

  return path
}

/** Абсолютный путь внутри приложения (например /api/demo-files/…). */
export function withAppBase(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path

  const base = appBasePath()
  if (base && path.startsWith(`${base}/`)) return path
  return `${base}${path}`
}
