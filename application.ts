import Router from "./router.ts";
import { ServerRequest, serve } from "./deps.ts";
import { AttainResponse, MiddlewareProps, ListenProps } from "./type.ts";
import { Request } from "./request.ts";
import Response from "./response.ts";
import { pathToRegExp } from "./path-to-regexp.ts";

class App extends Router {
  private handleRequest: any = async (main: boolean, request: Request, response: Response, current: MiddlewareProps[]) => {
    const currentMethod = request.method;
    const currentUrl = request.url.pathname;
    try {
      if (current) {
        for await (const middleware of current) {
          if (middleware.method === "ALL") {
            if (!middleware.url) {
              middleware.callBack ?
                middleware.require ? await middleware.callBack(request, response) : middleware.callBack(request, response)
                :
                await this.handleRequest(false, request, response, middleware.next)
            } else if (pathToRegExp(middleware.url).exec(currentUrl)) {
              middleware.callBack ?
                middleware.require ? await middleware.callBack(request, response) : middleware.callBack(request, response)
                :
                await this.handleRequest(false, request, response, middleware.next)
            }
          }
          if (middleware.method === currentMethod) {
            if (!middleware.url) {
              middleware.callBack ?
                middleware.require ? await middleware.callBack(request, response) : middleware.callBack(request, response)
                :
                await this.handleRequest(false, request, response, middleware.next)
            } else if (pathToRegExp(middleware.url).exec(currentUrl)) {
              middleware.callBack ?
                middleware.require ? await middleware.callBack(request, response) : middleware.callBack(request, response)
                :
                await this.handleRequest(false, request, response, middleware.next)
            }
          }
        }

        main && await response.end();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private show = (e: any) => {
    console.log(e);
    if (e.next) {
      e.next.forEach((a: any) => {
        this.show(a);
      })
    }
  }

  public listen = async ({ port }: ListenProps) => {

    // this.use((request, response) => {
    //   response.headers.set("Content-Type", "text/html; charset=utf-8");
    //   response.status = 404;
    //   response.body = "<h2>Page not found</h2>";
    //   request.respond(response);
    // });
    console.log(JSON.stringify(this.middlewares, null, 2))

    const s = serve({ port });
    for await (const req of s) {
      const response = new Response(req);
      const request = new Request(req);

      this.handleRequest(true, request, response, this.middlewares)
    }
  }


}

export default App;





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