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

import type { ResponseResponse } from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class System<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags System
   * @name HealthList
   * @summary Проверка работоспособности сервиса
   * @request GET:/api/health
   */
  healthList = (params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/health`,
      method: "GET",
      ...params,
    });
}
