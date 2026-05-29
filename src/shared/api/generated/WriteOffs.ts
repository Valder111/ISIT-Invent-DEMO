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
  RequestWriteOffCreateRequest,
  ResponseError,
  ResponseResponse,
  WriteoffsDetailParams,
  WriteoffsListParams,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class WriteOffs<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags WriteOffs
   * @name WriteoffsCreate
   * @summary Списать оборудование/расходник (мат. ответственный/админ)
   * @request POST:/api/writeoffs
   * @secure
   */
  writeoffsCreate = (
    writeoff: RequestWriteOffCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/writeoffs`,
      method: "POST",
      body: writeoff,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags WriteOffs
   * @name WriteoffsDetail
   * @summary Получить списание по ID
   * @request GET:/api/writeoffs/{id}
   * @secure
   */
  writeoffsDetail = (
    { id }: WriteoffsDetailParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/writeoffs/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags WriteOffs
   * @name WriteoffsList
   * @summary Список списаний
   * @request GET:/api/writeoffs
   * @secure
   */
  writeoffsList = (query: WriteoffsListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/writeoffs`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
}
