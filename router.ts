import { MiddlewareProps, CallBackType, SupportMethodType } from "./types.ts";
import { App } from "./application.ts";

const appendParentsPaths = (currentPath: string) => {
  let newPath: string = currentPath;
  if (currentPath !== "/") {
    newPath += "(.*)";
  }
  return newPath;
};

const appendNextPaths = (
  parentsPath: string,
  middlewares: MiddlewareProps[],
) => {
  const newMiddlewares: MiddlewareProps[] = [];
  middlewares.forEach((middleware) => {
    if (middleware.url && parentsPath !== "/") {
      newMiddlewares.push({
        ...middleware,
        url: `${parentsPath}${middleware.url === "/" ? "" : middleware.url}`,
        next: middleware.next
          ? appendNextPaths(parentsPath, middleware.next)
          : middleware.next,
      });
    } else {
      newMiddlewares.push(middleware);
    }
  });
  return newMiddlewares;
};

export class Router {
  public middlewares: MiddlewareProps[] = [];

  // public use(app: App | Router): void;
  // public use(...callBack: [CallBackType]): void;
  // public use(url: string, callBack: CallBackType): void;
  // public use(url: string, app: App | Router): void;
  // public use(url: string, ...others: [CallBackType | App | Router])
  // public use(...arg) {

  // }
  // public use(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
  //   if (typeof first === "string") {
  //     if (second instanceof App || second instanceof Router) {
  //       this.middlewares.push({ method: "ALL", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
  //     } else if (typeof second === "function") {
  //       this.middlewares.push({ method: "ALL", url: first, callBack: second as CallBackType, require: third });
  //     }
  //   } else if (first instanceof App || first instanceof Router) {
  //     this.middlewares.push({ method: "ALL", next: first.middlewares });
  //   } else {
  //     this.middlewares.push({ method: "ALL", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
  //   }
  // }

  private saveMiddlewares(
    first: string | CallBackType | App | Router,
    second: CallBackType | App | Router | undefined = undefined,
    type: SupportMethodType,
  ) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push(
          {
            method: type,
            url: appendParentsPaths(first),
            next: appendNextPaths(first, second.middlewares),
          },
        );
      } else if (typeof second === "function") {
        this.middlewares.push(
          { method: type, url: first, callBack: second as CallBackType },
        );
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: type, next: first.middlewares });
    } else {
      this.middlewares.push({ method: type, callBack: first as CallBackType });
    }
  }

  public use(app: App | Router): void;
  public use(callBack: CallBackType): void;
  public use(url: string, callBack: CallBackType): void;
  public use(url: string, app: App | Router): void;
  public use(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "ALL");
  }

  public get(app: App | Router): void;
  public get(callBack: CallBackType): void;
  public get(url: string, callBack: CallBackType): void;
  public get(url: string, app: App | Router): void;
  public get(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "GET");
  }

  public post(app: App | Router): void;
  public post(callBack: CallBackType): void;
  public post(url: string, callBack: CallBackType): void;
  public post(url: string, app: App | Router): void;
  public post(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "POST");
  }

  public put(app: App | Router): void;
  public put(callBack: CallBackType): void;
  public put(url: string, callBack: CallBackType): void;
  public put(url: string, app: App | Router): void;
  public put(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "PUT");
  }

  public patch(app: App | Router): void;
  public patch(callBack: CallBackType): void;
  public patch(url: string, callBack: CallBackType): void;
  public patch(url: string, app: App | Router): void;
  public patch(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "PATCH");
  }

  public delete(app: App | Router): void;
  public delete(callBack: CallBackType): void;
  public delete(url: string, callBack: CallBackType): void;
  public delete(url: string, app: App | Router): void;
  public delete(
    first: string | CallBackType | App | Router,
    second?: CallBackType | App | Router,
  ) {
    this.saveMiddlewares(first, second, "DELETE");
  }
}
