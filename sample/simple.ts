import {
  App,
} from "../mod.ts";
const app = new App();

app.use("/", (req, res) => {
  res.status(200).send({ text: "hello" });
});

await app.listen({ port: 3500, debug: true });
