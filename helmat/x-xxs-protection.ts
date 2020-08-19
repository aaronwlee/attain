import { Request, Response } from "../mod.ts";

export interface XXssProtectionOptions {
  mode?: "block" | null;
  reportUri?: string;
}

const doesUserAgentMatchOldInternetExplorer = (
  userAgent: string | null | undefined,
): boolean => {
  if (!userAgent) {
    return false;
  }

  const matches = /msie\s*(\d{1,2})/i.exec(userAgent);
  return matches ? parseFloat(matches[1]) < 9 : false;
};

const getHeaderValueFromOptions = (options: XXssProtectionOptions): string => {
  const directives: string[] = ["1"];

  let isBlockMode: boolean;
  if ("mode" in options) {
    if (options.mode === "block") {
      isBlockMode = true;
    } else if (options.mode === null) {
      isBlockMode = false;
    } else {
      throw new Error('The `mode` option must be set to "block" or null.');
    }
  } else {
    isBlockMode = true;
  }

  if (isBlockMode) {
    directives.push("mode=block");
  }

  if (options.reportUri) {
    directives.push(`report=${options.reportUri}`);
  }

  return directives.join("; ");
};

export const xXssProtection = (options: XXssProtectionOptions = {}) => {
  const headerValue = getHeaderValueFromOptions(options);

  return (req: Request, res: Response) => {
    const value =
      doesUserAgentMatchOldInternetExplorer(req.headers.get("user-agent"))
        ? "0"
        : headerValue;
    res.setHeader("X-XSS-Protection", value);
  };
};
