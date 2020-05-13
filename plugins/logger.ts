import Router from "../router.ts";
import {
  green,
  cyan,
  bold,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

const logger = new Router();

logger.use(async (req, res) => {
  const start = Date.now();
  await res.readyToSend
  const ms = Date.now() - start;
  res.getHeaders.set("X-Response-Time", `${ms}ms`);
});

logger.use(async (req, res) => {
  await res.readyToSend
  const rt = res.getHeaders.get("X-Response-Time");
  console.log(`${green(req.method)} ${cyan(String(res.getStatus))} ${req.url.pathname} - ${bold(String(rt))}`);
})

export default logger;