import { Router, staticServe } from "../mod.ts";
// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
// @deno-types="https://deno.land/x/types/react-dom/v16.13.1/server.d.ts"
import ReactDOMServer from 'https://jspm.dev/react-dom@16.13.1/server';
import { AttainRouter, getComponentAndQuery } from "../react/AttainRouter.js";
import { getHead } from "../react/AttainReactUtils.js";
import ReactViewEngine from "../viewEngine/ReactViewEngine.tsx";


export const ViewEngine = async ({
  MainComponent,
  DocumentComponent,
  PageComponentPath,
  developmentPath,
  productionPath
}: {
  MainComponent: any,
  DocumentComponent: any,
  PageComponentPath: string,
  developmentPath?: string,
  productionPath?: string
}) => {
  const router = new Router();
  const isProduction = Deno.env.get("PRODUCTION");

  const reactViewEngine = new ReactViewEngine(MainComponent, DocumentComponent, PageComponentPath);
  await reactViewEngine.load()
  //@ts-ignore
  if (!isProduction) {
    await reactViewEngine.build();
  }

  router.get("/*", async (req, res) => {
    const { pathname } = req.url;
    const isReactPath = pathname.split(".").length === 1;

    if (isReactPath) {
      const { targetPath, query, params }: any = getComponentAndQuery(reactViewEngine.pages, pathname, req.url);
      const SSR = await reactViewEngine.MainComponent.ServerSideAttain({ req, res, Component: reactViewEngine.pages[targetPath].Component, query, params, isServer: true })
      //@ts-ignore
      const HTML = await reactViewEngine.DocumentComponent.ServerSideAttain({
        req, res,
        //@ts-ignore
        MainScript: () => <script type="module" src={"/main.js"} async />,
        Main:
          //@ts-ignore
          <AttainRouter
            url={req.url}
            pages={reactViewEngine.pages}
            _currentComponentPath={targetPath}
            _query={query}
            _params={params}
            MainComponent={reactViewEngine.MainComponent}
            SSR={SSR}
          />

      })
      const headers = getHead()
      let html = "<!DOCTYPE html>\n" + (ReactDOMServer as any).renderToString(

        <reactViewEngine.DocumentComponent {...{
          ...HTML,
          //@ts-ignore
          Main: () => <div dangerouslySetInnerHTML={{ __html: HTML.Main }} />,
          preload: [
            //@ts-ignore
            <link key={0} rel="preload" crossOrigin="anonymous" href="/main.js" as="script" />,
            ...Object.keys(reactViewEngine.pages).map((pagekey, index) =>
              //@ts-ignore
              <link key={index + 1} rel="preload" crossOrigin="anonymous" href={reactViewEngine.pages[pagekey].filePath} as="script" />
            ),
          ]
        }}
          headers={headers} />
      )

      res.status(200).send(html);
    }
  }, async (req, res) => {
    const { pathname } = req.url;
    const splited = pathname.split(".");
    const fileName = splited[splited.length - 1];

    if (fileName === "tsx" || fileName === "ts") {
      if (isProduction) {
        res.setHeader("Cache-Control", `public`);
        res.headers.append("Cache-Control", `max-age=${100000 / 1000 | 0}`);
        var t = new Date();
        t.setSeconds(t.getSeconds() + 100000);
        res.setHeader("Expires", t.toUTCString());
      }
      await res
        .setHeader("Content-Type", "application/javascript")
        .sendFile(`${Deno.cwd()}/${isProduction ? productionPath || "dist" : developmentPath || ".attain"}${pathname}`);
    }
  }, staticServe(
    `${Deno.cwd()}/${isProduction ? productionPath || "dist" : developmentPath || ".attain"}`,
    { maxAge: isProduction ? 100000 : 0 }
  ))

  return router;
}