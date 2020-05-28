import {
  App,
  Request,
  Response,
  logger,
  parser,
  staticServe,
} from "../../mod.ts";

const app = new App();


app.use(logger);
app.use(parser);

app.use(staticServe("./sample/localTest"));

app.use((req, res) => {
  console.log("first");
})

app.use((req, res) => {
  console.log("second")
})

app.get("/", (req, res) => {
  res.send("hello")
})

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

app.listen({ port: 3500, debug: true });

console.log("http://localhost:3500");
