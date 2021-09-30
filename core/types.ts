import type { Status } from "../deps.ts";
import type { AttainRequest } from "./request.ts";
import type { AttainResponse } from "./response.ts";

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export interface AttainListenProps {
  debug?: boolean;
  secure?: boolean;
  hostname?: string;
  certFile?: string;
  keyFile?: string;

  transport?: "tcp";
}

export type SupportMethodType =
  | "HEAD"
  | "OPTIONS"
  | "ALL"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type CallBackType<T = any> = (
  request: AttainRequest,
  response: AttainResponse,
  db: T,
) => Promise<any> | void;

export type ParamCallBackType<T = any> = (
  request: AttainRequest,
  response: AttainResponse,
  param: any,
  db: T,
) => Promise<any> | void;

export type ErrorCallBackType<T = any> = (
  error: any,
  request: AttainRequest,
  response: AttainResponse,
  db: T,
) => Promise<any> | void;

export interface MiddlewareProps<T = any> {
  url?: string;
  paramHandlers?: ParamStackProps<T>[];
  callBack?: CallBackType<T>;
  method?: SupportMethodType;
  next?: MiddlewareProps<T>[];
}

export interface ParamStackProps<T = any> {
  paramName: string;
  callBack: ParamCallBackType<T>;
}

export interface ErrorMiddlewareProps<T = any> {
  url?: string;
  callBack?: ErrorCallBackType<T>;
  next?: ErrorMiddlewareProps<T>[];
}

// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
/** A HTTP status that is an error (4XX and 5XX). */
export type ErrorStatus =
  | Status.BadRequest
  | Status.Unauthorized
  | Status.PaymentRequired
  | Status.Forbidden
  | Status.NotFound
  | Status.MethodNotAllowed
  | Status.NotAcceptable
  | Status.ProxyAuthRequired
  | Status.RequestTimeout
  | Status.Conflict
  | Status.Gone
  | Status.LengthRequired
  | Status.PreconditionFailed
  | Status.RequestEntityTooLarge
  | Status.RequestURITooLong
  | Status.UnsupportedMediaType
  | Status.RequestedRangeNotSatisfiable
  | Status.ExpectationFailed
  | Status.Teapot
  | Status.MisdirectedRequest
  | Status.UnprocessableEntity
  | Status.Locked
  | Status.FailedDependency
  | Status.UpgradeRequired
  | Status.PreconditionRequired
  | Status.TooManyRequests
  | Status.RequestHeaderFieldsTooLarge
  | Status.UnavailableForLegalReasons
  | Status.InternalServerError
  | Status.NotImplemented
  | Status.BadGateway
  | Status.ServiceUnavailable
  | Status.GatewayTimeout
  | Status.HTTPVersionNotSupported
  | Status.VariantAlsoNegotiates
  | Status.InsufficientStorage
  | Status.LoopDetected
  | Status.NotExtended
  | Status.NetworkAuthenticationRequired;
