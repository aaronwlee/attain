import { Request, Response } from "../mod.ts";

const setQueryVariable = (req: Request) => {
  const queries = req.url.search.substring(1).split("&") || [];
  if (!req.query) {
    req.query = {};
  }
  queries.map((qs) => {
    const pair = qs.split("=");
    req.query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  });
};

export const parser = async (req: Request, res: Response) => {
  const params = await req.body();
  req.params = params.value;
  setQueryVariable(req);
};
