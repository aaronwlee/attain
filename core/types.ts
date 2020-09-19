import type { Response as DenoResponse, Status } from "../deps.ts";
import type { Request } from "./request.ts";
import type { Response } from "./response.ts";

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export interface ListenProps {
  port: number;
  debug?: boolean;
  hostname?: string;
  secure?: boolean;
  certFile?: string;
  keyFile?: string;
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

export interface AttainResponse extends Omit<DenoResponse, "headers"> {
  headers: Headers;
}

export type CallBackType<T = any> = (
  request: Request,
  response: Response,
  db: T
) => Promise<any> | void;

export type ParamCallBackType<T = any> = (
  request: Request,
  response: Response,
  param: any,
  db: T
) => Promise<any> | void;

export type ErrorCallBackType<T = any> = (
  error: any,
  request: Request,
  response: Response,
  db: T
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