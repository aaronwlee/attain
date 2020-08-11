import { Request, Response } from "../mod.ts";
import {
  green,
  cyan,
  red,
  yellow,
  bold,
  magenta,
} from "../deps.ts";

const colorize = (status: number) => {
  if (status >= 500) {
    return red(String(status));
  } else if(status >= 400) {
    return magenta(String(status));
  } else if (status >= 300) {
    return yellow(String(status));
  }
  return cyan(String(status));
}

export const logger = (_: Request, res: Response) => {
  res.pend(
    (pendReq, pendRes) => {
      const ms = Date.now() - pendReq.startDate;
      console.log(
        `${green(pendReq.method)} ${colorize(pendRes.getStatus!)} ${pendReq.url.pathname} - ${bold(String(ms))}ms`,
      );
    },
  );
};
