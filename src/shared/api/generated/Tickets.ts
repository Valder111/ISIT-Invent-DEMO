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

import type {
  RequestDocumentAccessUpdateRequest,
  RequestDocumentAttachRequest,
  RequestTicketCancelReasonRequest,
  RequestTicketCreateRequest,
  RequestTicketUpdateRequest,
  ResponseError,
  ResponseResponse,
  TicketsAcceptUpdateParams,
  TicketsCancelUpdateParams,
  TicketsCompleteUpdateParams,
  TicketsDeleteParams,
  TicketsDetailParams,
  TicketsDocsCreateParams,
  TicketsDocsDeleteParams,
  TicketsDocsListParams,
  TicketsDocsPartialUpdateParams,
  TicketsFormUpdateParams,
  TicketsHardDeleteParams,
  TicketsListParams,
  TicketsRejectUpdateParams,
  TicketsUpdateParams,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Tickets<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsAcceptUpdate
   * @summary Принять заявку в работу (лаборант)
   * @request PUT:/api/tickets/{id}/accept
   * @secure
   */
  ticketsAcceptUpdate = (
    { id }: TicketsAcceptUpdateParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/accept`,
      method: "PUT",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsCancelUpdate
   * @summary Отменить заявку (мат. ответственный/админ; можно чужие)
   * @request PUT:/api/tickets/{id}/cancel
   * @secure
   */
  ticketsCancelUpdate = (
    { id }: TicketsCancelUpdateParams,
    body: RequestTicketCancelReasonRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/cancel`,
      method: "PUT",
      body: body,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsCompleteUpdate
   * @summary Завершить заявку (только модератор)
   * @request PUT:/api/tickets/{id}/complete
   * @secure
   */
  ticketsCompleteUpdate = (
    { id }: TicketsCompleteUpdateParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/complete`,
      method: "PUT",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsCreate
   * @summary Создать новую заявку-черновик
   * @request POST:/api/tickets
   * @secure
   */
  ticketsCreate = (
    ticket: RequestTicketCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, any>({
      path: `/api/tickets`,
      method: "POST",
      body: ticket,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDelete
   * @summary Удалить заявку (только черновик, только создатель)
   * @request DELETE:/api/tickets/{id}
   * @secure
   */
  ticketsDelete = ({ id }: TicketsDeleteParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDetail
   * @summary Получить заявку по ID с элементами
   * @request GET:/api/tickets/{id}
   * @secure
   */
  ticketsDetail = ({ id }: TicketsDetailParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDocsCreate
   * @summary Прикрепить документ к заявке
   * @request POST:/api/tickets/{id}/docs
   * @secure
   */
  ticketsDocsCreate = (
    { id }: TicketsDocsCreateParams,
    document: RequestDocumentAttachRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/docs`,
      method: "POST",
      body: document,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDocsDelete
   * @summary Удалить документ из заявки
   * @request DELETE:/api/tickets/{id}/docs/{doc_id}
   * @secure
   */
  ticketsDocsDelete = (
    { id, docId }: TicketsDocsDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/docs/${docId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDocsList
   * @summary Список документов заявки
   * @request GET:/api/tickets/{id}/docs
   * @secure
   */
  ticketsDocsList = (
    { id }: TicketsDocsListParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/docs`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsDocsPartialUpdate
   * @summary Изменить доступ документа заявки
   * @request PATCH:/api/tickets/{id}/docs/{doc_id}
   * @secure
   */
  ticketsDocsPartialUpdate = (
    { id, docId }: TicketsDocsPartialUpdateParams,
    access: RequestDocumentAccessUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/docs/${docId}`,
      method: "PATCH",
      body: access,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsFormUpdate
   * @summary Сформировать заявку (перевод из черновика)
   * @request PUT:/api/tickets/{id}/form
   * @secure
   */
  ticketsFormUpdate = (
    { id }: TicketsFormUpdateParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/form`,
      method: "PUT",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsHardDelete
   * @summary Безвозвратно удалить заявку (админ)
   * @request DELETE:/api/tickets/{id}/hard
   * @secure
   */
  ticketsHardDelete = (
    { id }: TicketsHardDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/hard`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Для роли laborant без author_id/laborant_id: свои заявки + очередь in_progress (без исполнителя или назначенные на этого лаборанта).
   *
   * @tags Tickets
   * @name TicketsList
   * @summary Список заявок (с фильтрацией)
   * @request GET:/api/tickets
   * @secure
   */
  ticketsList = (query: TicketsListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/tickets`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsRejectUpdate
   * @summary Отклонить заявку (только модератор)
   * @request PUT:/api/tickets/{id}/reject
   * @secure
   */
  ticketsRejectUpdate = (
    { id }: TicketsRejectUpdateParams,
    body: RequestTicketCancelReasonRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/reject`,
      method: "PUT",
      body: body,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tickets
   * @name TicketsUpdate
   * @summary Изменить поля заявки (только черновик, только создатель)
   * @request PUT:/api/tickets/{id}
   * @secure
   */
  ticketsUpdate = (
    { id }: TicketsUpdateParams,
    ticket: RequestTicketUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}`,
      method: "PUT",
      body: ticket,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
