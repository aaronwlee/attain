import { MiddlewareProps, CallBackType, SupportMethodType } from "./types.ts";
import { App } from "./application.ts";

export class Router {
  public middlewares: MiddlewareProps[] = [];

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
    middlewares: MiddlewareProps[],
  ): MiddlewareProps[] {
    const newMiddlewares: MiddlewareProps[] = [];
    middlewares.forEach((middleware) => {
      if (middleware.url && parentsPath !== "/") {
        newMiddlewares.push({
          ...middleware,
          url: `${parentsPath}${middleware.url === "/" ? "" : middleware.url}`,
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
            temp.next = this.appendNextPaths(temp.url, arg.middlewares);
            temp.url = this.appendParentsPaths(temp.url);
          } else {
            temp.next = arg.middlewares;
          }
        } else {
          temp.callBack = arg as CallBackType;
        }
      }

      if (temp.callBack || temp.next) {
        this.middlewares.push(temp);
        console.log(temp);
        temp = { method: type };
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
}
