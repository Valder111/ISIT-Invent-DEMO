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
  RequestTypeCreateRequest,
  RequestTypeUpdateRequest,
  ResponseError,
  ResponseResponse,
  TypesDeleteParams,
  TypesDetailParams,
  TypesUpdateParams,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Types<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Types
   * @name TypesCreate
   * @summary Создать тип (категорию) оборудования (мат. ответственный/админ)
   * @request POST:/api/types
   * @secure
   */
  typesCreate = (type: RequestTypeCreateRequest, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/types`,
      method: "POST",
      body: type,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Types
   * @name TypesDelete
   * @summary Удалить тип (категорию) оборудования (мат. ответственный/админ)
   * @request DELETE:/api/types/{id}
   * @secure
   */
  typesDelete = ({ id }: TypesDeleteParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/types/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Types
   * @name TypesDetail
   * @summary Получить тип (категорию) по ID
   * @request GET:/api/types/{id}
   * @secure
   */
  typesDetail = ({ id }: TypesDetailParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/types/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Types
   * @name TypesList
   * @summary Список типов (категорий) оборудования
   * @request GET:/api/types
   * @secure
   */
  typesList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/types`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Types
   * @name TypesUpdate
   * @summary Изменить тип (категорию) оборудования (мат. ответственный/админ)
   * @request PUT:/api/types/{id}
   * @secure
   */
  typesUpdate = (
    { id }: TypesUpdateParams,
    type: RequestTypeUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/types/${id}`,
      method: "PUT",
      body: type,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
