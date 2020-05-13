import { Router } from "../mod.ts";

const parser = new Router();

parser.post(async (req, res) => {
  const params = await req.body();
  req.params = params.value;
});

export default parser;
