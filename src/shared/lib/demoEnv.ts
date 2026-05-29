function truthy(v: unknown): boolean {
  if (typeof v !== 'string') return false
  const s = v.trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'on'
}

export function isDemoBuild(): boolean {
  return truthy(import.meta.env.VITE_DEMO)
}

