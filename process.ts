import { ServerRequest } from "./deps.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams } from "./utils.ts";
import { MiddlewareProps, ErrorMiddlewareProps } from "./types.ts";

class Process {
  #serverRequest: ServerRequest;
  #request: Request;
  #response: Response;

  constructor(srq : ServerRequest) {
    this.#request = new Request(srq);
    this.#response = new Response(srq);
    this.#serverRequest = srq;
  }

  public attainProcedure: any = async (
    current: MiddlewareProps[],
  ) => {
    const currentMethod = this.#request.method;
    const currentUrl = this.#request.url.pathname;
    let continueToken = true;
    this.#response.readyToSend.then(() => continueToken = false);
    try {
      if (current) {
        for await (const middleware of current) {
          if (
            middleware.method === currentMethod || middleware.method === "ALL"
          ) {
            if (!middleware.url) {
              middleware.callBack
                ? await middleware.callBack(this.#request, this.#response)
                : await this.attainProcedure(middleware.next);
            } else if (
              checkPathAndParseURLParams(this.#request, middleware.url, currentUrl)
            ) {
              middleware.callBack
                ? await middleware.callBack(this.#request, this.#response)
                : await this.attainProcedure(middleware.next);
            }
          }
          if (!continueToken) {
            break;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  };

  public attainErrorProcedure: any = async (
    error: Error | any,
    current: ErrorMiddlewareProps[],
  ) => {
    const currentUrl = this.#request.url.pathname;
    let continueToken = true;
    this.#response.readyToSend.then(() => continueToken = false);
    try {
      if (current) {
        for await (const middleware of current) {
          if (!middleware.url) {
            middleware.callBack
              ? await middleware.callBack(error, this.#request, this.#response)
              : await this.attainErrorProcedure(error, middleware.next);
          } else if (
            checkPathAndParseURLParams(this.#request, middleware.url, currentUrl)
          ) {
            middleware.callBack
              ? await middleware.callBack(error, this.#request, this.#response)
              : await this.attainErrorProcedure(error, middleware.next);
          }
          if (!continueToken) {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Attain Error: Can't handle it due to Error middlewares can't afford it.")
      console.error(error);
    }
  };

  public finalize = async () => {
    if (this.#response.getBody) {
      await this.#response.executePendingJobs(this.#request);
      await this.#serverRequest.respond(this.#response.getResponse);
    } else {
      this.#serverRequest.conn.close();
    }
  }
}

export default Process;