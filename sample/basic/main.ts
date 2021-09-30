import {
  App,
  Router,
  Request,
  Response,
  logger,
  parser,
} from "https://deno.land/x/attain/mod.ts";
import api from "./router.ts";

const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send");
};

app.use(logger);
app.use(parser);

app.use("/:id", sampleMiddleware, (req: Request, res: Response) => {
  console.log(req.params);
  res.status(200).send(`id: ${req.params.id}`);
});

app.use("/api", api);

app.use(sampleMiddleware, (req: Request, res: Response) => {
  res.status(404).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>Page not found</h1>
    </body>
  </html>
  `);
});

app.listen(3500, { debug: true });

console.log("http://localhost:3500");
