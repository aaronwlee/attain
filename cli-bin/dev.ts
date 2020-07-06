import { ensureDir, EventEmitter, listenAndServe, acceptable, acceptWebSocket, isWebSocketCloseEvent, parseAll } from "../deps.ts";
import { startServer } from "./start.ts";

const currentPath = Deno.cwd();

const processingList: any = {}
const eventEmitter = new EventEmitter();

export async function startDev() {
  try {
    await Deno.remove(`${currentPath}/.attain`, { recursive: true });
  } catch (err) {
    console.log("don't need to remove cached files")
  }
  await ensureDir(`${currentPath}/.attain`);
  await startBundle();
  await injectWSClient();
  await copyStatics();
  console.log("static files are successfully copied")
  startServer("dev");
  startWS();

  for await (const event of Deno.watchFs(`${currentPath}/view`)) {
    const key = event.paths[0]
    if (!Object.keys(processingList).find((p: any) => p === key)) {
      processingList[key] = true
      startBundle(key);
    }
  }
}

async function startBundle(key?: string) {
  try {
    key && console.log(`Detected a file change ${key}`)
    const process = Deno.run({
      cmd: [
        "deno",
        "bundle",
        "-c",
        `${currentPath}/react.tsconfig.json`,
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
  } catch (e) {
    console.error("bundle error", e)
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
  const decoder = new TextDecoder("utf-8");
  const readStream = Deno.readFileSync(`${currentPath}/view/public/index.html`);
  const indexHTML = decoder.decode(readStream);
  const devReact = `
    <!-- react, react-dom dev bundles -->
    <script crossorigin src="//unpkg.com/react@16/umd/react.development.js"></script>
    <script crossorigin src="//unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  `
  let replacedHTML = indexHTML.replace("{{ React }}", devReact)


  const devTools = `
    <!-- dev tools -->
    <script type="module" src="./reload.websocket.js" defer></script>
  `
  replacedHTML = replacedHTML.replace("{{ DevTools }}", devTools)

  const packagesYaml: any = parseAll(Deno.readTextFileSync(`${currentPath}/packages.yaml`));
  if (packagesYaml[0].CDN) {
    const list = packagesYaml[0].CDN.map((p: string) => `<script crossorigin src="${p}"></script>`)
    replacedHTML = replacedHTML.replace("{{ Packages }}", list.join(""))
  }

  const encoder = new TextEncoder();
  const writeStream = encoder.encode(replacedHTML);
  await Deno.writeFile(`${currentPath}/.attain/index.html`, writeStream);

  console.log("index.html has been rewired")
}

async function injectWSClient() {
  const wsClient = `
  let ws = new WebSocket("ws://localhost:5900");
  ws.addEventListener("message", onMessageReceived);

  function onMessageReceived() {
    location.reload();
  }
`

  const encoder = new TextEncoder();
  const writeStream = encoder.encode(wsClient);
  await Deno.writeFile(`${currentPath}/.attain/reload.websocket.js`, writeStream);

  console.log("reload.websocket.js has been created")
}

function startWS() {
  try {
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
    console.error("reload websocket server error", error)
    Deno.exit(1);
  }

}