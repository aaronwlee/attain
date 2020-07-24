import { ensureDir, EventEmitter, listenAndServe, acceptable, acceptWebSocket, isWebSocketCloseEvent, green, yellow, red, blue, yamlParse } from "../deps.ts";
import { startServer } from "./bin/application-start.ts";
import { ReactCompiler } from "./bin/ReactCompiler.tsx";

const currentPath = Deno.cwd();

const processingList: any = {}
const eventEmitter = new EventEmitter();

export async function startDev() {
  try {
    await Deno.remove(`${currentPath}/.attain`, { recursive: true });
  } catch (err) {
    console.log(green("[dev]"), "don't need to remove cached files")
  }

  try {
    try {
      await ensureDir(`${currentPath}/.attain`);
    } catch (e) { }
    console.log(green("[dev]"), "Start DEV server")
    await startBundle();
    await injectWSClient();
    await copyStatics();
    console.log(green("[dev]"), "static files are successfully copied")
    startServer("dev");
    startWS();

    const watchingLists = ["view"].map(async e => await watchFile(`${currentPath}/${e}`))

    await Promise.all(watchingLists);
  } catch (initError) {
    console.log(red("[dev init error]"), initError)
    Deno.exit(1);
  }
}

async function watchFile(path: string) {
  console.log(blue("[dev]"), `start to watching ${path}`)
  for await (const event of Deno.watchFs(path)) {
    const key = event.paths[0]
    if (!Object.keys(processingList).find((p: any) => p === key)) {
      processingList[key] = true
      startBundle(key).catch(e => console.log(red("[dev bundle]"), e));
    }
  }
}

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

async function startBundle(key?: string) {
  key && console.log(yellow("[dev]"), `Detected a file change ${key}`)
  const pages: any = {};
  await getPageFiles(pages, `${Deno.cwd()}`, `${Deno.cwd()}/view/pages`);

  const compiler = new ReactCompiler({
    dist: ".attain",
    pageFileInfo: pages,
    jsbundlePath: "/main.js",
    entryName: "Main"
  })
  await compiler.build();
  console.log(green("[dev]"), "Successfully build the react")
  if (key) {
    delete processingList[key];
    eventEmitter.emit("bundled")
  }
}

async function copyStatics(path?: string) {
  for await (const dirEntry of Deno.readDir(`${currentPath}/view/public${path ? path : ""}`)) {
    if (dirEntry.name !== "index.html") {
      if (dirEntry.isDirectory) {
        try {
          ensureDir(`${currentPath}/.attain${`/${dirEntry.name}`}`)
        } catch (e) { }
        await copyStatics(`/${dirEntry.name}`)
      } else if (dirEntry.isFile) {
        await Deno.copyFile(`${currentPath}/view/public${path ? path : ""}${`/${dirEntry.name}`}`, `${currentPath}/.attain${path ? path : ""}${`/${dirEntry.name}`}`);
      }
    }
  }
}

async function injectWSClient() {
  const wsClient = `
  let ws = new WebSocket("ws://localhost:5900");
  ws.addEventListener("message", onMessageReceived);

  function onMessageReceived() {
    location.reload();
  }
`

  await Deno.writeTextFile(`${currentPath}/.attain/reload.websocket.js`, wsClient);
  console.log(green("[dev]"), "reload.websocket.js has been successfully created")
}

function startWS() {
  try {
    console.log(green("[dev socket]"), "start to listen dev socket server at ws://localhost:5900")
    listenAndServe({ port: 5900 }, async (req) => {
      if (req.method === "GET" && req.url === "/") {
        if (acceptable(req)) {
          const socket = await acceptWebSocket({
            conn: req.conn,
            bufReader: req.r,
            bufWriter: req.w,
            headers: req.headers,
          })
          const event = () => {
            socket.send("bundled")
          }
          eventEmitter.on("bundled", event)

          try {
            for await (const data of socket) {
              if (isWebSocketCloseEvent(data)) {
                eventEmitter.removeListener("bundled", event)
              }
            }
          } catch (err) {
            console.error(err)

            if (!socket.isClosed) {
              await socket.close(1000).catch(console.error);
            }
          }
        }
      }
    });
  } catch (error) {
    console.error(red("[reload websocket server error]"), error)
    Deno.exit(1);
  }

}