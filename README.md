

<p align="center">
  <img width="380" height="200" src="https://github.com/aaronwlee/Attain/blob/master/Attain.png" alt="Attain" />
</p>

-> # Attain - v0.7 <-
<p align="center"> 
  A middleware web framework for Deno which is using <a href="https://github.com/denoland/deno_std/tree/master/http#http">http</a> standard library inspired by <a href="https://github.com/expressjs/express">express</a> and <a href="https://github.com/oakserver/oak">Oak</a>
</p>
<p align="center"> Only for <a href="https://deno.land/">Deno</a> </p>
<br />

Download and use
```js
import { App, Router, Request, Response } from "https://deno.land/x/attain/mod.ts";
import { App, Router, Request, Response } from "https://deno.land/x/attain@0.7/mod.ts";
// or
import { App, Router, Request, Response } from "https://raw.githubusercontent.com/aaronwlee/Attain/master/mod.ts";

```
```
# deno run --allow-net main.ts
```

## Contents
- [Getting Start](#getting-start)
  - [Procedure explain](#procedure-explain)
- [Methods and Properies](#methods-and-properies)
  - [Response](#response)
  - [Request](#request)
  - [Router](#router)
  - [App](#app)
- [Nested Routing](#nested-routing)
- [Extra plugins](#extra-plugins)
- [How To](#how-to)

## Getting Start

```ts
import { App, Request, Response } from "https://deno.land/x/attain/mod.ts";

const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send")
};

app.get("/:id", (req, res) => {
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
})

app.use(sampleMiddleware, (req, res) => {
  res.status(200).send({status: "Good"});
});

app.listen({ port: 3500 });

console.log("http://localhost:3500");
```
### Procedure explain
The middleware process the function step by step based on registered order.  

<img src="https://github.com/aaronwlee/Attain/blob/master/procedure.png" alt="procedure" />


```ts
import { App } from "https://deno.land/x/attain/mod.ts";

const app = new App();

const sleep = (time: number) => {
  return new Promise(resolve => setTimeout(() => resolve(), time)
};

app.use((req, res) => {
  console.log("First step");
}, async (req, res) => {
  await sleep(2000); // the current request procedure will stop here for two seconds.
  console.log("Second step");
});

app.use((req, res) => {
  // pend a job
  res.pend((afterReq, afterRes) => {
    console.log("Fourth step");
    console.log("Fifth step with error");
    console.log("You can finalize your procedure right before respond.")
    console.log("For instance, add a header or caching.")
  })
})

// last step
app.use("/", (req, res) => {
  console.log("Third step with GET '/'");
  // this is the end point
  res.status(200).send({status: "Good"});
});

app.use("/", (req, res) => {
  console.log("Will not executed");
});

app.get("/error", (req, res) => {
  console.log("Third step with GET '/error'");
  throw new Error("I have error!")
})

app.error((err, req, res) => {
  console.log("Fourth step with error");
  console.log("A sequence of error handling.", err)
  res.status(500).send("Critical error.");
})

app.listen({ port: 3500 });

console.log("http://localhost:3500");
```

## Methods and Properies
### Response
 #### Properties
- `executePending: Deferred<Error | undefined>`
 <br /> An event trigger the pended jobs. Automatically triggered by the end()
 <br /> EX) `response.executePending.resolve();`

- `pending: Function[]`
 <br /> List of pended jobs. To push the job, use the pend() method.

 #### Methods
 Getter
- `getResponse(): AttainResponse`
 <br /> Get current response object, It will contain the body, status and headers.

- `headers(): Headers`
 <br /> Get current header map

- `getStatus(): number | undefined`
 <br /> Get current status

- `getBody(): Uint8Array`
 <br /> Get current body contents

- `readyToSend(): Deferred<Error | undefined>`
 <br /> An event right before responding. Automatically triggered by the end()
 <br /> EX) `response.readyToSend.then(() => console.log("pended job executed"));`

 Functions
- `pend(...fn: CallBackType[]): void`
 <br /> Pend the jobs. It'll start right before responding.

- `status(status: number)`
 <br /> Set status number

- `body(body: ContentsType)`
 <br /> Set body. Allows setting `Uint8Array, Deno.Reader, string, object, boolean`. This will not respond.

- `setHeaders(headers: Headers)`
 <br /> You can overwrite the response header.

- `getHeader(name: string)`
 <br /> Get a header from the response by key name.

- `setHeader(name: string, value: string)`
 <br /> Set a header.

- `setContentType(type: string)`
 <br /> This is a shortcut for the "Content-Type" in the header. It will try to find "Content-Type" from the header then set or append the values.

- `send(contents: ContentsType): Promise<void | this>`
 <br /> Setting the body then executing the end() method.

- `sendFile(filePath: string): Promise<void>`
 <br /> Transfers the file at the given path. Sets the Content-Type response HTTP header field based on the filename's extension.
 <br /> <span style="color: red;"> *Required to be await* </span>
 <br /> These response headers might be needed to set for fully functioning

| Property        | Description                |
|-----------------|---------------------------------|
| maxAge           | Sets the max-age property of the Cache-Control header in milliseconds or a string in ms format|
| root             | Root directory for relative filenames. |
| cacheControl     | Enable or disable setting Cache-Control response header. |


- `download(filePath: string, name?: string): Promise<void>`
 <br /> Transfers the file at the path as an "attachment". Typically, browsers will prompt the user to download and save it as a name if provided.
 <br /> <span style="color: red;"> *Required to be await* </span>

- `redirect(url: string | "back")`
 <br /> Redirecting the current response.

- `end(): Promise<void>`
 <br /> Executing the pended job then respond back to the current request. It'll end the current procedure.

### Request 
> [Oak](https://github.com/oakserver/oak/tree/master#request) for deno

This method use the Oak request, check this out.

### Router
 #### Methods

- `use(app: App | Router): void`
- `use(callBack: CallBackType): void`
- `use(...callBack: CallBackType[]): void`
- `use(url: string, callBack: CallBackType): void`
- `use(url: string, ...callBack: CallBackType[]): void`
- `use(url: string, app: App | Router): void`
- `get...`
- `post...`
- `put...`
- `patch...`
- `delete...`
- `error(app: App | Router): void;`
- `error(callBack: ErrorCallBackType): void;`
- `error(...callBack: ErrorCallBackType[]): void;`
- `error(url: string, callBack: ErrorCallBackType): void;`
- `error(url: string, ...callBack: ErrorCallBackType[]): void;`
- `error(url: string, app: App | Router): void;`
  <br /> It'll handle the error If thrown from one of the above procedures.

Example
```ts
app.use((req, res) => {
  throw new Error("Something wrong!")
})

app.error((error, req, res) => {
  console.error("I handle the Error!" , error);
  res.status(500).send("It's critical!");
})

```

These are middleware methods and it's like express.js.

### App
 #### Properties
- `listen(options)`

 ```ts
  options: {
    port: number;             // required
    debug?: boolean;          // debug mode
    hostname?: string;        // hostname default as 0.0.0.0
    secure?: boolean;         // https use
    certFile?: string;        // if secure is true, it's required
    keyFile?: string;         // if secure is true, it's required
  }
```
 <br/> Start the Attain server.

 #### *App extends Router*
 #### Methods
- `This has all router's methods`



## Nested Routing

> **Path** - router.ts

 __warn__: <span style="color: red;">async await</span> will block your procedures.

```ts
import { Router } from "https://deno.land/x/attain/mod.ts";

const api = new Router();
// or
// const api = new App();

const sleep = (time: number) => {
  new Promise((resolve) => setTimeout(() => resolve(), time));
};

// It will stop here for 1 second.
api.get("/block", async (req, res) => {
  console.log("here '/block'");
  await sleep(1000);
  res.status(200).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>Hello</h1>
    </body>
  </html>
  `);
});

// It will not stop here
api.get("/nonblock", (req, res) => {
  console.log("here '/nonblock'");
  sleep(1000).then(_ => {
      res.status(200).send(`
      <!doctype html>
      <html lang="en">
        <body>
          <h1>Hello</h1>
        </body>
      </html>
      `);
  });
})

export default api;

```

> **Path** - main.ts

```ts
import { App } from "https://deno.land/x/attain/mod.ts";
import api from "./router.ts";

const app = new App();

// nested router applied
app.use("/api", api)

app.use((req, res) => {
  res.status(404).send("page not found");
});

app.listen({ port: 3500 });

console.log("http://localhost:3500");
```

```
# start with: deno run -A ./main.ts
```

## Extra plugins
 - __logger__ : `Logging response "response - method - status - path - time"`
 - __parser__ : `Parsing the request body and save it to request.params`
 - __security__: `Helping you make secure application by setting various HTTP headers` [Helmet](https://helmetjs.github.io/)

### Security options
| Options                                               | Default? |
|-------------------------------------------------------|----------|
| `xss` (adds some small XSS protections)                 | yes      |
| `removePoweredBy` (remove the X-Powered-By header)      | yes      |
| `DNSPrefetchControl` (controls browser DNS prefetching) | yes      |
| `noSniff` (to keep clients from sniffing the MIME type) | yes      |
| `frameguard` (prevent clickjacking)                     | yes      |

 - __staticServe__ : `It'll serve the static files from a provided path by joining the request path.`

 > Out of box
 - [__Attain-GraphQL__](https://deno.land/x/attain_graphql#attain-graphql) : `GraphQL middleware`
 - [__deno_graphql__](https://deno.land/x/deno_graphql#setup-with-attain): `GraphQL middleware`
 - [__session__](https://deno.land/x/session): `cookie session`

```ts
import { App, logger, parser, security, staticServe } from "https://deno.land/x/attain/mod.ts";

const app = new App();

// Set Extra Security setting
app.use(security());

// Logging response method status path time
app.use(logger);

// Parsing the request body and save it to request.params
// Also, updated to parse the queries from search params
app.use(parser);

// Serve static files
// This path must be started from your command line path.
app.use(staticServe("./public", {maxAge: 1000}));

app.use("/", (req, res) => {
  res.status(200).send("hello");
});

app.use("/google", (req, res) => {
  res.redirect("https://www.google.ca");
})

app.use("/:id", (req, res) => {
  // This data has parsed by the embedded URL parser.
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
})

app.post("/submit", (req, res) => {
  // By the parser middleware, the body and search query get parsed and saved.
  console.log(req.params);
  console.log(req.query);
  res.status(200).send({ data: "has received" });
});

app.listen({ port: 4000 });
console.log("Start listening on http://localhost:4000");

```

## How To
[Web Socket Example](https://github.com/aaronwlee/Attain/tree/master/howto/websocket.md)

---

There are several modules that are directly adapted from other modules. 
They have preserved their individual licenses and copyrights. All of the modules,
including those directly adapted are licensed under the MIT License.

All additional work is copyright 2020 the Attain authors. All rights reserved.
