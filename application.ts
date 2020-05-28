import { Router } from "./router.ts";
import { serve, serveTLS, yellow, cyan, green, red, blue, ServerRequest } from "./deps.ts";
import { MiddlewareProps, ListenProps, ErrorMiddlewareProps } from "./types.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { checkPathAndParseURLParams, fresh } from "./utils.ts";
import version from "./version.ts";
import { defaultError, defaultPageNotFound } from "./defaultHandler/index.ts";
export class App extends Router {
  #isSecure: boolean | undefined;

  private attainProcedure: any = async (
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
                : await this.attainProcedure(request, response, middleware.next);
            } else if (
              checkPathAndParseURLParams(request, middleware.url, currentUrl)
            ) {
              middleware.callBack
                ? await middleware.callBack(request, response)
                : await this.attainProcedure(request, response, middleware.next);
            }
          }
          if (!continueToken) {
            response.executePending.resolve(request);
            break;
          }
        }
      }
    } catch (error) {
      if(error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  };

  private attainErrorProcedure: any = async (
    error: any,
    request: Request,
    response: Response,
    current: ErrorMiddlewareProps[],
  ) => {
    const currentUrl = request.url.pathname;
    let continueToken = true;
    response.readyToSend.then(() => continueToken = false);
    try {
      if (current) {
        for await (const middleware of current) {
          if (!middleware.url) {
            middleware.callBack
              ? await middleware.callBack(error, request, response)
              : await this.attainErrorProcedure(error, request, response, middleware.next);
          } else if (
            checkPathAndParseURLParams(request, middleware.url, currentUrl)
          ) {
            middleware.callBack
              ? await middleware.callBack(error, request, response)
              : await this.attainErrorProcedure(error, request, response, middleware.next);
          }
          if (!continueToken) {
            response.executePending.resolve(request);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Attain Error: Can't handle it due to Error middlewares can't afford it.")
      console.error(error);
    }
  };

  private handleRequest = async (req: ServerRequest) => {
    const response = new Response(req);
    const request = new Request(req);
    let checkSent = false;
    response.readyToSend.then(() => checkSent = true);

    try {
      await this.use(defaultPageNotFound);
      await this.attainProcedure(request, response, this.middlewares);
    } catch (error) {
      await this.error(defaultError);
      await this.attainErrorProcedure(error, request, response, this.errorMiddlewares);
    }
  }

  private circulateMiddlewares = async (currentMiddlewares: MiddlewareProps[], step: number = 0) => {
    for (const current of currentMiddlewares) {
      if (current.next) {
        const currentIndent = step + 1;
        const nextIndent = step + 2;
        console.log("   ".repeat(step) + "{")
        current.method && console.log("   ".repeat(currentIndent) + `method: ${cyan(current.method)},`)
        current.url && console.log("   ".repeat(currentIndent) + `url: ${green(current.url)},`)
        console.log("   ".repeat(currentIndent) + `next: [`)
        this.circulateMiddlewares(current.next, nextIndent);
        console.log("   ".repeat(currentIndent) + `]`)
        console.log("   ".repeat(step) + "}")
      } else {
        console.log(`${"   ".repeat(step)}{ ${current.method && `method: ${cyan(current.method)}`}${current.url ? `, url: ${green(current.url)}` : ""}${current.callBack ? `, callBack: ${yellow(current.callBack.name || "Anonymous")}` : ""} }`);
      }
    }
  }

  private circulateErrorMiddlewares = async (currentErrorMiddlewares: ErrorMiddlewareProps[], step: number = 0) => {
    for (const current of currentErrorMiddlewares) {
      if (current.next) {
        const currentIndent = step + 1;
        const nextIndent = step + 2;
        console.log("   ".repeat(step) + "{")
        current.url && console.log("   ".repeat(currentIndent) + `url: ${green(current.url)},`)
        console.log("   ".repeat(currentIndent) + `next: [`)
        this.circulateErrorMiddlewares(current.next, nextIndent);
        console.log("   ".repeat(currentIndent) + `]`)
        console.log("   ".repeat(step) + "}")
      } else {
        console.log(`${"   ".repeat(step)}{ ${current.url ? `url: ${green(current.url)}` : ""}${current.callBack ? `, callBack: ${yellow(current.callBack.name || "Anonymous")}` : ""} }`);
      }
    }
  }

  private debug = async () => {
    console.log(red("------- Debug Middlewares -------"))
    this.circulateMiddlewares(this.middlewares);
    console.log(red("------- End Debug Middlewares -------\n"))

    console.log(red("------- Debug Error Middlewares -------"))
    this.circulateErrorMiddlewares(this.errorMiddlewares);
    console.log(red("------- End Debug Error Middlewares -------\n"))
  }

  public listen = async (
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    if (debug) {
      this.debug();
    }

    if (secure) {
      if (!keyFile || !certFile) {
        throw "TLS mode require keyFile and certFile options.";
      }
      this.#isSecure = true;
    }

    console.log(`${cyan("Attain FrameWork")} ${blue("v" + version.toString())} - ${green("Ready!")}`)


    const s = secure && keyFile && certFile
      ? serveTLS({ hostname, port, keyFile, certFile })
      : serve({ hostname, port });
    for await (const req of s) {

      this.handleRequest(req)
    }
  };
}
