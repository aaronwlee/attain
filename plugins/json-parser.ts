import Router from "../router.ts";

const parser = new Router();

parser.post(async (req, res) => {
  const params = await req.body();
  req.params = params.value;
}, true);

export default parser;