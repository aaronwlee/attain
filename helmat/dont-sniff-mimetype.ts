import type { Request, Response } from "../mod.ts";

export const dontSniffMimetype = () => {
  return (_req: Request, res: Response) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
  };
};
