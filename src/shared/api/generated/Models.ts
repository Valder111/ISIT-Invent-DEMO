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
  ModelsDeleteParams,
  ModelsDetailParams,
  ModelsDocsCreateParams,
  ModelsDocsDeleteParams,
  ModelsDocsListParams,
  ModelsDocsPartialUpdateParams,
  ModelsListParams,
  ModelsQrLabelsPdfListParams,
  ModelsUpdateParams,
  RequestDocumentAccessUpdateRequest,
  RequestDocumentAttachRequest,
  RequestModelCreateRequest,
  RequestModelUpdateRequest,
  ResponseError,
  ResponseResponse,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Models<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Models
   * @name ModelsCreate
   * @summary Создать модель оборудования (мат. ответственный/админ)
   * @request POST:/api/models
   * @secure
   */
  modelsCreate = (
    model: RequestModelCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models`,
      method: "POST",
      body: model,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDelete
   * @summary Удалить модель оборудования (мат. ответственный/админ)
   * @request DELETE:/api/models/{id}
   * @secure
   */
  modelsDelete = ({ id }: ModelsDeleteParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDetail
   * @summary Получить модель оборудования по ID
   * @request GET:/api/models/{id}
   * @secure
   */
  modelsDetail = ({ id }: ModelsDetailParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDocsCreate
   * @summary Прикрепить документ к модели
   * @request POST:/api/models/{id}/docs
   * @secure
   */
  modelsDocsCreate = (
    { id }: ModelsDocsCreateParams,
    document: RequestDocumentAttachRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}/docs`,
      method: "POST",
      body: document,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDocsDelete
   * @summary Удалить документ из модели
   * @request DELETE:/api/models/{id}/docs/{doc_id}
   * @secure
   */
  modelsDocsDelete = (
    { id, docId }: ModelsDocsDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}/docs/${docId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDocsList
   * @summary Список документов модели
   * @request GET:/api/models/{id}/docs
   * @secure
   */
  modelsDocsList = ({ id }: ModelsDocsListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}/docs`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsDocsPartialUpdate
   * @summary Изменить доступ документа модели
   * @request PATCH:/api/models/{id}/docs/{doc_id}
   * @secure
   */
  modelsDocsPartialUpdate = (
    { id, docId }: ModelsDocsPartialUpdateParams,
    access: RequestDocumentAccessUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}/docs/${docId}`,
      method: "PATCH",
      body: access,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsList
   * @summary Список моделей оборудования
   * @request GET:/api/models
   * @secure
   */
  modelsList = (query: ModelsListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/models`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsQrLabelsPdfList
   * @summary PDF: QR-этикетки экземпляров модели
   * @request GET:/api/models/{id}/qr-labels.pdf
   * @secure
   */
  modelsQrLabelsPdfList = (
    { id }: ModelsQrLabelsPdfListParams,
    params: RequestParams = {},
  ) =>
    this.request<Blob, any>({
      path: `/api/models/${id}/qr-labels.pdf`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Models
   * @name ModelsUpdate
   * @summary Изменить модель оборудования (мат. ответственный/админ)
   * @request PUT:/api/models/{id}
   * @secure
   */
  modelsUpdate = (
    { id }: ModelsUpdateParams,
    model: RequestModelUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/models/${id}`,
      method: "PUT",
      body: model,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
