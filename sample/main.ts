import { App, Router } from "https://raw.githubusercontent.com/aaronwlee/Attain/master/mod.ts";
import api from "./router.ts";
import logger from "https://raw.githubusercontent.com/aaronwlee/Attain/master/plugins/logger.ts";
import parser from "https://raw.githubusercontent.com/aaronwlee/Attain/master/plugins/json-parser.ts";

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
