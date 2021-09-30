import { Router, Request, Response } from "https://deno.land/x/attain/mod.ts";
import second from "./api.ts";
const api = new Router();

api.use("/", second);

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

// this will block the current request
api.get("/hello", async (req: Request, res: Response) => {
  console.log("here '/hello'");
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

// this will not work
api.get("/hello", async (req: Request, res: Response) => {
  console.log("here '/second hello'");
  res.status(200).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>Second hello</h1>
    </body>
  </html>
  `);
});

api.use("/post", second);

export default api;
