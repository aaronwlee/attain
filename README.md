<p align="center">
  <img width="380" height="200" src="https://github.com/aaronwlee/attain/blob/master/attain.png?raw=true" alt="attain" />
</p>

# Attain - v1.0.8 - [Website](https://aaronwlee.github.io/Attain/)

![attain ci](https://github.com/aaronwlee/attain/workflows/attain%20ci/badge.svg)
![license](https://img.shields.io/github/license/aaronwlee/attain)

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/attain)

A middleware web framework for Deno which is using [http](https://github.com/denoland/deno_std/tree/master/http#http) standard library inspired by [express](https://github.com/expressjs/express) and [Oak](https://github.com/oakserver/oak). Fast and stable with proper memory usage.

Only for [Deno](https://deno.land/) - __Require Deno version: 1.2.x__

Any contributions to the code would be appreciated. :)

<br />

### Download and use

**Important**: If you're using React Framework, highly recommend including with a version tag.

```js
import { App, Router, Request, Response } from "https://deno.land/x/attain/mod.ts";
// or
import { App, Router, Request, Response } from "https://deno.land/x/attain@1.0.8/mod.ts";
// or
import { App, Router, Request, Response } from "https://x.nest.land/attain@1.0.8/mod.ts";
// or
import { App, Router, Request, Response } from "https://raw.githubusercontent.com/aaronwlee/attain/1.0.8/mod.ts";
```

### This CLI is beta version!

```
// download cli
deno install -A -f --unstable -n attain https://deno.land/x/Attain/attain-cli.ts
// or
deno install -A -f --unstable -n attain https://deno.land/x/attain@1.0.8/attain-cli.ts
```

```
# deno run --allow-net --unstable main.ts
```

## Contents

- [Getting Start](#getting-start)
  - [Procedure explain](#procedure-explain)
- [CLI](#cli)
- [React](#react)
- [How To](#how-to)
- [Boilerplate](#boilerplate)
- [Methods and Properies](#methods-and-properies)
  - [Response](#response)
  - [Request](#request)
  - [Router](#router)
  - [App](#app)
- [Nested Routing](#nested-routing)
- [Extra plugins](#extra-plugins)
- [Performance](https://github.com/aaronwlee/attain/blob/master/performance/performance.md)

## Getting Start

```ts
import { App, Request, Response } from "https://deno.land/x/attain/mod.ts";

const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send");
};

app.get("/:id", (req, res) => {
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
});

app.use(sampleMiddleware, (req, res) => {
  res.status(200).send({ status: "Good" });
});

app.listen({ port: 3500 });
```

### Procedure explain

The middleware process the function step by step based on registered order.

![alt text](https://github.com/aaronwlee/attain/blob/master/procedure.png?raw=true "procedure")

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
```

## CLI

### This is beta version!

**Important**: If you're using React Framework, highly recommend including with a version tag.

```
deno install -A -f --unstable -n attain https://deno.land/x/attain@1.0.8/attain-cli.ts
```

It's providing a full-stack server-side rendering development environment combine with React and Attain.

It's a beta version and there are possibly exist some bugs.

__note__: This beta project yet to supporting any type of CSS modules.

### TODO

- [x] - Dynamic routing supporting
- [ ] - CSS supporting
- [ ] - Implement self request method for SSR
- [ ] - Improve hot reload

All commands are must be executed in the project directory

- `-h`
  <br /> Get Help.

- `init [path]`
  <br /> Initialize the project to the path.
  <br /> ex) attain init react-attain

- `dev | development`
  <br /> Starts the dev server and watch the front-end file changes.
  <br /> ex) attain dev

- `build`
  <br /> Build the bundles to the dist folder with "PRODUCTION" scripts
  <br /> ex) attain build

- `start`
  <br /> Starts the production server
  <br /> ex) attain start

## React

**This react framework is only provided through the CLI.
Please initialize and start with the `init` command line.**

### Routing and Page Guidline

Attain framework's used the high order component to serving routing and other contexts. At the compiler level, moreover, all the pages automatically imported into it. Thus, you don't need to worry about creating a route index.

You just need to create a page component into the following path to create a new page. `/view/pages/<pathname>.tsx`

__Important__: Page component's name must be unique.

Now, if the browser requests to `<pathname>` like "http://localhost:3000/<pathname>", Attain server automatically serves a rendered page.

### Dynamic Routing

Any browser request route like /user/1, /user/abc, will be matched by pages/user/[id].tsx in the server. The matched path parameter will be sent as a parameter to the page, and search parameters will be merged with query parameter.

ex) `/view/pages/user/[id].tsx` equals `/user/1`

### Linking between pages

To client-side routing, the Attain framework provides you convince hook method which called `useRouter()`. This allows you to do client-side route transitions between pages, similarly to a single-page application.

- `const router = useRouter()` import path `deps.tsx`
  <br /> useRouter returns you pathname, push, query, params.
  <br /> `pathname` is current pathname
  <br /> `push("/")` is for client-side route transition
  <br /> `query` is current search params
  <br /> `params` is current matched params like [id]

```jsx
function Component() {
  const router = useRouter()

  return (
    <a onClick={() => router.push("/user")}>
      view user
    </a>
  )
}
```

### Server Side Rendering
- `Component.ServerSideAttain`
  <br /> `ServerSideAttain` enabled server-side rendering in a page and allows you to do the initial data population, it means sending the page with the data already populated from the server.

  <br /> This static function will be executed only one time when the browser requests the page. which means client-side rendering will not execute it.
  
  <br /> In the server-side execution, you can get `req, res, Component, query, isServer` as parameters.
  <br /> However, if it's been executed in the client, you only can get `req, Component, query, isServer`

  <br /> **You can only define it in the page component.

- `req`
  <br /> In the server, you can get the entire request object from the Attain middleware.
  <br /> In the client, you only can get `url` object.

- `res`
  <br /> Entire Attain response object, only available on the server.

- `Component`
  <br /> This is current Component

- `isServer`
  <br /> Determinator you're on the client or server. `true` or `false`

- `return`
  <br /> You must return the object and it can be any.

```ts
UserComponent.ServerSideAttain = async () => {
  // due to windows can't get proxy, must have prefix with http://localhost:
  const response: any = await fetch("http://localhost:3000/api/user");
  const data = await response.json();

  return {
    data,
  };
};
```

### SEO tools
The Attain framework also provides you with elegant SEO tools.

__Import path__: `deps.tsx`

- `useDocument`
  <br /> Due to Deno does not provide document API, it's useful for avoiding errors when you use the document in the client-side. Which means the server can't handle the document code.

```ts
const dom = useDocument()
if(dom) {
  // use document
}
```

- `addMeta`

```ts
addMeta("description", {
  content: "This is an example of a description"
})
```

- `addScript`

```ts
addScript({
  id: "google-recaptcha-v3",
  src: "https://google...."
})
```

- `setTitle`

```ts
setTitle("Welcome to my home page :)");
```

## How To

[Web Socket Example](https://github.com/aaronwlee/Attain/tree/master/howto/websocket.md)

[Auto Recovery](https://github.com/aaronwlee/Attain/tree/master/howto/autorecovery.md)

## Boilerplate

[A Deno web boilerplate](https://github.com/burhanahmeed/Denamo) by [burhanahmeed](https://github.com/burhanahmeed)

## Methods and Properies

### Response

Methods
Getter

- `getResponse(): AttainResponse`
  <br /> Get current response object, It will contain the body, status and headers.

- `headers(): Headers`
  <br /> Get current header map

- `getStatus(): number | undefined`
  <br /> Get current status

- `getBody(): Uint8Array`
  <br /> Get current body contents

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

- `await sendFile(filePath: string): Promise<void>`
  <br /> Transfers the file at the given path. Sets the Content-Type response HTTP header field based on the filename's extension.
  <br /> <span style="color: red;"> _Required to be await_ </span>
  <br /> These response headers might be needed to set for fully functioning

| Property     | Description                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| maxAge       | Sets the max-age property of the Cache-Control header in milliseconds or a string in ms format |
| root         | Root directory for relative filenames.                                                         |
| cacheControl | Enable or disable setting Cache-Control response header.                                       |

- `await download(filePath: string, name?: string): Promise<void>`
  <br /> Transfers the file at the path as an "attachment". Typically, browsers will prompt the user to download and save it as a name if provided.
  <br /> <span style="color: red;"> _Required to be await_ </span>

- `redirect(url: string | "back")`
  <br /> Redirecting the current response.

- `end(): Promise<void>`
  <br /> Executing the pended job then respond back to the current request. It'll end the current procedure.

### Request

> [Oak](https://github.com/oakserver/oak/tree/master#request) for deno

This class used Oak's request library. Check this.

### Router

Methods

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
  throw new Error("Something wrong!");
});

app.error((error, req, res) => {
  console.error("I handle the Error!", error);
  res.status(500).send("It's critical!");
});
```

- `param(paramName: string, ...callback: ParamCallBackType[]): void;`
  <br> Parameter handler [router.param](https://expressjs.com/en/api.html#router.param)

Example

```ts
const userController = new Router();

userController.param("username", (req, res, username) => {
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new Error("user not found");
  }
  req.profile = user;
});

userController.get("/:username", (req, res) => {
  res.status(200).send({ profile: req.profile });
});

userController.post("/:username/follow", (req, res) => {
  const user = await User.findById(req.payload.id);
  if (user.following.indexOf(req.profile._id) === -1) {
    user.following.push(req.profile._id);
  }
  const profile = await user.save();
  return res.status(200).send({ profile: profile });
});

export default userController;
```

These are middleware methods and it's like express.js.

### App

_App extends Router_
Methods

- `This has all router's methods`

Properties

- `listen(options)`
  <br/> Start the Attain server.

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

## Nested Routing

> **Path** - router.ts

**warn**: <span style="color: red;">async await</span> will block your procedures.

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
  sleep(1000).then((_) => {
    res.status(200).send(`
      <!doctype html>
      <html lang="en">
        <body>
          <h1>Hello</h1>
        </body>
      </html>
      `);
  });
});

export default api;
```

> **Path** - main.ts

```ts
import { App } from "https://deno.land/x/attain/mod.ts";
import api from "./router.ts";

const app = new App();

// nested router applied
app.use("/api", api);

app.use((req, res) => {
  res.status(404).send("page not found");
});

app.listen({ port: 3500 });
```

```
# start with: deno run -A ./main.ts
```

## Extra plugins

- **logger** : `Logging response "response - method - status - path - time"`
- **parser** : `Parsing the request body and save it to request.params`
- **security**: `Helping you make secure application by setting various HTTP headers` [Helmet](https://helmetjs.github.io/)

### Security options

| Options                                                 | Default? |
| ------------------------------------------------------- | -------- |
| `xss` (adds some small XSS protections)                 | yes      |
| `removePoweredBy` (remove the X-Powered-By header)      | yes      |
| `DNSPrefetchControl` (controls browser DNS prefetching) | yes      |
| `noSniff` (to keep clients from sniffing the MIME type) | yes      |
| `frameguard` (prevent clickjacking)                     | yes      |

- **staticServe** : `It'll serve the static files from a provided path by joining the request path.`

> Out of box

- [**Attain-GraphQL**](https://deno.land/x/attain_graphql#attain-graphql) : `GraphQL middleware`
- [**deno_graphql**](https://deno.land/x/deno_graphql#setup-with-attain): `GraphQL middleware`
- [**session**](https://deno.land/x/session): `cookie session`
- [**cors**](https://deno.land/x/cors/#examples): `CORS`

```ts
import {
  App,
  logger,
  parser,
  security,
  staticServe,
} from "https://deno.land/x/Attain/mod.ts";

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
app.use(staticServe("./public", { maxAge: 1000 }));

app.use("/", (req, res) => {
  res.status(200).send("hello");
});

app.use("/google", (req, res) => {
  res.redirect("https://www.google.ca");
});

app.use("/:id", (req, res) => {
  // This data has parsed by the embedded URL parser.
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
});

app.post("/submit", (req, res) => {
  // By the parser middleware, the body and search query get parsed and saved.
  console.log(req.params);
  console.log(req.query);
  res.status(200).send({ data: "has received" });
});

app.listen({ port: 4000 });
```

---

There are several modules that are directly adapted from other modules.
They have preserved their individual licenses and copyrights. All of the modules,
including those directly adapted are licensed under the MIT License.

All additional work is copyright 2020 the Attain authors. All rights reserved.
