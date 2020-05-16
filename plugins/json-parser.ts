import { Request, Response } from "../mod.ts";

export const parser = async (req: Request, res: Response) => {
  const params = await req.body();
  req.params = params.value;
};