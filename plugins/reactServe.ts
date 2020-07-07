import { Router, staticServe } from "../mod.ts";

type ReactServe = (developmentPath?: string, productionPath?: string) => Router;

export const reactServe: ReactServe = (developmentPath = ".attain", productionPath = "dist") => {
  const handler = new Router();
  const isProduction = Deno.env.get("PRODUCTION");

  handler.get("/*", async (req, res) => {
    const { pathname } = req.url;
    const isReactPath = pathname.split(".").length === 1;

    if (isReactPath) {
      await res.sendFile(`./${isProduction ? productionPath : developmentPath}/index.html`);
    }
  }, staticServe(`./${isProduction ? productionPath : developmentPath}`, { maxAge: 10000 }));

  return handler;
}
