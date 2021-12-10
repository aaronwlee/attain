<p align="center">
  <img width="380" height="200" src="https://github.com/aaronwlee/attain/blob/master/Attain.png?raw=true" alt="attain" />
</p>

# Attain - v1.1.2 - [Website](https://aaronwlee.github.io/attain/)

![attain ci](https://github.com/aaronwlee/attain/workflows/attain%20ci/badge.svg)
![license](https://img.shields.io/github/license/aaronwlee/attain)

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/attain)

A middleware web framework for Deno which is using [http](https://github.com/denoland/deno_std/tree/master/http#http) standard library inspired by [express](https://github.com/expressjs/express) and [Oak](https://github.com/oakserver/oak). 

Attain is blazingly fast due to handled the multi-structured middleware and routes effectively. It also strictly manage memory consumption.

Only for [Deno](https://deno.land/) - __Require Deno version up to: v1.16.4__

Any contributions to the code would be appreciated. :)


<br />

### Download and use

```js
import { App, Router } from "https://deno.land/x/attain/mod.ts";
// or
import { App, Router } from "https://deno.land/x/attain@1.1.2/mod.ts";
// or
import { App, Router, Request, Response } from "https://raw.githubusercontent.com/aaronwlee/attain/1.1.2/mod.ts";
```


```
# deno run --allow-net --unstable main.ts
```

## Contents

- [Getting Start](#getting-start)
  - [Procedure explain](#procedure-explain)
- [How To](#how-to)
- [Boilerplate](#boilerplate)
- [Methods and Properies](#methods-and-properies)
  - [Response](#response)
  - [Request](#request)
  - [Router](#router)
  - [App](#app)
- [Nested Routing](#nested-routing)
- [Extra plugins](#extra-plugins)
- [More Features](#more-features)
- [Performance](https://github.com/aaronwlee/attain/blob/master/performance/performance.md)

## Getting Start

```ts
import { App } from "https://deno.land/x/attain/mod.ts";
import type { Request, Response } from "https://deno.land/x/attain/mod.ts";

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
<br /> Note: to access Oak's `Context.params` use `Request.params`. but require to use a `app.use(parser)` plugin.

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

- `database(dbCls)` **NEW FEATURE!**
  <br /> Register a database to use in all of your middleware functions.
  <br /> Example:

```ts 
/* ExampleDatabase.ts */
class ExampleDatabase extends AttainDatabase {
    async connect() {
        console.log('database connected');
    }
    async getAllUsers() {
        return [{ name: 'Shaun' }, { name: 'Mike' }];
    }
}

/* router.ts */
const router = new Router();

router.get('/', async (req: Request, res: Response, db: ExampleDatabase) => {
  const users = await db.getAllUsers();
  res.status(200).send(users);
})

/* index.ts */
const app = new App();

await app.database(ExampleDatabase);

app.use('/api/users', router);

```

**NOTE:** for this feature to work as expected, you must:
- provide a `connect()` method to your database class
- extend the `AttainDatabase` class

<br /> 
<span style="color: #555;">This feature is brand new and any contributins and ideas will be welcomed</span>

- `static startWith(connectFunc)`
Automatically initialize the app and connect to the database with a connect function.

- `static startWith(dbClass)`
Automatically initialize the app create a database instance.

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

## More Features

### Switch your database with just one line of code
Using the `app.database()` option, you can switch your database with just one line of code! To use this feature, create a database class that extends the `AttainDatabase` class:

```ts
class PostgresDatabase extends AttainDatabase {
  #client: Client
  async connect() {
    const client = new Client({
      user: Deno.env.get('USER'),
      database: Deno.env.get('DB'),
      hostname: Deno.env.get('HOST'),
      password: Deno.env.get('PASSWORD')!,
      port: parseInt(Deno.env.get('PORT')),
    });
    await client.connect();
    this.#client = client;
  }
  async getAllProducts() {
    const data = await this.#client.query('SELECT * FROM products');
    /* map data */
    return products;
  }
}

/* OR */
class MongoDatabase extends AttainDatabase {
  #Product: Collection<Product>
  async connect() {
     const client = new MongoClient();
     await client.connectWithUri(Deno.env.get('DB_URL'));
     const database = client.database(Deno.env.get('DB_NAME'));
     this.#Product = database.collection('Product');
  }
  async getAllProducts() {
    return await this.#Product.findAll()
  }
}
```

Then pick one of the databases to use in your app:
```ts
await app.database(MongoDatabase);
/* OR */
await app.database(PostgresDatabase);
/* OR */
const app = App.startWith(MongoDatabase);

app.get('/products', (req, res, db) => {
  const products = await db.getAllProducts();
  res.status(200).send(products); /* will work the same! */
})

```

You can also provide a function that returns a database connection
```ts
import { App, Router, Request, Response, AttainDatabase } from "./mod.ts";
import { MongoClient, Database } from "https://deno.land/x/mongo@v0.9.2/mod.ts";

async function DB() {
  const client = new MongoClient()
  await client.connectWithUri("mongodb://localhost:27017")
  const database = client.database("test")
  return database;
}

// allow auto inherit mode (auto inherit the types to the middleware)

const app = App.startWith(DB);
// or
const app = new App<Database>()
app.database(DB)

// this db params will have automatically inherited types from the app<> or startWith method.
app.use((req, res, db) => {

})
```

---

There are several modules that are directly adapted from other modules.
They have preserved their individual licenses and copyrights. All of the modules,
including those directly adapted are licensed under the MIT License.

All additional work is copyright 2021 the Attain authors. All rights reserved.
