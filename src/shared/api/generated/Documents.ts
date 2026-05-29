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
  DocsDeleteParams,
  DocsPartialUpdateParams,
  RequestDocumentAccessUpdateRequest,
  RequestDocumentAttachRequest,
  ResponseError,
  ResponseResponse,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Documents<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Documents
   * @name DocsCreate
   * @summary Прикрепить документ к платформе
   * @request POST:/api/docs
   * @secure
   */
  docsCreate = (
    document: RequestDocumentAttachRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/docs`,
      method: "POST",
      body: document,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Documents
   * @name DocsDelete
   * @summary Удалить документ платформы
   * @request DELETE:/api/docs/{doc_id}
   * @secure
   */
  docsDelete = ({ docId }: DocsDeleteParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/docs/${docId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Documents
   * @name DocsLinkableList
   * @summary Документы платформы для привязки
   * @request GET:/api/docs/linkable
   * @secure
   */
  docsLinkableList = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/docs/linkable`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Documents
   * @name DocsList
   * @summary Список документов платформы
   * @request GET:/api/docs
   * @secure
   */
  docsList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/docs`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Documents
   * @name DocsPartialUpdate
   * @summary Изменить доступ документа платформы
   * @request PATCH:/api/docs/{doc_id}
   * @secure
   */
  docsPartialUpdate = (
    { docId }: DocsPartialUpdateParams,
    access: RequestDocumentAccessUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/docs/${docId}`,
      method: "PATCH",
      body: access,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
