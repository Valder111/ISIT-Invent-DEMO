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
  RequestUserAdminPatchRequest,
  RequestUserAuthRequest,
  RequestUserCreateRequest,
  RequestUserMePatchRequest,
  ResponseError,
  ResponseResponse,
  UsersDetailParams,
  UsersPartialUpdateParams,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Users<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Users
   * @name UsersAuthCreate
   * @summary Аутентификация (JWT + Redis session + cookie)
   * @request POST:/api/users/auth
   */
  usersAuthCreate = (
    credentials: RequestUserAuthRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users/auth`,
      method: "POST",
      body: credentials,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersCreate
   * @summary Создать пользователя (админ; закрытая платформа)
   * @request POST:/api/users
   * @secure
   */
  usersCreate = (user: RequestUserCreateRequest, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users`,
      method: "POST",
      body: user,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersDetail
   * @summary Пользователь по ID (только мат. ответственный/админ)
   * @request GET:/api/users/{id}
   * @secure
   */
  usersDetail = ({ id }: UsersDetailParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersList
   * @summary Список пользователей (только мат. ответственный/админ)
   * @request GET:/api/users
   * @secure
   */
  usersList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersLogoutCreate
   * @summary Деавторизация (удаление Redis-сессии + очистка cookie)
   * @request POST:/api/users/logout
   * @secure
   */
  usersLogoutCreate = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/users/logout`,
      method: "POST",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersMeList
   * @summary Текущий пользователь
   * @request GET:/api/users/me
   * @secure
   */
  usersMeList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users/me`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersMePartialUpdate
   * @summary Обновить текущего пользователя
   * @request PATCH:/api/users/me
   * @secure
   */
  usersMePartialUpdate = (
    body: RequestUserMePatchRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users/me`,
      method: "PATCH",
      body: body,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Users
   * @name UsersPartialUpdate
   * @summary Обновить пользователя по ID (только админ)
   * @request PATCH:/api/users/{id}
   * @secure
   */
  usersPartialUpdate = (
    { id }: UsersPartialUpdateParams,
    body: RequestUserAdminPatchRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/users/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
