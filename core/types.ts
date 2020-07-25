import { Response as DenoResponse, Status } from "../deps.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";

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

export type CallBackType = (
  request: Request,
  response: Response,
) => Promise<any> | void;

export type ParamCallBackType = (
  request: Request,
  response: Response,
  param: any,
) => Promise<any> | void;

export type ErrorCallBackType = (
  error: any,
  request: Request,
  response: Response,
) => Promise<any> | void;

export interface MiddlewareProps {
  url?: string;
  paramHandlers?: ParamStackProps[];
  callBack?: CallBackType;
  method?: SupportMethodType;
  next?: MiddlewareProps[];
}

export interface ParamStackProps {
  paramName: string;
  callBack: ParamCallBackType;
}

export interface ErrorMiddlewareProps {
  url?: string;
  callBack?: ErrorCallBackType;
  next?: ErrorMiddlewareProps[];
}

export interface CurrentCursorProps {
  middlewaresCursor: MiddlewareProps[];
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