import { Request, Response } from "../mod.ts";

export interface DnsPrefetchControlOptions {
  allow?: boolean;
}

function getHeaderValueFromOptions(
  options?: DnsPrefetchControlOptions,
): "on" | "off" {
  if (options && options.allow) {
    return "on";
  } else {
    return "off";
  }
}

export const dnsPrefetchControl = (options?: DnsPrefetchControlOptions) => {
  const headerValue = getHeaderValueFromOptions(options);

  return (req: Request, res: Response) => {
    res.setHeader("X-DNS-Prefetch-Control", headerValue);
  };
};
