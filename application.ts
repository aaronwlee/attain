import { Router } from "./router.ts";
import { serve, serveTLS, yellow, cyan, green, red, blue, ServerRequest, Server } from "./deps.ts";
import { MiddlewareProps, ListenProps, ErrorMiddlewareProps } from "./types.ts";
import version from "./version.ts";
import { defaultError, defaultPageNotFound } from "./defaultHandler/index.ts";
import Process from "./process.ts";

export class App extends Router {

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
    console.log(red("------- Debug Middlewares -----------------"))
    this.circulateMiddlewares(this.middlewares);
    console.log(red("------- End Debug Middlewares -------------\n"))

    console.log(red("------- Debug Error Middlewares -----------"))
    this.circulateErrorMiddlewares(this.errorMiddlewares);
    console.log(red("------- End Debug Error Middlewares -------\n"))
  }

  public listen = async (
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    this.use(defaultPageNotFound);
    this.error(defaultError);

    if (debug) {
      this.debug();
    }

    if (secure) {
      if (!keyFile || !certFile) {
        throw "TLS mode require keyFile and certFile options.";
      }
    }

    console.log(`${cyan("Attain FrameWork")} ${blue("v" + version.toString())} - ${green("Ready!")}`)
    const server = secure && keyFile && certFile ? serveTLS({ hostname, port, keyFile, certFile }) : serve({ hostname, port });
    console.log(`Server running at ${secure ? "https:" : "http:"}//localhost:${port} and transport: ${server.listener.addr.transport}.`);

    for await (const srq of server) {
      Process(srq, this.middlewares, this.errorMiddlewares);
    }
  };
}
