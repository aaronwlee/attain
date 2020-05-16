import { App, Router, Request, Response } from "https://deno.land/x/attain/mod.ts";
import api from "./router.ts";
import logger from "https://deno.land/x/attain/plugins/logger.ts";
import parser from "https://deno.land/x/attain/plugins/json-parser.ts";

const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send")
}

app.use(logger);
app.use(parser);

app.use("/:id", sampleMiddleware, (req, res) => {
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
})

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
