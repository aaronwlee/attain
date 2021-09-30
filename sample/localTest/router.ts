import { Router } from "../../mod.ts";
import secondRouter from "./secondRouter.ts";
const api = new Router();

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(null), time));

// this will block the current request
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

// this will not work
api.get("/second", async (req, res) => {
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

api.get("/test(.*)", async (req, res) => {
  console.log(req.query, "here test");
  res.status(200).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>test done</h1>
    </body>
  </html>
  `);
});

api.use("/second", secondRouter);

export default api;
