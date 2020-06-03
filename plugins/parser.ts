import { Request, Response } from "../mod.ts";

const setQueryVariable = (req: Request) => {
  const queries = req.url.search && req.url.search.substring(1).split("&") ||
    [];
  if (queries.length > 0 && queries[0] !== "") {
    if (!req.query) {
      req.query = {};
    }
    queries.map((qs) => {
      const pair = qs.split("=");
      req.query[decodeURIComponent(pair[0])] = decodeURIComponent(
        pair[1] || "",
      );
    });
  }
};

export const parser = async (req: Request, res: Response) => {
  const params = await req.body();
  if (params.type === "json") {
    req.params = params.value;
  } else {
    req.params.value = params.value;
  }
  setQueryVariable(req);
};
