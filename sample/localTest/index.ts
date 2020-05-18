import { App, Request, Response, logger, parser, staticServe } from "../../mod.ts";


const app = new App();

const sampleMiddleware = (req: Request, res: Response) => {
  console.log("before send");
};

app.use(logger);
app.use(parser);

app.use(staticServe("./sample/localTest"));

app.use("/hello", (req, res) => {
  console.log("req.query", JSON.stringify(req.query));
  res.status(200).send("/hello");
});

app.use("/:id", sampleMiddleware, (req, res) => {
  console.log(JSON.stringify(req.params));
  res.status(200).send("asd");
});

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
