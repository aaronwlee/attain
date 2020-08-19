import { Request, Response } from "../mod.ts";

export const hidePoweredBy = () => {
  return (req: Request, res: Response) => {
    res.removeHeader("X-Powered-By");
  };
};
