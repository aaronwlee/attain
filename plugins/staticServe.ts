import { Request, Response } from "../mod.ts";

import {
  posix,
  extname,
  dirname,
  resolve,
} from "https://deno.land/std/path/mod.ts";
import { lookup } from "https://cdn.pika.dev/mime-types";

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  const result = lookup(extname(path));
  return result ? result : undefined;
}

const serveFile = async (
  res: Response,
  filePath: string,
): Promise<void> => {
  const [file, fileInfo] = await Promise.all(
    [Deno.open(filePath), Deno.stat(filePath)],
  );

  res.setHeader("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(filePath);
  if (contentTypeValue) {
    res.setHeader("content-type", contentTypeValue);
  }
  fileInfo.mtime &&
    res.setHeader("Last-Modified", fileInfo.mtime.toUTCString());

  res.body(file);
};

export const staticServe = (
  path: string,
  options?: { maxAge?: number },
) =>
  async (req: Request, res: Response) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return;
    }
    const maxAge = options && options.maxAge || 0;
    const fullPath = posix.join(path, req.url.pathname);
    try {
      let fileInfo = await Deno.stat(fullPath);
      if (fileInfo.isFile) {
        await serveFile(res, fullPath);
        res.setHeader("Cache-Control", `public`);
        res.headers.append("Cache-Control", `max-age=${maxAge / 1000 | 0}`);
        var t = new Date();
        t.setSeconds(t.getSeconds() + maxAge);
        res.setHeader("Expires", t.toUTCString())
        res.status(200).end();
      }
    } catch (e) {
      if (e instanceof Deno.errors.PermissionDenied) {
        console.error(e);
      }
    }
  };
