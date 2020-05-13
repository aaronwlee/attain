import { Router } from "../mod.ts";
import second from "./api.ts";
const api = new Router();

api.use("/", second);

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

api.get("/hello", async (req, res) => {
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

api.use("/post", second);

export default api;
