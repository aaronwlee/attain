import { Router } from "./router.ts";
import { blue, cyan, green, red } from "../deps.ts";
import type { AttainListenProps, ThenArg } from "./types.ts";
import version from "../version.ts";
import { defaultError, defaultPageNotFound } from "../defaultHandler/index.ts";
import { AttainHandler } from "./process.ts";
import { circulateErrorMiddlewares, circulateMiddlewares } from "./debug.ts";
import type { AttainDatabase, NoParamConstructor } from "./database.ts";

export class App<T = any> extends Router<T> {
  #serve?: Deno.Listener;
  #serveTLS?: Deno.Listener;
  #process?: Promise<void>;
  #processTLS?: Promise<void>;
  #database?: T;
  #databaseInitializer?: () => Promise<T>;
  #handler?: AttainHandler<T>;

  #debug = async () => {
    console.log(red("------- Debug Middlewares -----------------"));
    circulateMiddlewares(this.middlewares);
    console.log(red("------- End Debug Middlewares -------------\n"));

    console.log(red("------- Debug Error Middlewares -----------"));
    circulateErrorMiddlewares(this.errorMiddlewares);
    console.log(red("------- End Debug Error Middlewares -------\n"));
  };

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
    port: number,
    linstenProps?: AttainListenProps,
  ) => {
    const options = { hostname: "0.0.0.0", debug: false, ...linstenProps };
    const mode = Deno.env.get("PRODUCTION")
      ? "PRODUCTION"
      : (Deno.env.get("DEVELOPMENT") ? "DEVELOPMENT" : "GENERAL");
    this.use(defaultPageNotFound);
    this.error(defaultError);

    if (options.debug) {
      this.#debug();
    }

    if (options.secure) {
      if (!options.keyFile || !options.certFile) {
        throw "TLS mode require keyFile and certFile options.";
      }
    }

    console.log(
      `[${blue(mode)}] ${cyan("Attain FrameWork")} ${
        blue("v" + version.toString())
      } - ${green("Ready!")}`,
    );

    if (options.secure && options.keyFile && options.certFile) {
      this.#serveTLS = Deno.listenTls({
        hostname: options.hostname,
        port,
        keyFile: options.keyFile,
        certFile: options.certFile,
      });
      this.#processTLS = this.#start(this.#serveTLS, options.secure);
    } else {
      this.#serve = Deno.listen({ hostname: options.hostname, port });
      this.#process = this.#start(this.#serve);
    }
    console.log(
      `Server running at ${
        options.secure ? "https:" : "http:"
      }//localhost:${port}`,
    );
  };

  #start = async (server: Deno.Listener, secure: boolean = false) => {
    if (this.#database) {
      await (this.#database as any).connect();
      this.#handler = new AttainHandler<T>(this.#database, secure);
    } else if (this.#databaseInitializer) {
      this.#database = await this.#databaseInitializer();
      this.#handler = new AttainHandler<T>(this.#database, secure);
    } else {
      this.#handler = new AttainHandler<T>(undefined!, secure);
    }

    for await (const conn of server) {
      (async () => {
        const httpConn = Deno.serveHttp(conn);
        for await (const requestEvent of httpConn) {
          this.#handler!.execute(
            requestEvent!,
            this.middlewares as any,
            this.errorMiddlewares as any,
          );
        }
      })();
    }
  };

  constructor(db?: T, dbinit?: () => Promise<T>) {
    super();
    if (db) {
      this.#database = db;
    }

    if (dbinit) {
      this.#databaseInitializer = dbinit;
    }
  }

  static startWith<T extends typeof App, U>(
    this: T,
    func: () => Promise<U>,
  ): App<ThenArg<U>>;
  static startWith<T extends typeof App, U extends AttainDatabase>(
    this: T,
    dbClass: NoParamConstructor<U>,
  ): App<U>;
  static startWith<T extends typeof App, U>(this: T, arg: U) {
    if ((arg as any).__type) {
      return new this<U>(new (arg as any)());
    } else {
      return new this<ThenArg<U>>(undefined, arg as any);
    }
  }

  public database<U>(func: () => Promise<U>): void;
  public database<U extends AttainDatabase>(
    dbClass: NoParamConstructor<U>,
  ): void;
  public database(arg: any) {
    if (arg.__type) {
      this.#database = new (arg as any)();
    } else {
      this.#databaseInitializer = arg;
    }
  }
}
