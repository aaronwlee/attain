import { Router } from "./router.ts";
import { serve } from "./deps.ts";
import { MiddlewareProps, ListenProps } from "./types.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams, fresh } from "./utils.ts";

export class App extends Router {
  private handleRequest: any = async (
    request: Request,
    response: Response,
    current: MiddlewareProps[],
  ) => {
    const currentMethod = request.method;
    const currentUrl = request.url.pathname;
    let continueToken = true;
    response.readyToSend.then(() => continueToken = false);
    try {
      if (current) {
        for await (const middleware of current) {
          if (
            middleware.method === currentMethod || middleware.method === "ALL"
          ) {
            if (!middleware.url) {
              middleware.callBack
                ? await middleware.callBack(request, response)
                : await this.handleRequest(request, response, middleware.next);
            } else if (
              checkPathAndParseURLParams(request, middleware.url, currentUrl)
            ) {
              middleware.callBack
                ? await middleware.callBack(request, response)
                : await this.handleRequest(request, response, middleware.next);
            }
          }
          if (!continueToken) {
            // cache(request, response, middleware);
            response.executePending.resolve();
            break;
          }
        }

        // await response.end();
      }
    } catch (error) {
      console.log(error);
    }
  };

  public listen = async (
    { port, debug = false }: ListenProps,
  ) => {
    debug && console.log(JSON.stringify(this.middlewares, null, 2));

    const s = serve({ port });
    for await (const req of s) {
      const response = new Response(req);
      const request = response.request;

      this.handleRequest(request, response, this.middlewares);
    }
  };
}
