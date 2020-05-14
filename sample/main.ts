import { App, Router } from "../mod.ts";
import api from "./router.ts";
import parser from "../plugins/json-parser.ts";
import logger from "../plugins/logger.ts";

const app = new App();

app.use(logger);
app.use(parser);

app.use("/api", api);

app.use((req, res) => {
  res.status(404).send(`
  <!doctype html>
  <html lang="en">
    <body>
      <h1>Page not found</h1>
    </body>
  </html>
  `);
});

app.listen({ port: 3500 });

console.log("http://localhost:3500");
