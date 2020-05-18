import { Request, Response } from "../mod.ts";
import {
  green,
  cyan,
  bold,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

export const logger = (_: Request, res: Response) => {
  res.whenReady(
    (doneReq, doneRes) => {
      const ms = Date.now() - doneReq.startDate;
      console.log(
        `${green(doneReq.method)} ${
          cyan(String(doneRes.getStatus))
        } ${doneReq.url.pathname} - ${bold(String(ms))}ms`,
      );
    }
  );
};
