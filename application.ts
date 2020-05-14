import { Router } from "./router.ts";
import { ServerRequest, serve } from "./deps.ts";
import { AttainResponse, MiddlewareProps, ListenProps } from "./types.ts";
import { Request } from "./request.ts";
import Response from "./response.ts";
import { pathToRegExp } from "./path-to-regexp.ts";

export class App extends Router {
  private handleRequest: any = async (
    request: Request,
    response: Response,
    current: MiddlewareProps[],
  ) => {
    const currentMethod = request.method;
    const currentUrl = request.url.pathname;
    let continueToken = true;
    response.readyToSend.then((e) => continueToken = false);
    try {
      if (current) {
        for await (const middleware of current) {
          if (!continueToken) {
            break;
          }
          if (middleware.method === currentMethod || middleware.method === "ALL") {
            if (!middleware.url) {
              middleware.callBack
                ? await middleware.callBack(request, response)
                : await this.handleRequest(request, response, middleware.next);
            } else if (pathToRegExp(middleware.url).exec(currentUrl)) {
              middleware.callBack
                ? await middleware.callBack(request, response)
                : await this.handleRequest(request, response, middleware.next);
            }
          }
        }

        // await response.end();
      }
    } catch (error) {
      console.log(error);
    }
  };

  private show = (e: any) => {
    console.log(e);
    if (e.next) {
      e.next.forEach((a: any) => {
        this.show(a);
      });
    }
  };

  public listen = async ({ port, debug = false }: ListenProps) => {

    debug && console.log(JSON.stringify(this.middlewares, null, 2));

    const s = serve({ port });
    for await (const req of s) {
      const response = new Response(req);
      const request = new Request(req);

      this.handleRequest(request, response, this.middlewares);
    }
  };
}

// const promisfy = current.map(async middleware => {
//   if (middleware.method === "ALL") {
//     if (!middleware.url) {
//       return middleware.callBack ?
//         await middleware.callBack(request, response)
//         :
//         await this.handleRequest(request, response, middleware.next)
//     } else if (pathToRegExp(middleware.url).exec(currentUrl)) {
//       return middleware.callBack ?
//         await middleware.callBack(request, response)
//         :
//         await this.handleRequest(request, response, middleware.next)
//     }
//   }
//   if (middleware.method === currentMethod) {
//     if (!middleware.url) {
//       return middleware.callBack ?
//         await middleware.callBack(request, response)
//         :
//         await this.handleRequest(request, response, middleware.next)
//     } else if (pathToRegExp(middleware.url).exec(currentUrl)) {
//       return middleware.callBack ?
//         await middleware.callBack(request, response)
//         :
//         await this.handleRequest(request, response, middleware.next)
//     }
//   }
// })

// for await (const temp of promisfy) {
//   await temp;
// }
