import { Response } from "./response.ts";
import { Request } from "./request.ts";
import { SupportMethodType, MiddlewareProps } from "./types.ts";

interface StateProps {
  url: string;
  method: SupportMethodType;
  req: Request;
  res: Response;
  lastMiddleware: MiddlewareProps[];
}

const state: StateProps[] = [];

const push = (prop: StateProps) => {
  const existed = getCached(prop.url, prop.method);
  if (existed) {
    return state[state.indexOf(existed)] = prop;
  }
  if (state.length > 20) {
    state.shift();
  }
  state.push(prop);
};

export const cache = (
  req: Request,
  res: Response,
  lastMiddleware: MiddlewareProps,
) => {
  push({
    url: req.url.pathname,
    req,
    res,
    method: req.method,
    lastMiddleware: [lastMiddleware],
  });
};

export const getCached = (
  url: string,
  method: string,
): StateProps | undefined => {
  return state.find((s) => s.url === url && s.method === method);
};
