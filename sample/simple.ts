import { App, logger } from "../mod.ts";
const app = new App();

app.use(logger);

app.use("/", (req, res) => {
  res.status(200).send("asd");
});

await app.listen(8000, { debug: true });

