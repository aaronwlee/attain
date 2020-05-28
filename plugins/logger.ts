import { Request, Response } from "../mod.ts";
import {
  green,
  cyan,
  bold,
} from "../deps.ts";

export const logger = (_: Request, res: Response) => {
  res.pend(
    (pendReq, pendRes) => {
      const ms = Date.now() - pendReq.startDate;
      console.log(
        `${green(pendReq.method)} ${
          cyan(String(pendRes.getStatus))
        } ${pendReq.url.pathname} - ${bold(String(ms))}ms`,
      );
    },
  );
};
