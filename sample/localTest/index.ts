import {
  App,
  Request,
  Response,
  logger,
  parser,
  staticServe,
} from "../../mod.ts";
import router from "./router.ts";

try {
  const app = new App();

  app.use(logger);
  app.use(parser);

  app.use("/", (req, res) => {
    res.status(200).send({ text: "hello" });
  });

  app.get("/error", (req, res) => {
    throw new Error("here");
  });

  app.error((err, req, res) => {
    console.log("in error handler", err);
  });
  console.log("http://localhost:3500");

  await app.listen({ port: 3500, debug: true });
} catch (error) {
  console.log("here i error, ", error);
}
