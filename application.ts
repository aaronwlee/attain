import { Router } from "./router.ts";
import { serve, serveTLS, yellow, cyan, green, red, blue, ServerRequest, Server } from "./deps.ts";
import { MiddlewareProps, ListenProps, ErrorMiddlewareProps } from "./types.ts";
import version from "./version.ts";
import { defaultError, defaultPageNotFound } from "./defaultHandler/index.ts";
import Process from "./process.ts";

export class App extends Router {
  #serve?: Server
  #serveTLS?: Server
  #process?: Promise<void>
  #processTLS?: Promise<void>

  #circulateMiddlewares = async (currentMiddlewares: MiddlewareProps[], step: number = 0) => {
    for (const current of currentMiddlewares) {
      if (current.next) {
        const currentIndent = step + 1;
        const nextIndent = step + 2;
        console.log("   ".repeat(step) + "{")
        current.method && console.log("   ".repeat(currentIndent) + `method: ${cyan(current.method)},`)
        current.url && console.log("   ".repeat(currentIndent) + `url: ${green(current.url)},`)
        console.log("   ".repeat(currentIndent) + `next: [`)
        this.#circulateMiddlewares(current.next, nextIndent);
        console.log("   ".repeat(currentIndent) + `]`)
        console.log("   ".repeat(step) + "}")
      } else {
        console.log(`${"   ".repeat(step)}{ ${current.method && `method: ${cyan(current.method)}`}${current.url ? `, url: ${green(current.url)}` : ""}${current.callBack ? `, callBack: ${yellow(current.callBack.name || "Anonymous")}` : ""} }`);
      }
    }
  }

  #circulateErrorMiddlewares = async (currentErrorMiddlewares: ErrorMiddlewareProps[], step: number = 0) => {
    for (const current of currentErrorMiddlewares) {
      if (current.next) {
        const currentIndent = step + 1;
        const nextIndent = step + 2;
        console.log("   ".repeat(step) + "{")
        current.url && console.log("   ".repeat(currentIndent) + `url: ${green(current.url)},`)
        console.log("   ".repeat(currentIndent) + `next: [`)
        this.#circulateErrorMiddlewares(current.next, nextIndent);
        console.log("   ".repeat(currentIndent) + `]`)
        console.log("   ".repeat(step) + "}")
      } else {
        console.log(`${"   ".repeat(step)}{ ${current.url ? `url: ${green(current.url)}` : ""}${current.callBack ? `, callBack: ${yellow(current.callBack.name || "Anonymous")}` : ""} }`);
      }
    }
  }

  #debug = async () => {
    console.log(red("------- Debug Middlewares -----------------"))
    this.#circulateMiddlewares(this.middlewares);
    console.log(red("------- End Debug Middlewares -------------\n"))

    console.log(red("------- Debug Error Middlewares -----------"))
    this.#circulateErrorMiddlewares(this.errorMiddlewares);
    console.log(red("------- End Debug Error Middlewares -------\n"))
  }

  close = async () => {
    if (this.#serve) {
      this.#serve.close();
      await this.#process
    }

    if (this.#serveTLS) {
      this.#serveTLS.close();
      await this.#processTLS
    }
  }

  /**
   * Start to listen
   */
  listen = async (
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    this.use(defaultPageNotFound);
    this.error(defaultError);

    if (debug) {
      this.#debug();
    }

    if (secure) {
      if (!keyFile || !certFile) {
        throw "TLS mode require keyFile and certFile options.";
      }
    }

    console.log(`${cyan("Attain FrameWork")} ${blue("v" + version.toString())} - ${green("Ready!")}`)
    let server = null
    if (secure && keyFile && certFile) {
      this.#serveTLS = serveTLS({ hostname, port, keyFile, certFile })
      this.#processTLS = this.#start(this.#serveTLS);
    } else {
      this.#serve = serve({ hostname, port })
      this.#process = this.#start(this.#serve);
    }
    console.log(`Server running at ${secure ? "https:" : "http:"}//localhost:${port}`);
  };

  #start = async (server: Server) => {
    for await (const srq of server) {
      Process(srq, this.middlewares, this.errorMiddlewares);
    }
  }
}
