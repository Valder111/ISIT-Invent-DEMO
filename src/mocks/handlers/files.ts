import { http } from 'msw'
import { fail, ok } from '../httpEnvelope'
import { deleteObject, getObject, listObjects, presignUrl, putObject } from '../demoStorage'
import { requireAuth } from './common'
import { json } from './respond'

const MINIMAL_PDF = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 200 200]/Parent 2 0 R>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF'

export const fileHandlers = [
  http.get(/\/api\/demo-files\/.+/, async ({ request }) => {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^.*\/api\/demo-files\//, '')
    const key = decodeURIComponent(path)
    const obj = await getObject(key)
    if (!obj) return new Response('Not found', { status: 404 })
    return new Response(obj.blob, {
      status: 200,
      headers: { 'Content-Type': obj.contentType, 'Cache-Control': 'private, max-age=3600' },
    })
  }),

  http.post('/api/files', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const prefix = (url.searchParams.get('prefix') ?? 'uploads').replace(/^\/+/, '').replace(/\/+$/, '')

    const form = await request.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) {
      return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'file' }), { status: 400 })
    }

    const safeName = file.name.replace(/[^\w.\-()+ ]+/g, '_') || 'file'
    const key = `${prefix}/${Date.now()}-${safeName}`
    await putObject(key, file, file.type || 'application/octet-stream')
    return json(ok({ key, url: presignUrl(key) }))
  }),

  http.get('/api/files/presign', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const key = (url.searchParams.get('key') ?? '').replace(/^\/+/, '')
    if (!key) return json(fail('Некорректные данные', { field: 'key' }), { status: 400 })
    const obj = await getObject(key)
    if (!obj) return json(fail('Файл не найден'), { status: 404 })
    return json(ok({ key, url: presignUrl(key), expires: 3600 }))
  }),

  http.get('/api/files/browse', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const prefix = (url.searchParams.get('prefix') ?? '').replace(/^\/+/, '')
    const recursive = url.searchParams.get('recursive') !== 'false'
    const limit = Number(url.searchParams.get('limit') ?? 50)
    const cursor = url.searchParams.get('cursor') ?? undefined
    const { items, next_cursor } = await listObjects({ prefix, recursive, limit, cursor })
    return json(
      ok({
        items: items.map((o) => ({
          key: o.key,
          size: o.size,
          last_modified: o.lastModified,
          content_type: o.contentType,
          filename: o.key.split('/').pop() ?? o.key,
        })),
        next_cursor,
      }),
    )
  }),

  http.delete('/api/files', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    if (auth.me.role !== 'admin' && auth.me.role !== 'laborant') {
      return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    }
    const url = new URL(request.url)
    const key = (url.searchParams.get('key') ?? '').replace(/^\/+/, '')
    if (!key) return json(fail('Некорректные данные', { field: 'key' }), { status: 400 })
    await deleteObject(key)
    return json(ok({ message: 'deleted', key }))
  }),

  http.get('/api/equipment/:id/qr-label.pdf', () => {
    return new Response(MINIMAL_PDF, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="qr-label.pdf"' },
    })
  }),

  http.get('/api/models/:id/qr-labels.pdf', () => {
    return new Response(MINIMAL_PDF, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="qr-labels.pdf"' },
    })
  }),
]
