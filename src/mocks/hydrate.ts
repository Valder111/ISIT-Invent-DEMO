import { isDemoBuild } from '../shared/lib/demoEnv'
import { demoStaticUrlForKey } from './demoPlaceholders'
import { isObjectKey, presignUrl } from './demoStorage'

type WithImg = { img?: string; img_url?: string }
type WithQr = { qr_img?: string; qr_img_url?: string }
type WithUrl = { object_key?: string; url?: string }

export function presignIfKey(key: string | undefined | null): string | undefined {
  if (!key) return undefined
  if (key.startsWith('/static/')) return key
  if (isObjectKey(key)) {
    if (isDemoBuild()) return demoStaticUrlForKey(key)
    return presignUrl(key)
  }
  return undefined
}

export function hydrateImg<T extends WithImg>(entity: T): T {
  if (!entity.img) return entity
  const url = presignIfKey(entity.img) ?? entity.img_url
  return url ? { ...entity, img_url: url } : entity
}

export function hydrateImgList<T extends WithImg>(list: T[]): T[] {
  return list.map(hydrateImg)
}

export function hydrateInstance<T extends WithImg & WithQr>(entity: T): T {
  let out = hydrateImg(entity)
  if (entity.qr_img) {
    const qr = presignIfKey(entity.qr_img)
    if (qr) out = { ...out, qr_img_url: qr }
  }
  return out
}

export function hydrateDocument<T extends WithUrl>(doc: T): T {
  if (!doc.object_key) return doc
  const url = presignIfKey(doc.object_key)
  return url ? { ...doc, url } : doc
}

export function hydrateDocuments<T extends WithUrl>(docs: T[]): T[] {
  return docs.map(hydrateDocument)
}
