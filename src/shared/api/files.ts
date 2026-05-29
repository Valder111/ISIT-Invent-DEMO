import { assertUploadSize } from '../lib/uploadLimits'
import { generatedApi, generatedRequest } from './generatedClient'
import type { FilesBrowseListParams, FilesCreateParams, FilesPresignListParams } from './generated/data-contracts'
import { ApiError } from './http'

export type FileUploadResponse = {
  key: string
  url?: string
}

export type PresignResponse = {
  key: string
  url: string
  expires?: number
}

export type ListedStorageObject = {
  key: string
  size: number
  last_modified: string
  content_type?: string
  /** Имя файла из documents.filename, если объект зарегистрирован как документ */
  filename?: string
}

export type FileBrowseResponse = {
  items: ListedStorageObject[]
  next_cursor?: string
}

function toBrowseQuery(opts?: {
  prefix?: string
  recursive?: boolean
  limit?: number
  cursor?: string
}): FilesBrowseListParams {
  return {
    prefix: opts?.prefix?.replace(/^\//, ''),
    recursive: opts?.recursive === false ? false : undefined,
    limit: opts?.limit != null && opts.limit > 0 ? opts.limit : undefined,
    cursor: opts?.cursor,
  }
}

function toCreateQuery(prefix?: string): FilesCreateParams {
  return prefix ? { prefix: prefix.replace(/^\//, '') } : {}
}

/** Multipart upload to MinIO; returns object key for img / document fields */
export async function uploadFile(file: File, prefix?: string): Promise<FileUploadResponse> {
  try {
    assertUploadSize(file, prefix)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Файл слишком большой'
    throw new ApiError(msg, { code: 'FILE_TOO_LARGE', field: 'file' })
  }

  return generatedRequest<FileUploadResponse>(() =>
    generatedApi.files.filesCreate(toCreateQuery(prefix), { file }),
  )
}

/** Листинг объектов MinIO (лаборант / мат. ответственный / админ). */
export function browseStorage(opts?: { prefix?: string; recursive?: boolean; limit?: number; cursor?: string }) {
  return generatedRequest<FileBrowseResponse>(() => generatedApi.files.filesBrowseList(toBrowseQuery(opts)))
}

/** Удаление объекта из MinIO (роли admin и laborant на сервере). */
export async function deleteStorageObject(key: string): Promise<void> {
  await generatedRequest<unknown>(() => generatedApi.files.filesDelete({ key }))
}

export async function presignGet(key: string, expiresSec?: number): Promise<PresignResponse> {
  const query: FilesPresignListParams = { key }
  if (expiresSec != null) query.expires = expiresSec
  return generatedRequest<PresignResponse>(() => generatedApi.files.filesPresignList(query))
}
