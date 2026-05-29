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
  RequestTicketItemAddRequest,
  RequestTicketItemUpdateRequest,
  ResponseError,
  ResponseResponse,
  TicketsItemsByIdDeleteParams,
  TicketsItemsByIdUpdateParams,
  TicketsItemsCreateParams,
  TicketsItemsDeleteParams,
  TicketsItemsUpdateParams,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class TicketItems<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags TicketItems
   * @name TicketsItemsByIdDelete
   * @summary Удалить элемент заявки по ID элемента (универсально)
   * @request DELETE:/api/tickets/{id}/items/by-id/{item_id}
   * @secure
   */
  ticketsItemsByIdDelete = (
    { id, itemId }: TicketsItemsByIdDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/items/by-id/${itemId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags TicketItems
   * @name TicketsItemsByIdUpdate
   * @summary Изменить количество или комментарий элемента по ID элемента (универсально)
   * @request PUT:/api/tickets/{id}/items/by-id/{item_id}
   * @secure
   */
  ticketsItemsByIdUpdate = (
    { id, itemId }: TicketsItemsByIdUpdateParams,
    item: RequestTicketItemUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/items/by-id/${itemId}`,
      method: "PUT",
      body: item,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags TicketItems
   * @name TicketsItemsCreate
   * @summary Добавить оборудование в заявку-черновик
   * @request POST:/api/tickets/{id}/items
   * @secure
   */
  ticketsItemsCreate = (
    { id }: TicketsItemsCreateParams,
    item: RequestTicketItemAddRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/items`,
      method: "POST",
      body: item,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags TicketItems
   * @name TicketsItemsDelete
   * @summary Удалить оборудование из заявки
   * @request DELETE:/api/tickets/{id}/items/{equipment_id}
   * @secure
   */
  ticketsItemsDelete = (
    { id, equipmentId }: TicketsItemsDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/items/${equipmentId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags TicketItems
   * @name TicketsItemsUpdate
   * @summary Изменить количество или комментарий элемента
   * @request PUT:/api/tickets/{id}/items/{equipment_id}
   * @secure
   */
  ticketsItemsUpdate = (
    { id, equipmentId }: TicketsItemsUpdateParams,
    item: RequestTicketItemUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/tickets/${id}/items/${equipmentId}`,
      method: "PUT",
      body: item,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
