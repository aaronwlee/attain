import { App, Router, Request, Response } from "../mod.ts";
import api from "./router.ts";
import parser from "../plugins/json-parser.ts";
import logger from "../plugins/logger.ts";

const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send")
}

app.use(logger);
app.use(parser);

app.use("/api", api);

app.use(sampleMiddleware, (req, res) => {
  res.status(404).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>Page not found</h1>
    </body>
  </html>
  `);
});

app.listen({ port: 3500, debug: true });

console.log("http://localhost:3500");
