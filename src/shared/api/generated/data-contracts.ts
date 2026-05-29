/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ActivityListParams {
  /**
   * Лимит записей
   * @default 50
   */
  limit?: number;
  /**
   * Смещение
   * @default 0
   */
  offset?: number;
  /** Фильтр по типу */
  type?: string;
}

export interface DocsDeleteParams {
  /** ID документа */
  docId: number;
}

export interface DocsPartialUpdateParams {
  /** ID документа */
  docId: number;
}

export interface EquipmentDeleteParams {
  /** ID экземпляра */
  id: number;
}

export interface EquipmentDetailParams {
  /** ID экземпляра */
  id: number;
}

export interface EquipmentListParams {
  /** Категория */
  category?: string;
  /** Включить деактивированные экземпляры (только admin) */
  include_inactive?: boolean;
  /** ID локации */
  location_id?: number;
  /** Поиск по названию модели */
  search?: string;
  /** Статус (код) */
  status?: string;
}

export interface EquipmentQrDetailParams {
  /** QR-токен (UUID) */
  token: string;
}

export interface EquipmentQrLabelPdfListParams {
  /** ID экземпляра */
  id: number;
}

export interface EquipmentUpdateParams {
  /** ID экземпляра */
  id: number;
}

export interface FilesBrowseListParams {
  /** Продолжение листинга (значение next_cursor с прошлого ответа) */
  cursor?: string;
  /** Макс. число объектов (по умолчанию 50, макс. 500) */
  limit?: number;
  /** Префикс ключей */
  prefix?: string;
  /** Рекурсивный обход (по умолчанию true) */
  recursive?: boolean;
}

export interface FilesCreateParams {
  /** Префикс для ключа (например: users, equipment, models) */
  prefix?: string;
}

export interface FilesCreatePayload {
  /** Файл */
  file: File;
}

export interface FilesDeleteParams {
  /** Ключ объекта */
  key: string;
}

export interface FilesPresignListParams {
  /** Время жизни ссылки в секундах (по умолчанию 900) */
  expires?: number;
  /** Ключ объекта в бакете */
  key: string;
}

export interface LocationsDeleteParams {
  /** ID локации */
  id: number;
}

export interface LocationsDetailParams {
  /** ID локации */
  id: number;
}

export interface LocationsUpdateParams {
  /** ID локации */
  id: number;
}

export interface ModelsDeleteParams {
  /** ID модели */
  id: number;
}

export interface ModelsDetailParams {
  /** ID модели */
  id: number;
}

export interface ModelsDocsCreateParams {
  /** ID модели */
  id: number;
}

export interface ModelsDocsDeleteParams {
  /** ID документа */
  docId: number;
  /** ID модели */
  id: number;
}

export interface ModelsDocsListParams {
  /** ID модели */
  id: number;
}

export interface ModelsDocsPartialUpdateParams {
  /** ID документа */
  docId: number;
  /** ID модели */
  id: number;
}

export interface ModelsListParams {
  /** Фильтр расходники/нет */
  consumable?: boolean;
  /** Фильтр по ID категории */
  type_id?: number;
}

export interface ModelsQrLabelsPdfListParams {
  /** ID модели */
  id: number;
}

export interface ModelsUpdateParams {
  /** ID модели */
  id: number;
}

export interface RequestDocumentAccessUpdateRequest {
  /** @example true */
  is_public?: boolean;
}

export interface RequestDocumentAttachRequest {
  /** @example "Скан акта" */
  comment?: string;
  /**
   * @minLength 1
   * @maxLength 128
   * @example "application/pdf"
   */
  content_type?: string;
  /**
   * DocumentID — привязать уже загруженный документ платформы (вместо новой загрузки).
   * @example 5
   */
  document_id?: number;
  /**
   * @minLength 1
   * @maxLength 255
   * @example "акт.pdf"
   */
  filename?: string;
  /** @example false */
  is_public?: boolean;
  /**
   * @minLength 1
   * @maxLength 512
   * @example "docs/10/act.pdf"
   */
  object_key?: string;
  /**
   * @min 0
   * @example 123456
   */
  size?: number;
}

export interface RequestEquipmentCreateRequest {
  /** @example "Новый комментарий." */
  comment?: string;
  /** @example "Системный блок в кабинете 101" */
  description?: string;
  /**
   * @maxLength 255
   * @example "SN-12345"
   */
  factory_number?: string;
  /** @example "equipment/55/2f7c0c3b.png" */
  img?: string;
  /**
   * @min 1
   * @example 100001
   */
  invent_number: number;
  /** @example true */
  is_active?: boolean;
  /** @example 1 */
  location_id?: number;
  /** @example 1 */
  model_id: number;
  /**
   * @maxLength 200
   * @example "ПК-01"
   */
  name?: string;
  /** @example "active" */
  status?: "active" | "broken";
}

export interface RequestEquipmentUpdateRequest {
  /** @example "Обновлён комментарий." */
  comment?: string;
  /** @example "Перенесён на склад" */
  description?: string;
  /**
   * @maxLength 255
   * @example "SN-12345"
   */
  factory_number?: string;
  /** @example "equipment/55/2f7c0c3b.png" */
  img?: string;
  /** @example true */
  is_active?: boolean;
  /** @example 1 */
  location_id?: number;
  /**
   * @maxLength 200
   * @example "ПК-01"
   */
  name?: string;
  /** @example "broken" */
  status?: "active" | "broken";
}

export interface RequestLocationCreateRequest {
  /** @example "Примечание" */
  comment?: string;
  /** @example "Первый этаж, левое крыло" */
  description?: string;
  /** @example true */
  is_active?: boolean;
  /**
   * @minLength 1
   * @maxLength 200
   * @example "Кабинет 101"
   */
  name: string;
}

export interface RequestLocationUpdateRequest {
  /** @example "Примечание" */
  comment?: string;
  /** @example "Обновлено" */
  description?: string;
  /** @example true */
  is_active?: boolean;
  /** @example "Кабинет 101" */
  name?: string;
}

export interface RequestModelCreateRequest {
  /** @example "Комментарий." */
  comment?: string;
  /**
   * @min 0
   * @example 0
   */
  count?: number;
  /** @example "Intel i5, 8GB RAM" */
  description?: string;
  /** @example "models/10/cover.png" */
  img?: string;
  /** @example true */
  is_active?: boolean;
  /** @example false */
  is_consumable?: boolean;
  /**
   * @minLength 1
   * @maxLength 200
   * @example "Dell Optiplex 7050"
   */
  name: string;
  /** @example 1 */
  type_id: number;
}

export interface RequestModelUpdateRequest {
  /** @example "Комментарий." */
  comment?: string;
  /**
   * @min 0
   * @example 10
   */
  count?: number;
  /** @example "Intel i5, 8GB RAM" */
  description?: string;
  /** @example "models/10/cover.png" */
  img?: string;
  /** @example true */
  is_active?: boolean;
  /** @example false */
  is_consumable?: boolean;
  /** @example "Dell Optiplex 7050" */
  name?: string;
  /** @example 1 */
  type_id?: number;
}

export interface RequestTicketCancelReasonRequest {
  /**
   * @minLength 3
   * @maxLength 2000
   * @example "Нет запчастей на складе"
   */
  cancel_reason: string;
}

export interface RequestTicketCreateRequest {
  /** @example "Новый комментарий." */
  comment?: string;
  /** @example "После обновления Windows не стартует." */
  description?: string;
  /**
   * @maxLength 200
   * @example "Не включается ПК"
   */
  name: string;
  /** @example "repair" */
  type: "repair" | "network" | "hardware" | "software";
}

export interface RequestTicketItemAddRequest {
  /** @example "Новый комментарий." */
  comment?: string;
  /**
   * Один из двух идентификаторов должен быть передан:
   * - instance_id: для выдачи конкретного экземпляра оборудования
   * - model_id: для расходников (по модели)
   * @example 1
   */
  instance_id?: number;
  /** @example 1 */
  model_id?: number;
  /**
   * @min 1
   * @example 1
   */
  quantity?: number;
}

export interface RequestTicketItemUpdateRequest {
  /** @example "Изменён комментарий." */
  comment?: string;
  /**
   * @min 1
   * @example 2
   */
  quantity?: number;
}

export interface RequestTicketUpdateRequest {
  /** @example "Комментарий." */
  comment?: string;
  /** @example "Уточнение описания." */
  description?: string;
  /**
   * @maxLength 200
   * @example "Не включается ПК"
   */
  name?: string;
  /** @example "repair" */
  type?: "repair" | "network" | "hardware" | "software";
}

export interface RequestTypeCreateRequest {
  /** @example "Описание категории." */
  comment?: string;
  /** @example "Стационарные ПК и моноблоки" */
  description?: string;
  /** @example "types/3/cover.png" */
  img?: string;
  /** @example true */
  is_active?: boolean;
  /**
   * @minLength 1
   * @maxLength 100
   * @example "Компьютеры"
   */
  name: string;
}

export interface RequestTypeUpdateRequest {
  /** @example "Обновлённое описание." */
  comment?: string;
  /** @example "Обновлённое описание" */
  description?: string;
  /** @example "types/3/cover.png" */
  img?: string;
  /** @example true */
  is_active?: boolean;
  /**
   * @minLength 1
   * @maxLength 100
   * @example "Компьютеры"
   */
  name?: string;
}

export interface RequestUserAdminPatchRequest {
  comment?: string;
  email?: string;
  /** @maxLength 255 */
  img?: string;
  is_active?: boolean;
  /** @minLength 6 */
  password?: string;
  role?: "user" | "laborant" | "inventory_manager" | "admin";
  /**
   * @minLength 3
   * @maxLength 100
   */
  username?: string;
}

export interface RequestUserAuthRequest {
  /**
   * email or username
   * @example "ivanov@example.com"
   */
  login: string;
  /** @example "password" */
  password: string;
}

export interface RequestUserCreateRequest {
  /** @example "ivanov@example.com" */
  email: string;
  /**
   * @minLength 6
   * @example "password"
   */
  password: string;
  /** @example "user" */
  role: "user" | "laborant" | "inventory_manager" | "admin";
  /**
   * @minLength 3
   * @maxLength 100
   * @example "ivanov"
   */
  username: string;
}

export interface RequestUserMePatchRequest {
  /** @minLength 6 */
  current_password?: string;
  /** @example "ivanov@example.com" */
  email?: string;
  /**
   * @maxLength 255
   * @example "users/1/photo.png"
   */
  img?: string;
  /** @minLength 6 */
  new_password?: string;
  /**
   * @minLength 3
   * @maxLength 100
   * @example "ivanov"
   */
  username?: string;
}

export interface RequestWriteOffCreateRequest {
  /**
   * @minLength 1
   * @maxLength 128
   * @example "ACT-2026-0001"
   */
  act_number: string;
  /** @example "Комментарий" */
  comment?: string;
  /**
   * Один из вариантов:
   * - item_id: списание конкретного экземпляра
   * - model_id + quantity: списание расходника по модели
   * @example 1
   */
  item_id?: number;
  /** @example 1 */
  model_id?: number;
  /**
   * @minLength 1
   * @maxLength 200
   * @example "Акт списания"
   */
  name: string;
  /**
   * @min 1
   * @example 1
   */
  quantity?: number;
  /** @example "Не подлежит ремонту" */
  reason?: string;
}

export interface ResponseError {
  code?: string;
  /** валидация полей */
  field?: string;
  message?: string;
}

export interface ResponseMeta {
  /** Cache — источник данных для GET: hit (Redis) или miss (БД). */
  cache?: string;
  /** для вычисляемых полей */
  calculated?: number;
  limit?: number;
  page?: number;
  total?: number;
}

export interface ResponseResponse {
  data?: any;
  error?: ResponseError;
  meta?: ResponseMeta;
  success?: boolean;
}

export interface TicketsAcceptUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsCancelUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsCompleteUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsDeleteParams {
  /** ID заявки */
  id: number;
}

export interface TicketsDetailParams {
  /** ID заявки */
  id: number;
}

export interface TicketsDocsCreateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsDocsDeleteParams {
  /** ID документа */
  docId: number;
  /** ID заявки */
  id: number;
}

export interface TicketsDocsListParams {
  /** ID заявки */
  id: number;
}

export interface TicketsDocsPartialUpdateParams {
  /** ID документа */
  docId: number;
  /** ID заявки */
  id: number;
}

export interface TicketsFormUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsHardDeleteParams {
  /** ID заявки */
  id: number;
}

export interface TicketsItemsByIdDeleteParams {
  /** ID заявки */
  id: number;
  /** ID элемента заявки */
  itemId: number;
}

export interface TicketsItemsByIdUpdateParams {
  /** ID заявки */
  id: number;
  /** ID элемента заявки */
  itemId: number;
}

export interface TicketsItemsCreateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsItemsDeleteParams {
  /** ID оборудования */
  equipmentId: number;
  /** ID заявки */
  id: number;
}

export interface TicketsItemsUpdateParams {
  /** ID оборудования */
  equipmentId: number;
  /** ID заявки */
  id: number;
}

export interface TicketsListParams {
  /** Фильтр по автору */
  author_id?: number;
  /** Фильтр по исполнителю */
  laborant_id?: number;
  /** Если 1/true — режим панели: админ и материально ответственный получают полный список по правам; без panel — только свои заявки */
  panel?: string;
  /** Фильтр по статусу */
  status?: string;
  /** Фильтр по типу */
  type?: string;
}

export interface TicketsRejectUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TicketsUpdateParams {
  /** ID заявки */
  id: number;
}

export interface TypesDeleteParams {
  /** ID категории */
  id: number;
}

export interface TypesDetailParams {
  /** ID категории */
  id: number;
}

export interface TypesUpdateParams {
  /** ID категории */
  id: number;
}

export interface UsersDetailParams {
  /** ID пользователя */
  id: number;
}

export interface UsersPartialUpdateParams {
  /** ID пользователя */
  id: number;
}

export interface WriteoffsDetailParams {
  /** ID списания */
  id: number;
}

export interface WriteoffsListParams {
  /**
   * Лимит записей
   * @default 50
   */
  limit?: number;
  /**
   * Смещение
   * @default 0
   */
  offset?: number;
}
