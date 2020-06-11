import {
  MiddlewareProps,
  CallBackType,
  SupportMethodType,
  ErrorCallBackType,
  ErrorMiddlewareProps,
  ParamCallBackType,
  ParamStackProps,
} from "./types.ts";
import { App } from "./application.ts";
import { isEmpty } from "./deps.ts";

export class Router {
  #middlewares: MiddlewareProps[] = [];
  #errorMiddlewares: ErrorMiddlewareProps[] = [];
  #paramHandlerStacks: ParamStackProps[] = [];

  get middlewares() {
    return this.#middlewares;
  }

  get errorMiddlewares() {
    return this.#errorMiddlewares;
  }

  private isString(arg: any): boolean {
    return typeof arg === "string";
  }

  private appendParentsPaths(currentPath: string): string {
    let newPath: string = currentPath;
    if (currentPath !== "/") {
      newPath += "(.*)";
    }
    return newPath;
  }

  private appendNextPaths(
    parentsPath: string,
    middlewares: MiddlewareProps[] | ErrorMiddlewareProps[],
  ): MiddlewareProps[] | ErrorMiddlewareProps[] {
    const newMiddlewares: MiddlewareProps[] = [];
    middlewares.forEach((middleware: any) => {
      if (middleware.url && parentsPath !== "/") {
        const combinedUrl = `${parentsPath}${
          middleware.url === "/" ? "" : middleware.url
          }`;
        newMiddlewares.push({
          ...middleware,
          url: combinedUrl.includes("(.*)")
            ? combinedUrl
            : combinedUrl.replace(/\*/g, "(.*)"),
          next: middleware.next
            ? this.appendNextPaths(parentsPath, middleware.next)
            : middleware.next,
        });
      } else {
        newMiddlewares.push(middleware);
      }
    });
    return newMiddlewares;
  }

  /**
   * @false Callback
   * @true Instance
   */
  private isInstance(arg: any): boolean {
    return arg instanceof App || arg instanceof Router;
  }

  private saveMiddlewares(
    type: SupportMethodType,
    args: any[],
  ) {
    let temp: MiddlewareProps = { method: type };
    args.forEach((arg) => {
      if (this.isString(arg)) {
        temp.url = arg;
      } else {
        if (this.isInstance(arg)) {
          if (temp.url) {
            if (temp.url.includes("*")) {
              throw "If middleware has a next, the parent's middleware can't have a wildcard. : " +
              temp.url;
            }
            temp.next =
              (this.appendNextPaths(
                temp.url,
                arg.middlewares,
              ) as MiddlewareProps[]);
            temp.url = this.appendParentsPaths(temp.url);
          } else {
            temp.next = arg.middlewares;
          }
        } else {
          if (temp.url) {
            temp.url = temp.url.includes("(.*)")
              ? temp.url
              : temp.url.replace(/\*/g, "(.*)");

            const matchedParamHandler = this.#paramHandlerStacks.filter(paramHandler => temp.url?.includes(`:${paramHandler.paramName}`));

            if (!isEmpty(matchedParamHandler)) {
              temp.paramHandlers = matchedParamHandler;
            }
          }
          temp.callBack = arg as CallBackType;
        }
      }

      if (temp.callBack || temp.next) {
        this.middlewares.push(temp);
        temp = temp.url ? { method: type, url: temp.url } : { method: type };
      }
    });
  }

  private saveParamStacks(
    paramName: string,
    args: ParamCallBackType[],
  ) {
    args.forEach((arg) => {
      this.#paramHandlerStacks.push({ paramName, callBack: arg });
    });
  }

  private saveErrorMiddlewares(
    args: any[],
  ) {
    let temp: ErrorMiddlewareProps = {};
    args.forEach((arg) => {
      if (this.isString(arg)) {
        temp.url = arg;
      } else {
        if (this.isInstance(arg)) {
          if (temp.url) {
            if (temp.url.includes("*")) {
              throw new Error(
                `If middleware has a next, the parent's middleware can't have a wildcard. ${temp.url}`,
              );
            }
            temp.next =
              (this.appendNextPaths(
                temp.url,
                arg.errorMiddlewares,
              ) as ErrorMiddlewareProps[]);
            temp.url = this.appendParentsPaths(temp.url);
          } else {
            temp.next = arg.errorMiddlewares;
          }
        } else {
          if (temp.url) {
            temp.url = temp.url.includes("(.*)")
              ? temp.url
              : temp.url.replace(/\*/g, "(.*)");
          }
          temp.callBack = arg as ErrorCallBackType;
        }
      }

      if (temp.callBack || temp.next) {
        this.errorMiddlewares.push(temp);
        temp = temp.url ? { url: temp.url } : {};
      }
    });
  }

  public use(app: App | Router): void;
  public use(callBack: CallBackType): void;
  public use(...callBack: CallBackType[]): void;
  public use(url: string, callBack: CallBackType): void;
  public use(url: string, ...callBack: CallBackType[]): void;
  public use(url: string, app: App | Router): void;
  public use(
    ...args: any
  ) {
    this.saveMiddlewares("ALL", args);
  }

  public get(app: App | Router): void;
  public get(callBack: CallBackType): void;
  public get(...callBack: CallBackType[]): void;
  public get(url: string, callBack: CallBackType): void;
  public get(url: string, ...callBack: CallBackType[]): void;
  public get(url: string, app: App | Router): void;
  public get(
    ...args: any
  ) {
    this.saveMiddlewares("GET", args);
  }

  public post(app: App | Router): void;
  public post(callBack: CallBackType): void;
  public post(...callBack: CallBackType[]): void;
  public post(url: string, callBack: CallBackType): void;
  public post(url: string, ...callBack: CallBackType[]): void;
  public post(url: string, app: App | Router): void;
  public post(
    ...args: any
  ) {
    this.saveMiddlewares("POST", args);
  }

  public put(app: App | Router): void;
  public put(callBack: CallBackType): void;
  public put(...callBack: CallBackType[]): void;
  public put(url: string, callBack: CallBackType): void;
  public put(url: string, ...callBack: CallBackType[]): void;
  public put(url: string, app: App | Router): void;
  public put(
    ...args: any
  ) {
    this.saveMiddlewares("PUT", args);
  }

  public patch(app: App | Router): void;
  public patch(callBack: CallBackType): void;
  public patch(...callBack: CallBackType[]): void;
  public patch(url: string, callBack: CallBackType): void;
  public patch(url: string, ...callBack: CallBackType[]): void;
  public patch(url: string, app: App | Router): void;
  public patch(
    ...args: any
  ) {
    this.saveMiddlewares("PATCH", args);
  }

  public delete(app: App | Router): void;
  public delete(callBack: CallBackType): void;
  public delete(...callBack: CallBackType[]): void;
  public delete(url: string, callBack: CallBackType): void;
  public delete(url: string, ...callBack: CallBackType[]): void;
  public delete(url: string, app: App | Router): void;
  public delete(
    ...args: any
  ) {
    this.saveMiddlewares("DELETE", args);
  }

  public options(app: App | Router): void;
  public options(callBack: CallBackType): void;
  public options(...callBack: CallBackType[]): void;
  public options(url: string, callBack: CallBackType): void;
  public options(url: string, ...callBack: CallBackType[]): void;
  public options(url: string, app: App | Router): void;
  public options(
    ...args: any
  ) {
    this.saveMiddlewares("OPTIONS", args);
  }

  public error(app: App | Router): void;
  public error(callBack: ErrorCallBackType): void;
  public error(...callBack: ErrorCallBackType[]): void;
  public error(url: string, callBack: ErrorCallBackType): void;
  public error(url: string, ...callBack: ErrorCallBackType[]): void;
  public error(url: string, app: App | Router): void;
  public error(
    ...args: any
  ) {
    this.saveErrorMiddlewares(args);
  }

  /**
   * Param handler
   * @param {string} paramName param name ex) `username`
   * @param {ParamCallBackType} callBack param callback type
   */
  public param(paramName: string, ...callBack: ParamCallBackType[]) {
    this.saveParamStacks(paramName, callBack);
  }
}
