import { Router } from "./router.ts";
import { serve, serveTLS } from "./deps.ts";
import { MiddlewareProps, ListenProps } from "./types.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams, fresh } from "./utils.ts";

export class App extends Router {
  #isSecure: boolean | undefined;

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
            response.executePending.resolve(request);
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
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    debug && console.log(JSON.stringify(this.middlewares, null, 2));

    if (secure) {
      if (!keyFile || !certFile) {
        throw "TLS mode require keyFile and certFile options.";
      }
      this.#isSecure = true;
    }

    const s = secure && keyFile && certFile
      ? serveTLS({ hostname, port, keyFile, certFile })
      : serve({ hostname, port });
    for await (const req of s) {
      const response = new Response(req);
      const request = new Request(req);

      this.handleRequest(request, response, this.middlewares).catch((
        error: any,
      ) => console.error("Unhandled Attain error: ", error));
    }
  };
}
