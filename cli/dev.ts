import { ensureDir, EventEmitter, listenAndServe, acceptable, acceptWebSocket, isWebSocketCloseEvent, green, yellow, red, blue, yamlParse } from "../deps.ts";
import { startServer } from "./bin/application-start.ts";

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
    await ensureDir(`${currentPath}/.attain`);
    await startBundle();
    await injectWSClient();
    await copyStatics();
    console.log(green("[dev]"), "static files are successfully copied")
    startServer("dev");
    startWS();

    const watchingLists = ["view", "config/cdn-packages.yaml"].map(async e => await watchFile(`${currentPath}/${e}`))

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

async function startBundle(key?: string) {
  key && console.log(yellow("[dev]"), `Detected a file change ${key}`)
  const process = Deno.run({
    cmd: [
      "deno",
      "bundle",
      "--unstable",
      `--importmap=${currentPath}/import_map.json`,
      "-c",
      `${currentPath}/tsconfig.json`,
      `${currentPath}/view/index.tsx`,
      `${currentPath}/.attain/index.bundle.js`
    ],
  });

  await process.status();
  await rewireIndex();

  if (key) {
    delete processingList[key];
    eventEmitter.emit("bundled")
  }
}

async function copyStatics(path?: string) {
  for await (const dirEntry of Deno.readDir(`${currentPath}/view/public${path ? path : ""}`)) {
    if (dirEntry.name !== "index.html") {
      if (dirEntry.isDirectory) {
        ensureDir(`${currentPath}/.attain${`/${dirEntry.name}`}`)
        await copyStatics(`/${dirEntry.name}`)
      } else if (dirEntry.isFile) {
        await Deno.copyFile(`${currentPath}/view/public${path ? path : ""}${`/${dirEntry.name}`}`, `${currentPath}/.attain${path ? path : ""}${`/${dirEntry.name}`}`);
      }
    }
  }
}

async function rewireIndex() {
  const indexHTML = await Deno.readTextFile(`${currentPath}/view/public/index.html`);

  const devTools = `
    <!-- dev tools -->
    <script type="module" src="./reload.websocket.js" defer></script>
  `
  let replacedHTML = indexHTML.replace("{{ DevTools }}", devTools)

  const packagesYaml: any = yamlParse(Deno.readTextFileSync(`${currentPath}/config/cdn-packages.yaml`));
  if (packagesYaml["DEVELOPMENT"]) {
    const list = packagesYaml["DEVELOPMENT"].map((p: string) => `<script crossorigin src="${p}"></script>`)
    replacedHTML = replacedHTML.replace("{{ Packages }}", list.join(""))
  }

  await Deno.writeTextFile(`${currentPath}/.attain/index.html`, replacedHTML);

  console.log(green("[dev]"), "index.html has been successfully rewired")
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