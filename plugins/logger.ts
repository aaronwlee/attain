import { Router } from "../mod.ts";
import {
  green,
  cyan,
  bold,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

const logger = new Router();

logger.use((req, res) => {
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
});

export default logger;
