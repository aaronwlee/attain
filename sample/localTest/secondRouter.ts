import { Router } from "../../mod.ts";
const api = new Router();

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

// this will block the current request
api.get("/test1", async (req, res) => {
  console.log("here '/test1'");
  await sleep(1000);
  res.status(200).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>test1</h1>
    </body>
  </html>
  `);
});

// this will not work
api.get("/error", async (req, res) => {
  console.log("here '/error'");
  throw new Error("Here i made a error")
});

api.get("/test3*", async (req, res) => {
  console.log(req.query, "here test3")
  res.status(200).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>test3 done</h1>
    </body>
  </html>
  `);
})

export default api;
