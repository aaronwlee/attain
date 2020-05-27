import { Request, Response } from "../mod.ts";

import {
  posix,
  extname,
  dirname,
  resolve,
} from "https://deno.land/std/path/mod.ts";

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
        res.setHeader("Cache-Control", `public`);
        res.headers.append("Cache-Control", `max-age=${maxAge / 1000 | 0}`);
        var t = new Date();
        t.setSeconds(t.getSeconds() + maxAge);
        res.setHeader("Expires", t.toUTCString());
        await res.status(200).sendFile(fullPath);
      }
    } catch (e) {
      if (e instanceof Deno.errors.PermissionDenied) {
        console.error(e);
      }
    }
  };
