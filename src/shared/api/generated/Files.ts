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
  FilesBrowseListParams,
  FilesCreateParams,
  FilesCreatePayload,
  FilesDeleteParams,
  FilesPresignListParams,
  ResponseResponse,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Files<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Files
   * @name FilesBrowseList
   * @summary Список объектов в хранилище MinIO
   * @request GET:/api/files/browse
   * @secure
   */
  filesBrowseList = (
    query: FilesBrowseListParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, any>({
      path: `/api/files/browse`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Files
   * @name FilesCreate
   * @summary Загрузить файл в хранилище (MinIO)
   * @request POST:/api/files
   * @secure
   */
  filesCreate = (
    query: FilesCreateParams,
    data: FilesCreatePayload,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, any>({
      path: `/api/files`,
      method: "POST",
      query: query,
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });
  /**
   * No description
   *
   * @tags Files
   * @name FilesDelete
   * @summary Удалить объект из хранилища
   * @request DELETE:/api/files
   * @secure
   */
  filesDelete = (query: FilesDeleteParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/files`,
      method: "DELETE",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Files
   * @name FilesPresignList
   * @summary Получить временную ссылку (presigned) на чтение файла из MinIO
   * @request GET:/api/files/presign
   * @secure
   */
  filesPresignList = (
    query: FilesPresignListParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, any>({
      path: `/api/files/presign`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
}
