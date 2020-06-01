import { ServerRequest } from "./deps.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams } from "./utils.ts";
import { MiddlewareProps, ErrorMiddlewareProps } from "./types.ts";

const Process = async (srq: ServerRequest, middlewares: MiddlewareProps[], errorMiddlewares: ErrorMiddlewareProps[]) => {
  const res = new Response(srq);
  const req = new Request(srq);

  try {
    await attainProcedure(req, res, middlewares);
  } catch (error) {
    await attainErrorProcedure(error, req, res, errorMiddlewares);
  }

  await res.executePendingJobs(req);

  if (res.getBody) {
    await srq.respond(res.getResponse);
  } else {
    srq.conn.close();
  }
  res.destroy();
  srq.finalize();
}

const attainProcedure: any = async (
  req: Request,
  res: Response,
  current: MiddlewareProps[],
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
            ? await middleware.callBack(req, res)
            : await attainProcedure(req, res, middleware.next);
        } else if (
          checkPathAndParseURLParams(req, middleware.url, currentUrl)
        ) {
          middleware.callBack
            ? await middleware.callBack(req, res)
            : await attainProcedure(req, res, middleware.next);
        }
      }
      if (res.stop) {
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

const attainErrorProcedure: any = async (
  error: Error | any,
  req: Request,
  res: Response,
  current: ErrorMiddlewareProps[],
) => {
  try {
    const currentUrl = req.url.pathname;
    for (const middleware of current) {
      if (!middleware.url) {
        middleware.callBack
          ? await middleware.callBack(error, req, res)
          : await attainErrorProcedure(error, req, res, middleware.next);
      } else if (
        checkPathAndParseURLParams(req, middleware.url, currentUrl)
      ) {
        middleware.callBack
          ? await middleware.callBack(error, req, res)
          : await attainErrorProcedure(error, req, res, middleware.next);
      }
      if (res.stop) {
        break;
      }
    }
  } catch (error) {
    console.error("Attain Error: Can't handle it due to Error middlewares can't afford it.")
    console.error(error);
  }
};

export default Process;