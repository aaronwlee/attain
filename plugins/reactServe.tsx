import { Router, staticServe } from "../mod.ts";
// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from 'https://jspm.dev/react@16.13.1';
// @deno-types="https://deno.land/x/types/react-dom/v16.13.1/server.d.ts"
import ReactDOMServer from 'https://jspm.dev/react-dom@16.13.1/server';
import { AttainRouter } from "../react/AttainRouter.js";
import { getHead } from "../react/AttainReactUtils.js";

const getPageFiles = async (list: any, entry: string, path: string) => {
  for await (const dirEntry of Deno.readDirSync(`${path}`)) {
    if (dirEntry.isFile && dirEntry.name.includes(".tsx")) {
      const rootPath = path.replace(entry, "");
      const routePath = rootPath.replace("/view/pages", "")
      const browerPath = dirEntry.name.replace(".tsx", "")
      let fullPath = ""
      if (browerPath === "index") {
        if (!routePath) {
          fullPath = "/"
        }
        else {
          fullPath = `${routePath}`
        }
      } else {
        fullPath = `${routePath}/${browerPath}`
      }
      const component: any = (await import(`file://${Deno.realPathSync(`${path}/${dirEntry.name}`)}`)).default;

      if (component.name) {
        list[fullPath] = {
          filePath: `${rootPath}/${dirEntry.name}`,
          Component: component,
          name: component.name
        }
      }
    } else if (dirEntry.isDirectory) {
      getPageFiles(list, entry, `${path}/${dirEntry.name}`)
    }
  }
}

export async function reactServe({
  MainComponent,
  DocumentComponent,
  developmentPath,
  productionPath
}: {
  MainComponent: any,
  DocumentComponent: any,
  developmentPath?: string,
  productionPath?: string
}) {
  const router = new Router();
  const isProduction = Deno.env.get("PRODUCTION");
  const pages: any = {};
  await getPageFiles(pages, `${Deno.cwd()}`, `${Deno.cwd()}/view/pages`);
  const preloadList = Object.keys(pages).map(key => <link rel="preload" href={pages[key].filePath} as="script" />)

  // const compiler = new ReactCompiler({
  //   pageFileInfo: pages,
  //   jsbundlePath: "/main.js",
  //   entryName: MainComponent.name
  // })
  // await compiler.build();
  console.log("pages", pages);

  router.get("/*", async (req, res) => {
    const { pathname } = req.url;
    const isReactPath = pathname.split(".").length === 1;

    if (isReactPath) {
      const SSR = await MainComponent.ServerSideAttain({ req, res, pages, isServer: true })
      // ...preloadList, <link rel="preload" href={"/main.js"} as="script" />
      const HTML = await DocumentComponent.ServerSideAttain({
        req, res,
        PreloadScript: () => [],
        MainScript: () => <script type="module" src={"/main.js"} async />,
        Main:
          <AttainRouter pathname={pathname}>
            <MainComponent SSR={SSR} />
          </AttainRouter>

      })
      const headers = getHead()
      let html = "<!DOCTYPE html>\n" + (ReactDOMServer as any).renderToString(
        <DocumentComponent {...{ ...HTML, Main: () => <div dangerouslySetInnerHTML={{ __html: HTML.Main }} /> }} headers={headers} />
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
      await res.setHeader("Content-Type", "application/javascript").sendFile(`${Deno.cwd()}/${isProduction ? productionPath || "dist" : developmentPath || ".attain"}${pathname}`);
    }
  }, staticServe(`${Deno.cwd()}/${isProduction ? productionPath || "dist" : developmentPath || ".attain"}`, { maxAge: isProduction ? 100000 : 0 }))

  return router;
}