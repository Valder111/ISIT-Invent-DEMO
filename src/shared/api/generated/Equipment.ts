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
  EquipmentDeleteParams,
  EquipmentDetailParams,
  EquipmentListParams,
  EquipmentQrDetailParams,
  EquipmentQrLabelPdfListParams,
  EquipmentUpdateParams,
  RequestEquipmentCreateRequest,
  RequestEquipmentUpdateRequest,
  ResponseError,
  ResponseResponse,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Equipment<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentCreate
   * @summary Добавить оборудование (только admin/мат. ответственный)
   * @request POST:/api/equipment
   * @secure
   */
  equipmentCreate = (
    equipment: RequestEquipmentCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/equipment`,
      method: "POST",
      body: equipment,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentDelete
   * @summary Удалить оборудование (мат. ответственный/админ)
   * @request DELETE:/api/equipment/{id}
   * @secure
   */
  equipmentDelete = (
    { id }: EquipmentDeleteParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/equipment/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentDetail
   * @summary Получить оборудование по ID
   * @request GET:/api/equipment/{id}
   * @secure
   */
  equipmentDetail = (
    { id }: EquipmentDetailParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/equipment/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentList
   * @summary Список оборудования с фильтрацией
   * @request GET:/api/equipment
   * @secure
   */
  equipmentList = (query: EquipmentListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/equipment`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentQrDetail
   * @summary Получить оборудование по QR-токену
   * @request GET:/api/equipment/qr/{token}
   * @secure
   */
  equipmentQrDetail = (
    { token }: EquipmentQrDetailParams,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/equipment/qr/${token}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentQrLabelPdfList
   * @summary PDF-этикетка QR для экземпляра оборудования
   * @request GET:/api/equipment/{id}/qr-label.pdf
   * @secure
   */
  equipmentQrLabelPdfList = (
    { id }: EquipmentQrLabelPdfListParams,
    params: RequestParams = {},
  ) =>
    this.request<Blob, any>({
      path: `/api/equipment/${id}/qr-label.pdf`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Equipment
   * @name EquipmentUpdate
   * @summary Изменить оборудование (лаборант/мат. ответственный/админ)
   * @request PUT:/api/equipment/{id}
   * @secure
   */
  equipmentUpdate = (
    { id }: EquipmentUpdateParams,
    equipment: RequestEquipmentUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseResponse, ResponseError>({
      path: `/api/equipment/${id}`,
      method: "PUT",
      body: equipment,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
