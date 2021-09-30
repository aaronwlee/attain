import { App, Request, Response } from "https://deno.land/x/attain/mod.ts";

const second = new App();
second.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ status: "/api" });
});

second.post("/ok", (req: Request, res: Response) => {
  console.log("params", req.params);
  console.log("here im ok");
  res.status(200).send({ status: "/api/ok" });
});

export default second;
