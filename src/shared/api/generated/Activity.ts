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

import type { ActivityListParams, ResponseResponse } from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Activity<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Activity
   * @name ActivityList
   * @summary Список действий (аудит)
   * @request GET:/api/activity
   * @secure
   */
  activityList = (query: ActivityListParams, params: RequestParams = {}) =>
    this.request<ResponseResponse, any>({
      path: `/api/activity`,
      method: "GET",
      query: query,
      secure: true,
      ...params,
    });
}
