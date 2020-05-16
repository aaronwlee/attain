import { Request, Response } from "../mod.ts";
import {
  green,
  cyan,
  bold,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

export const logger = (req: Request, res: Response) => {
  const start = Date.now();
  res.whenReady(
    () => {
      const ms = Date.now() - start;
      res.getHeaders.set("X-Response-Time", `${ms}ms`);
    },
    () => {
      const rt = res.getHeaders.get("X-Response-Time");
      console.log(
        `${green(req.method)} ${
          cyan(String(res.getStatus))
        } ${req.url.pathname} - ${bold(String(rt))}`,
      );
    },
  );
};
