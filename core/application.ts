import { Router } from "./router.ts";
import {
  serve,
  serveTLS,
  cyan,
  green,
  red,
  blue,
  Server,
} from "../deps.ts";
import { ListenProps, ThenArg } from "./types.ts";
import version from "../version.ts";
import { defaultError, defaultPageNotFound } from "../defaultHandler/index.ts";
import { AttainHandler } from "./process.ts";
import { circulateMiddlewares, circulateErrorMiddlewares } from "./debug.ts";
import { AttainDatabase, NoParamConstructor } from "./database.ts";

export class App<T = any> extends Router<T> {
  #serve?: Server;
  #serveTLS?: Server;
  #process?: Promise<void>;
  #processTLS?: Promise<void>;
  #database?: T;
  #databaseInitializer?: () => Promise<T>
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
    { port, secure, keyFile, certFile, hostname = "0.0.0.0", debug = false }:
      ListenProps,
  ) => {
    const mode = Deno.env.get("PRODUCTION") ? "PRODUCTION" : (Deno.env.get("DEVELOPMENT") ? "DEVELOPMENT" : "GENERAL")
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
      `[${blue(mode)}] ${cyan("Attain FrameWork")} ${blue("v" + version.toString())} - ${
      green("Ready!")
      }`,
    );

    if (secure && keyFile && certFile) {
      this.#serveTLS = serveTLS({ hostname, port, keyFile, certFile });
      this.#processTLS = this.#start(this.#serveTLS, secure);
    } else {
      this.#serve = serve({ hostname, port });
      this.#process = this.#start(this.#serve);
    }
    console.log(
      `Server running at ${secure ? "https:" : "http:"}//localhost:${port}`,
    );
  };

  #start = async (server: Server, secure: boolean = false) => {
    if (this.#database) {
      await (this.#database as any).connect();
      this.#handler = new AttainHandler<T>(this.#database, secure);
    } else if (this.#databaseInitializer) {
      this.#database = await this.#databaseInitializer();
      this.#handler = new AttainHandler<T>(this.#database, secure);
    } else {
      this.#handler = new AttainHandler<T>(undefined!, secure);
    }

    for await (const srq of server) {
      this.#handler.execute(srq, this.middlewares as any, this.errorMiddlewares as any);
    }
  };

  constructor(db?: T, dbinit?: () => Promise<T>) {
    super()
    if (db) {
      this.#database = db;
    }

    if (dbinit) {
      this.#databaseInitializer = dbinit;
    }
  }

  static startWith<T extends typeof App, U>(this: T, func: () => Promise<U>): App<ThenArg<U>>;
  static startWith<T extends typeof App, U extends AttainDatabase>(this: T, dbClass: NoParamConstructor<U>): App<U>
  static startWith<T extends typeof App, U>(this: T, arg: U) {
    if ((arg as any).__type) {
      return new this<U>(new (arg as any)())
    } else {
      return new this<ThenArg<U>>(undefined, arg as any)
    }
  }

  public database<U>(func: () => Promise<U>): void;
  public database<U extends AttainDatabase>(dbClass: NoParamConstructor<U>): void;
  public database(arg: any) {
    if (arg.__type) {
      this.#database = new (arg as any)();
    } else {
      this.#databaseInitializer = arg;
    }
  }
}
