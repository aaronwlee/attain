import { Router } from "./router.ts";
import {
  serve,
  serveTLS,
  cyan,
  green,
  red,
  blue,
  Server,
} from "./deps.ts";
import { ListenProps } from "./types.ts";
import version from "./version.ts";
import { defaultError, defaultPageNotFound } from "./defaultHandler/index.ts";
import Process from "./process.ts";
import { circulateMiddlewares, circulateErrorMiddlewares } from "./debug.ts";
import { staticServe } from "./plugins/staticServe.ts";
import { getEnvFlags } from "./utils.ts";


export class App extends Router {
  #serve?: Server;
  #serveTLS?: Server;
  #process?: Promise<void>;
  #processTLS?: Promise<void>;

  #debug = async () => {
    console.log(red("------- Debug Middlewares -----------------"));
    circulateMiddlewares(this.middlewares);
    console.log(red("------- End Debug Middlewares -------------\n"));

    console.log(red("------- Debug Error Middlewares -----------"));
    circulateErrorMiddlewares(this.errorMiddlewares);
    console.log(red("------- End Debug Error Middlewares -------\n"));
  };

  #modeInit = async () => {
    const options = getEnvFlags()

    if (options.mode === "fullstack") {
      console.log(cyan(JSON.stringify(options, undefined, 2)))

      if (options.env === "development") {
        this.get("/*", async (req, res) => {
          const { pathname } = req.url;
          const isReactPath = pathname.split(".").length === 1;

          if (isReactPath) {
            await res.sendFile("./.attain/index.html");
          }
        }, staticServe("./.attain", { maxAge: 1000 }));

      } else if (options.env === "production") {
        this.get("/*", async (req, res) => {
          const { pathname } = req.url;
          const isReactPath = pathname.split(".").length === 1;

          if (isReactPath) {
            await res.sendFile("./dist/index.html");
          }
        }, staticServe("./dist", { maxAge: 1000 }));
      }
    }
  }

  close = async () => {
    if (this.#serve) {
      this.#serve.close();
      await this.#process;
    }

    if (this.#serveTLS) {
      this.#serveTLS.close();
      await this.#processTLS;
    }
  };

  /**
   * Start to listen
   */
  listen = (
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    this.#modeInit();

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

    console.log(
      `${cyan("Attain FrameWork")} ${blue("v" + version.toString())} - ${
      green("Ready!")
      }`,
    );

    if (secure && keyFile && certFile) {
      this.#serveTLS = serveTLS({ hostname, port, keyFile, certFile });
      this.#processTLS = this.#start(this.#serveTLS);
    } else {
      this.#serve = serve({ hostname, port });
      this.#process = this.#start(this.#serve);
    }
    console.log(
      `Server running at ${secure ? "https:" : "http:"}//localhost:${port}`,
    );
  };

  #start = async (server: Server) => {
    for await (const srq of server) {
      Process(srq, this.middlewares, this.errorMiddlewares);
    }
  };
}
