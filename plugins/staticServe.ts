import { Request, Response } from "../mod.ts";

import {
  posix,
  extname,
  dirname,
  resolve,
} from "https://deno.land/std/path/mod.ts";

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
};
/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

const serveFile = async (
  res: Response,
  filePath: string,
): Promise<void> => {
  const [file, fileInfo] = await Promise.all(
    [Deno.open(filePath), Deno.stat(filePath)],
  );

  res.getHeaders.set("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(filePath);
  if (contentTypeValue) {
    res.getHeaders.set("content-type", contentTypeValue);
  }

  res.body(file);
  res.end();
};

export const staticServe = ({ path }: { path: string }) =>
  async (req: Request, res: Response) => {
    // const path = "./sample/localTest";
    const fullPath = posix.join(path, req.url.pathname);
    try {
      let fileInfo = await Deno.stat(fullPath);
      if (fileInfo.isFile) {
        await serveFile(res, fullPath);
      }
    } catch (e) {
      console.log(fullPath, "is not served file, skip!");
    }
  };
