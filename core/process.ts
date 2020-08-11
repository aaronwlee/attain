import { ServerRequest } from "../deps.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams } from "./utils.ts";
import {
  MiddlewareProps,
  ErrorMiddlewareProps,
  ParamStackProps,
} from "./types.ts";

/* an alternative, clearer code of the process file */
export class AttainHandler<DB> {
  #database: DB
  #secure: boolean

  constructor(database: DB, secure: boolean) {
    this.#database = database;
    this.#secure = secure;
  }

  // main function
  async execute(
    srq: ServerRequest,
    middlewares: MiddlewareProps<DB>[],
    errorMiddlewares: ErrorMiddlewareProps<DB>[]
  ) {
    const res = new Response<DB>(srq);
    const req = new Request(srq, this.#secure);

    // execute middlewares. if any errors, execute error middlewares.
    try {
      await this.handleMiddlewares(req, res, middlewares);
    } catch (error) {
      await this.handleErrorMiddlewares(error, req, res, errorMiddlewares);
    }

    // execute pending jobs (aka - res.pend());
    await res.executePendingJobs(req);

    // if the response was created, send it. if not, close connection.
    if (res.getBody) {
      await srq.respond(res.getResponse);
    } else {
      srq.conn.close();
    }

    // delete response from memory.
    res.destroy();
    srq.finalize();
  }

  // handle regular middlewares
  private async handleMiddlewares(
    req: Request,
    res: Response<DB>,
    current: MiddlewareProps<DB>[]
  ) {
    try {
      const currentMethod = req.method;
      const currentUrl = req.url.pathname;
      for (const middleware of current) {
        // check if the middleware method matches the method in the request
        if (
          middleware.method === currentMethod || middleware.method === "ALL"
        ) {
          // if the middleware doesn't have a url, execute it. if it does, check match and execute.
          if (!middleware.url) {
            await this.#run(req, res, middleware);
          } else if (
            checkPathAndParseURLParams(req, middleware.url, currentUrl)
          ) {
            // if any params handlers in the request (aka, Router.param()), handle them.
            if (middleware.paramHandlers && req.params) {
              await this.#runWithParams(middleware.paramHandlers, req, res);
              // if the middleare has a res.send() method, finish the request.
              if (res.processDone) {
                break;
              }
            }
            // fallback middleware execution
            await this.#run(req, res, middleware);
          }
        }
        // if the middleare has a res.send() method, finish the request.
        if (res.processDone) {
          break;
        }
      }
    } catch (error) { // throw error to the error middlewares
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  // handle error middlewares
  private async handleErrorMiddlewares(
    error: Error | any,
    req: Request,
    res: Response<DB>,
    current: ErrorMiddlewareProps<DB>[]
  ) {
    try {
      const currentUrl = req.url.pathname;
      for (const middleware of current) {
        // execute all middlewares without a url or middlewares that match the current url.
        if (!middleware.url) {
          await this.#runWithError(error, req, res, middleware);
        } else if (
          checkPathAndParseURLParams(req, middleware.url, currentUrl)
        ) {
          await this.#runWithError(error, req, res, middleware);
        }
        if (res.processDone) {
          break;
        }
      }
    } catch (error) {
      console.error(
        "Attain Error: Can't handle it due to Error middlewares can't afford it.",
      );
      console.error(error);
    }
  };

  // execute a middleware callback if exists
  #run = async (
    req: Request,
    res: Response<DB>,
    middleware: MiddlewareProps<DB>
  ) => {
    try {
      middleware.callBack
        ? await middleware.callBack(req, res, this.#database!)
        : await this.handleMiddlewares(req, res, middleware.next!); /* No idea why I need this '!' */
    } catch (err) {
      throw err;
    }
  }

  // execute an error middleware callback if exists.
  #runWithError = async (
    err: any,
    req: Request,
    res: Response<DB>,
    middleware: ErrorMiddlewareProps<DB>
  ) => {
    try {
      middleware.callBack
        ? await middleware.callBack(err, req, res, this.#database!)
        : await this.handleErrorMiddlewares(err, req, res, middleware.next!);
    } catch (err) {
      throw err;
    }
  }

  // execute a paramHandler callback
  #runWithParams = async (
    paramHandlers: ParamStackProps<DB>[],
    req: Request,
    res: Response<DB>,
  ) => {
    for await (const paramHandler of paramHandlers) {
      await paramHandler.callBack(req, res, req.params[paramHandler.paramName], this.#database!)
      if (res.processDone) {
        break;
      }
    }
  };
}