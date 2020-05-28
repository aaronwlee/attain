# WEB Socket
This example is combined the WebSocket with Attain

## Attain Server

```ts
import {
  App,
  logger,
  security
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
})

app.get("/hello", async (req, res) => {
  await res.status(200).send("hello");
});

app.use("/socket", async (req, res) => {
  console.log(req.method)
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
})


console.log("Server at http://localhost:8080");
await app.listen({ port: 8080 });import {
  App,
  logger,
  security
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
})

app.get("/hello", async (req, res) => {
  await res.status(200).send("hello");
});

app.use("/socket", async (req, res) => {
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

    res.end();
  } catch (err) {
    console.error(`failed to accept websocket: ${err}`);
    await res.status(400).send("error");
  }
})


console.log("Server at http://localhost:8080");
await app.listen({ port: 8080 });
```

## Simple Client

```ts
import {
  connectWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
} from "https://deno.land/std/ws/mod.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { blue, green, red, yellow } from "https://deno.land/std/fmt/colors.ts";

const endpoint = Deno.args[0] || "ws://127.0.0.1:8080/socket";
/** simple websocket cli */
try {
  const sock = await connectWebSocket(endpoint);
  console.log(green("ws connected! (type 'close' to quit)"));

  const messages = async (): Promise<void> => {
    for await (const msg of sock) {
      if (typeof msg === "string") {
        console.log(yellow(`< ${msg}`));
      } else if (isWebSocketPingEvent(msg)) {
        console.log(blue("< ping"));
      } else if (isWebSocketPongEvent(msg)) {
        console.log(blue("< pong"));
      } else if (isWebSocketCloseEvent(msg)) {
        console.log(red(`closed: code=${msg.code}, reason=${msg.reason}`));
      }
    }
  };

  const cli = async (): Promise<void> => {
    const tpr = new TextProtoReader(new BufReader(Deno.stdin));
    while (true) {
      await Deno.stdout.write(encode("> "));
      const line = await tpr.readLine();
      if (line === null || line === "close") {
        break;
      } else if (line === "ping") {
        await sock.ping();
      } else {
        await sock.send(line);
      }
    }
  };

  await Promise.race([messages(), cli()]).catch(console.error);

  if (!sock.isClosed) {
    await sock.close(1000).catch(console.error);
  }
} catch (err) {
  console.error(red(`Could not connect to WebSocket: '${err}'`));
}

Deno.exit(0);
```

For more information [WS](https://deno.land/std/ws)
