/** Статические SVG вместо MinIO/demo-files для seed-ключей в демо-сборке. */
export function demoStaticUrlForKey(key: string): string {
  const k = key.replace(/^\/+/, '').toLowerCase()
  if (k.startsWith('qr/')) return '/static/images/placeholders/qr.svg'
  if (k.startsWith('equipment/')) {
    if (k.includes('switch')) return '/static/images/placeholders/equipment_switch.svg'
    return '/static/images/placeholders/equipment_pc.svg'
  }
  if (k.startsWith('models/')) {
    if (k.includes('switch') || k.includes('network')) return '/static/images/placeholders/model_network.svg'
    if (k.includes('monitor')) return '/static/images/placeholders/model_monitor.svg'
    if (k.includes('cat6') || k.includes('cable')) return '/static/images/placeholders/model_cable.svg'
    return '/static/images/placeholders/model_pc.svg'
  }
  if (k.startsWith('types/')) {
    if (k.includes('network')) return '/static/images/placeholders/type_network.svg'
    if (k.includes('peripheral')) return '/static/images/placeholders/type_peripheral.svg'
    if (k.includes('consum')) return '/static/images/placeholders/type_consumables.svg'
    return '/static/images/placeholders/type_workstation.svg'
  }
  return '/static/images/placeholders/document.svg'
}
