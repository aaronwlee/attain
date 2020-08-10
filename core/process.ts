import { ServerRequest } from "../deps.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams } from "./utils.ts";
import {
  MiddlewareProps,
  ErrorMiddlewareProps,
  ParamStackProps,
} from "./types.ts";

const Process = async <T>(
  srq: ServerRequest,
  secure: boolean,
  middlewares: MiddlewareProps<T>[],
  errorMiddlewares: ErrorMiddlewareProps<T>[],
  database: T
) => {
  const res = new Response<T>(srq);
  const req = new Request(srq, secure);

  try {
    await attainProcedure<T>(req, res, middlewares, database);
  } catch (error) {
    await attainErrorProcedure<T>(error, req, res, errorMiddlewares, database);
  }

  await res.executePendingJobs(req);

  if (res.getBody) {
    await srq.respond(res.getResponse);
  } else {
    srq.conn.close();
  }
  res.destroy();
  srq.finalize();
};

const attainProcedure = async <T>(
  req: Request,
  res: Response,
  current: MiddlewareProps<T>[],
  database: T,
) => {
  try {
    const currentMethod = req.method;
    const currentUrl = req.url.pathname;
    for (const middleware of current) {
      if (
        middleware.method === currentMethod || middleware.method === "ALL"
      ) {
        if (!middleware.url) {
          middleware.callBack
            ? await middleware.callBack(req, res, database)
            : await attainProcedure(req, res, middleware.next as any, database);
        } else if (
          checkPathAndParseURLParams(req, middleware.url, currentUrl)
        ) {
          if (middleware.paramHandlers && req.params) {
            await paramHandlersProcedure(middleware.paramHandlers, req, res, database);
            if (res.processDone) {
              break;
            }
          }
          middleware.callBack
            ? await middleware.callBack(req, res, database)
            : await attainProcedure(req, res, middleware.next as any, database);
        }
      }
      if (res.processDone) {
        break;
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

const paramHandlersProcedure = async <T>(
  paramHandlers: ParamStackProps<T>[],
  req: Request,
  res: Response,
  database: T
) => {
  for await (const paramHandler of paramHandlers) {
    await paramHandler.callBack(req, res, req.params[paramHandler.paramName], database)
    if (res.processDone) {
      break;
    }
  }
};

const attainErrorProcedure = async <T>(
  error: Error | any,
  req: Request,
  res: Response,
  current: ErrorMiddlewareProps<T>[],
  database: T,
) => {
  try {
    const currentUrl = req.url.pathname;
    for (const middleware of current) {
      if (!middleware.url) {
        middleware.callBack
          ? await middleware.callBack(error, req, res, database)
          : await attainErrorProcedure(error, req, res, middleware.next as any, database);
      } else if (
        checkPathAndParseURLParams(req, middleware.url, currentUrl)
      ) {
        middleware.callBack
          ? await middleware.callBack(error, req, res, database)
          : await attainErrorProcedure(error, req, res, middleware.next as any, database);
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

export default Process;
