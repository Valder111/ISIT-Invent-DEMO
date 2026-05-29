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

import type { ResponseError, ResponseResponse } from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Reports<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Reports
   * @name ReportsEquipmentStatusList
   * @summary Отчёт: количество оборудования по статусам
   * @request GET:/api/reports/equipment-status
   * @secure
   */
  reportsEquipmentStatusList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/reports/equipment-status`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Reports
   * @name ReportsEquipmentStatusPdfList
   * @summary PDF-отчёт: оборудование по статусам
   * @request GET:/api/reports/equipment-status.pdf
   * @secure
   */
  reportsEquipmentStatusPdfList = (params: RequestParams = {}) =>
    this.request<Blob, ResponseError>({
      path: `/api/reports/equipment-status.pdf`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Reports
   * @name ReportsLaborantLoadList
   * @summary Отчёт: нагрузка лаборантов (завершённые заявки)
   * @request GET:/api/reports/laborant-load
   * @secure
   */
  reportsLaborantLoadList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/reports/laborant-load`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Reports
   * @name ReportsLaborantLoadPdfList
   * @summary PDF-отчёт: нагрузка лаборантов
   * @request GET:/api/reports/laborant-load.pdf
   * @secure
   */
  reportsLaborantLoadPdfList = (params: RequestParams = {}) =>
    this.request<Blob, ResponseError>({
      path: `/api/reports/laborant-load.pdf`,
      method: "GET",
      secure: true,
      ...params,
    });
}
