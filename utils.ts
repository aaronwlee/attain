import { pathToRegExp } from "./path-to-regexp.ts";
import { Request } from "./request.ts";

export const checkPathAndParseURLParams = (
  req: Request,
  middlewareURL: string,
  currentURL: string,
) => {
  const matchResult = pathToRegExp(middlewareURL).exec(currentURL);
  if (matchResult) {
    const params = middlewareURL.split("/").filter((splited) => splited.includes(":"));
    if (params) {
      params.forEach((param, i) => {
        if(!req.params) {
          req.params = {}
        }
        req.params[param.substring(1)] = matchResult[i + 1];
      });
    }
  }
  return matchResult ? true : false;
};

