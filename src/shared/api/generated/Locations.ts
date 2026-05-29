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
  LocationsDeleteParams,
  LocationsDetailParams,
  LocationsUpdateParams,
  RequestLocationCreateRequest,
  RequestLocationUpdateRequest,
  ResponseError,
  ResponseResponse,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Locations<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Locations
   * @name LocationsCreate
   * @summary Создать локацию (мат. ответственный/админ)
   * @request POST:/api/locations
   * @secure
   */
  locationsCreate = (
    location: RequestLocationCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/locations`,
      method: "POST",
      body: location,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Locations
   * @name LocationsDelete
   * @summary Удалить локацию (мат. ответственный/админ)
   * @request DELETE:/api/locations/{id}
   * @secure
   */
  locationsDelete = (
    { id }: LocationsDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/locations/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Locations
   * @name LocationsDetail
   * @summary Получить локацию по ID
   * @request GET:/api/locations/{id}
   * @secure
   */
  locationsDetail = (
    { id }: LocationsDetailParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/locations/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Locations
   * @name LocationsList
   * @summary Список локаций
   * @request GET:/api/locations
   * @secure
   */
  locationsList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/locations`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Locations
   * @name LocationsUpdate
   * @summary Изменить локацию (мат. ответственный/админ)
   * @request PUT:/api/locations/{id}
   * @secure
   */
  locationsUpdate = (
    { id }: LocationsUpdateParams,
    location: RequestLocationUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/locations/${id}`,
      method: "PUT",
      body: location,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
