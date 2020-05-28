import {
  App,
  Request,
  Response,
  logger,
  parser,
  staticServe,
} from "../../mod.ts";
import router from "./router.ts";

const app = new App();


app.use(logger);
app.use(parser);

app.use(staticServe("./sample/localTest"));

app.use((req, res) => {
  console.log("first");
})

app.use("/say", router);

app.use((req, res) => {
  console.log("second")
})

app.get("/", (req, res) => {
  res.send("hello")
})


app.error((err, req, res) => {
  console.log("in error handler", err);
})

app.listen({ port: 3500, debug: true });

console.log("http://localhost:3500");
