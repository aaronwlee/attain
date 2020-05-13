import { MiddlewareProps, CallBackType } from "./type.ts";
import App from "./application.ts";

const appendParentsPaths = (currentPath: string) => {
  let newPath: string = currentPath;
  if (currentPath !== "/") {
    newPath += "(.*)";
  }
  return newPath;
}

const appendNextPaths = (parentsPath: string, middlewares: MiddlewareProps[]) => {
  const newMiddlewares: MiddlewareProps[] = []
  middlewares.forEach(middleware => {
    if (middleware.url && parentsPath !== "/") {
      newMiddlewares.push({
        ...middleware,
        url: `${parentsPath}${middleware.url === "/" ? "" : middleware.url}`,
        next: middleware.next ? appendNextPaths(parentsPath, middleware.next) : middleware.next
      })
    } else {
      newMiddlewares.push(middleware);
    }
  })
  return newMiddlewares;
}

class Router {
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

  public use(app: App | Router): void;
  public use(callBack: CallBackType, wait?: boolean): void;
  public use(url: string, callBack: CallBackType, wait?: boolean): void;
  public use(url: string, app: App | Router): void;
  public use(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "ALL", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "ALL", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "ALL", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "ALL", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }

  public get(app: App | Router): void;
  public get(callBack: CallBackType, wait?: boolean): void;
  public get(url: string, callBack: CallBackType, wait?: boolean): void;
  public get(url: string, app: App | Router): void;
  public get(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "GET", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "GET", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "GET", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "GET", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }

  public post(app: App | Router): void;
  public post(callBack: CallBackType, wait?: boolean): void;
  public post(url: string, callBack: CallBackType, wait?: boolean): void;
  public post(url: string, app: App | Router): void;
  public post(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "POST", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "POST", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "POST", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "POST", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }

  public put(app: App | Router): void;
  public put(callBack: CallBackType, wait?: boolean): void;
  public put(url: string, callBack: CallBackType, wait?: boolean): void;
  public put(url: string, app: App | Router): void;
  public put(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "PUT", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "PUT", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "PUT", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "PUT", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }


  public patch(app: App | Router): void;
  public patch(callBack: CallBackType, wait?: boolean): void;
  public patch(url: string, callBack: CallBackType, wait?: boolean): void;
  public patch(url: string, app: App | Router): void;
  public patch(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "PATCH", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "PATCH", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "PATCH", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "PATCH", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }

  public delete(app: App | Router): void;
  public delete(callBack: CallBackType, wait?: boolean): void;
  public delete(url: string, callBack: CallBackType, wait?: boolean): void;
  public delete(url: string, app: App | Router): void;
  public delete(first: string | CallBackType | App | Router, second?: CallBackType | App | Router | boolean, third: boolean = false) {
    if (typeof first === "string") {
      if (second instanceof App || second instanceof Router) {
        this.middlewares.push({ method: "DELETE", url: appendParentsPaths(first), next: appendNextPaths(first, second.middlewares) });
      } else if (typeof second === "function") {
        this.middlewares.push({ method: "DELETE", url: first, callBack: second as CallBackType, require: third });
      }
    } else if (first instanceof App || first instanceof Router) {
      this.middlewares.push({ method: "DELETE", next: first.middlewares });
    } else {
      this.middlewares.push({ method: "DELETE", callBack: first as CallBackType, require: typeof second === "boolean" && second ? second : false });
    }
  }
}

export default Router;