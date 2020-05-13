import { App } from "../mod.ts";

const second = new App();
second.get("/", async (req, res) => {
  res.status(200).send({ status: "/api" });
});

second.post("/ok", (req, res) => {
  console.log("params", req.params);
  console.log("here im ok");
  res.status(200).send({ status: "/api/ok" });
});

export default second;
