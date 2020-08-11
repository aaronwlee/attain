export {
  serve,
  serveTLS,
  ServerRequest,
  Server,
} from "https://deno.land/std@0.62.0/http/server.ts";
export { Status, STATUS_TEXT } from "https://deno.land/std@0.62.0/http/http_status.ts";

export interface Response {
  status?: number;
  headers?: Headers;
  body?: Uint8Array | Deno.Reader | string;
  trailers?: () => Promise<Headers> | Headers;
}

export {
  contentType,
  extension,
  lookup,
} from "https://deno.land/x/media_types/mod.ts";

export {
  deferred,
} from "https://deno.land/std@0.62.0/async/mod.ts";

export interface Deferred<T> extends Promise<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}

export {
  Sha1,
} from "https://deno.land/std@0.62.0/hash/sha1.ts";

export {
  pathToRegexp,
  match,
} from "https://raw.githubusercontent.com/pillarjs/path-to-regexp/master/src/index.ts";

export {
  red,
  yellow,
  green,
  cyan,
  bold,
  blue,
  magenta,
} from "https://deno.land/std@0.62.0/fmt/colors.ts";

export { default as isEmpty } from "https://raw.githubusercontent.com/lodash/lodash/master/isEmpty.js";

export { extname } from "https://deno.land/std@0.62.0/path/mod.ts";

export { parse } from "https://deno.land/std@0.62.0/flags/mod.ts";
export { ensureDir } from "https://deno.land/std@0.62.0/fs/mod.ts";
export { EventEmitter } from "https://deno.land/std@0.62.0/node/events.ts";
export { listenAndServe } from "https://deno.land/std@0.62.0/http/server.ts";
export { acceptWebSocket, acceptable, isWebSocketCloseEvent } from "https://deno.land/std@0.62.0/ws/mod.ts";
export { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std@0.62.0/encoding/yaml.ts";

export { assert } from "https://deno.land/std@0.62.0/testing/asserts.ts";

export { copyBytes, equal } from "https://deno.land/std@0.62.0/bytes/mod.ts";
export {
  posix,
} from "https://deno.land/std@0.62.0/path/mod.ts";
