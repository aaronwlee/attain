import {
  App,
  logger,
  security,
} from "../../mod.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "https://deno.land/std/ws/mod.ts";

const app = new App();

app.use(logger);
app.use(security());

app.use((req, res) => {
  console.log("first start");
});

app.get("/hello", async (req, res) => {
  await res.status(200).send("hello");
});

app.use("/socket", async (req, res) => {
  console.log(req.method);
  const { conn, r: bufReader, w: bufWriter, headers } = req.serverRequest;

  try {
    const sock = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });

    console.log("socket connected!");

    try {
      for await (const ev of sock) {
        if (typeof ev === "string") {
          // text message
          console.log("ws:Text", ev);
          await sock.send(ev);
        } else if (ev instanceof Uint8Array) {
          // binary message
          console.log("ws:Binary", ev);
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping
          console.log("ws:Ping", body);
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          console.log("ws:Close", code, reason);
        }
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);

      if (!sock.isClosed) {
        await sock.close(1000).catch(console.error);
      }
    }

    console.log("socket connection end");
    res.end();
  } catch (err) {
    console.error(`failed to accept websocket: ${err}`);
    await res.status(400).send("error");
  }
});

console.log("Server at http://localhost:8080");
await app.listen(8080);
