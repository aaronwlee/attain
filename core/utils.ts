import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { Sha1, lookup, match, extname, parse } from "../deps.ts";

const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
const HTAB = "\t".charCodeAt(0);
const SPACE = " ".charCodeAt(0);

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  const result = lookup(extname(path));
  return result ? result : undefined;
}

export function stripEol(value: Uint8Array): Uint8Array {
  if (value[value.byteLength - 1] == LF) {
    let drop = 1;
    if (value.byteLength > 1 && value[value.byteLength - 2] === CR) {
      drop = 2;
    }
    return value.subarray(0, value.byteLength - drop);
  }
  return value;
}

export const checkPathAndParseURLParams = (
  req: Request,
  middlewareURL: string,
  currentURL: string,
) => {
  const matcher = match(middlewareURL, { decode: decodeURIComponent });
  const isMatch: any = matcher(currentURL);
  if (isMatch.params) {
    const { 0: extra, ...result } = isMatch.params;
    req.params = { ...req.params, ...result };
  }
  return isMatch;
};

export function getRandomFilename(prefix = "", extension = ""): string {
  return `${prefix}${
    new Sha1().update(crypto.getRandomValues(new Uint8Array(256))).hex()
  }${extension ? `.${extension}` : ""}`;
}

export const etag = (entity: Uint8Array, len: number) => {
  if (!entity) {
    // fast-path empty
    return `W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"`;
  }

  // compute hash of entity
  const sha1 = new Sha1();
  sha1.update(entity);
  sha1.digest();
  const hash = sha1.toString().substring(0, 27);

  return `W/"${len.toString(16)}-${hash}"`;
};

export function skipLWSPChar(u8: Uint8Array): Uint8Array {
  const result = new Uint8Array(u8.length);
  let j = 0;
  for (let i = 0; i < u8.length; i++) {
    if (u8[i] === SPACE || u8[i] === HTAB) continue;
    result[j++] = u8[i];
  }
  return result.slice(0, j);
}

export const fresh = (req: Request, res: Response) => {
  const modifiedSince = req.headers.get("if-modified-since");
  const noneMatch = req.headers.get("if-none-match");

  if (!modifiedSince && !noneMatch) {
    return false;
  }

  const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/;
  const cacheControl = req.headers.get("cache-control");
  if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
    return false;
  }

  if (noneMatch && noneMatch !== "*") {
    const etag = res.getHeader("etag");

    if (!etag) {
      return false;
    }

    let etagStale = true;
    const matches = parseTokenList(noneMatch);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (match === etag || match === "W/" + etag || "W/" + match === etag) {
        etagStale = false;
        break;
      }
    }

    if (etagStale) {
      return false;
    }
  }

  // if-modified-since
  if (modifiedSince) {
    const lastModified = res.getHeader("last-modified");
    const modifiedStale = !lastModified ||
      !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince));

    if (modifiedStale) {
      return false;
    }
  }

  return true;
};

const parseHttpDate = (date: any) => {
  const timestamp = date && Date.parse(date);

  // istanbul ignore next: guard against date.js Date.parse patching
  return typeof timestamp === "number" ? timestamp : NaN;
};

const parseTokenList = (str: string) => {
  let end = 0;
  const list = [];
  let start = 0;

  // gather tokens
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str.charCodeAt(i)) {
      case 0x20:/*   */
        if (start === end) {
          start = end = i + 1;
        }
        break;
      case 0x2c:/* , */
        list.push(str.substring(start, end));
        start = end = i + 1;
        break;
      default:
        end = i + 1;
        break;
    }
  }

  // final token
  list.push(str.substring(start, end));

  return list;
};

export const acceptParams = (str: string, index: number = 0) => {
  var parts = str.split(/ *; */);
  var ret: any = {
    value: parts[0],
    quality: 1,
    params: {},
    originalIndex: index,
  };

  for (var i = 1; i < parts.length; ++i) {
    var pms = parts[i].split(/ *= */);
    if ("q" === pms[0]) {
      ret.quality = parseFloat(pms[1]);
    } else {
      ret.params[pms[0]] = pms[1];
    }
  }

  return ret;
};

export const normalizeType = (type: string) => {
  return ~type.indexOf("/")
    ? acceptParams(type)
    : { value: lookup(type), params: {} };
};

export const fileStream = async (
  res: Response,
  filePath: string,
): Promise<Deno.File> => {
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

  return file;
};

export const last = (array: any[]) => {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
};

export const getEnvFlags = () => {
  const options = parse(Deno.args);
  const container: any = {}

  if (options["mode"]) {
    container.mode = options["mode"]
  }

  if (options["env"]) {
    container.env = options["env"]
  }

  return container;
}
