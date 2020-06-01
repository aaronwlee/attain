# Performance

## Attain

### minimal test

```ts
import { App } from "https://deno.land/x/attain/mod.ts";

const app = new App();

app.use((req, res) => {
  res.status(200).send("Hello world!");
});

app.listen({ port: 3500 });
```
![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/attain.png?raw=true "Attain performance")

### with logger and router

```ts
import { App, logger } from "https://deno.land/x/attain/mod.ts";

const app = new App();

app.use(logger);

app.use("/", (req, res) => {
  res.status(200).send("Hello world!");
});

app.listen({ port: 3500 });
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/attain-middle.png?raw=true "Attain performance")

### five simple middlewares with logger and router

```ts
import { App, Request, Response } from "https://deno.land/x/attain/mod.ts";

const app = new App();

const hello = (req: Request, res: Response) => {
  console.log("hello")
};

app.use(logger);
app.use(hello, hello, hello, hello, hello);
app.use("/", (req, res) => {
  res.status(200).send("Hello world!");
});

app.listen({ port: 3500 });
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/attain-middlewithfive.png?raw=true "Attain performance")

### Send file

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/attain-sendfile.png?raw=true "Attain performance")


## Express

### minimal test

```ts
const express = require('express')
const app = express()
const port = 5000

app.get((req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/express.png?raw=true "Express performance")

### with logger and router

```ts
const express = require('express')
const app = express()
const morgan = require('morgan')
const port = 5000

app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/express-middle.png?raw=true "Express performance")


### five simple middlewares with logger and router

```ts
const express = require('express')
const app = express()
const morgan = require('morgan')
const port = 5000

const hello = (req, res, next) => {
  console.log("hello")
  next();
}
app.use(morgan('tiny'));
app.use(hello, hello, hello, hello, hello)
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/express-middlewithfive.png?raw=true "Express performance")

### Send file

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/express-sendfile.png?raw=true "Express performance")


## Oak


### minimal test

```ts
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

await app.listen({ port: 8000 });
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/oak.png?raw=true "Oak performance")

### with logger and router

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});
app.use(router.routes());
app.use(router.allowedMethods());


await app.listen({ port: 8000 });
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/oak-middle.png?raw=true "Oak performance")

### five simple middlewares with logger and router

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

const hello = (ctx: any, next: any) => {
  console.log("hello1");
  next()
}

router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })

app.use(hello, hello, hello, hello, hello)
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});
app.use(router.routes());
app.use(router.allowedMethods());


await app.listen({ port: 8000 });
```

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/oak-middlewithfive.png?raw=true "Oak performance")

### Send file

![alt text](https://github.com/aaronwlee/Attain/blob/master/performance/oak-sendfile.png?raw=true "Oak performance")
