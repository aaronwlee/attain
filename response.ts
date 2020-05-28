import {
  ServerRequest,
  Response as DenoResponse,
  Deferred,
  deferred,
} from "./deps.ts";
import { Request } from "./request.ts";
import { AttainResponse, CallBackType } from "./types.ts";
import version from "./version.ts";
import { etag, normalizeType, fileStream, last } from "./utils.ts";

type ContentsType = Uint8Array | Deno.Reader | string | object | boolean;
function instanceOfReader(object: any): object is Deno.Reader {
  return "read" in object;
}

const generalBody = ["string", "number", "bigint", "boolean", "symbol"];
const encoder = new TextEncoder();

const isHtml = (value: string): boolean => {
  return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
};

export class Response {
  private serverRequest: ServerRequest;
  private response: AttainResponse;
  private done: Deferred<Error | undefined> = deferred();
  public executePending: Deferred<Request> = deferred();
  public pending: Function[];

  constructor(_serverRequest: ServerRequest) {
    this.serverRequest = _serverRequest;
    this.response = {
      headers: new Headers(),
    };
    this.pending = [];

    this.setHeader("X-Powered-By", `Deno.js, Attain v${version}`);
  }

  get getResponse(): AttainResponse {
    return this.response;
  }

  get headers(): Headers {
    return this.response.headers;
  }

  get getStatus(): number | undefined {
    return this.response.status;
  }

  get getBody(): Uint8Array {
    return this.response.body as Uint8Array;
  }

  get readyToSend(): Deferred<Error | undefined> {
    return this.done;
  }

  private async executePendingJobs(request: Request): Promise<void> {
    for await (const p of this.pending) {
      await p(request, this);
    }
  }

  public pend(...fn: CallBackType[]): void {
    this.pending.push(...fn);
  }

  public status(status: number) {
    this.response.status = status;
    return this;
  }

  public body(body: ContentsType) {
    if (generalBody.includes(typeof body)) {
      this.response.body = encoder.encode(String(body));
      this.setContentType(
        isHtml(String(body))
          ? "text/html; charset=utf-8"
          : "text/plain; charset=utf-8",
      );
    } else if (body instanceof Uint8Array) {
      this.response.body = body;
    } else if (body && instanceOfReader(body)) {
      this.response.body = body;
    } else if (body && typeof body === "object") {
      this.response.body = encoder.encode(JSON.stringify(body));
      this.setContentType("application/json; charset=utf-8");
    }
    return this;
  }

  public setHeaders(headers: Headers) {
    this.response.headers = headers;
    return this;
  }

  public getHeader(name: string) {
    return this.response.headers.get(name);
  }

  public setHeader(name: string, value: string) {
    this.response.headers.set(name, value);
    return this;
  }

  public removeHeader(name:string) {
    this.response.headers.delete(name);
    return this;
  }

  public setContentType(type: string) {
    if (this.headers.has("Content-Type")) {
      const contentType = this.headers.get("Content-Type");
      if (contentType && contentType.includes(type)) {
        return this;
      }
      this.headers.append("Content-Type", type);
    } else {
      this.setHeader("Content-Type", type);
    }
    return this;
  }

  private format(obj: any) {
    const defaultFn = obj.default;
    if (defaultFn) delete obj.default;
    const keys: any = Object.keys(obj);

    const tempRequest = new Request(this.serverRequest);
    const key: any = keys.length > 0 ? tempRequest.accepts(keys) : false;

    if (key) {
      this.setHeader("Content-type", normalizeType(key).value);
      this.body(key());
    } else if (defaultFn) {
      this.body(defaultFn());
    } else {
      this.status(406);
    }
  }

  public async send(contents: ContentsType): Promise<void> {
    try {
      this.body(contents);
      this.end();
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }

  /**
   * Required await
   */
  public async sendFile(filePath: string): Promise<void> {
    try {
      let fileInfo = await Deno.stat(filePath);
      if (fileInfo.isFile) {
        this.status(200).send(await fileStream(this, filePath));
      } else {
        throw Error(`${filePath} can't find.`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Required await
   */
  public async download(filePath: string, name?: string): Promise<void> {
    try {
      let fileName = filePath;
      if (!name) {
        const splited = filePath.split("/");
        fileName = last(splited);
      } else {
        const hasFileType = name.split(".").length > 1 ? true : false;
        if (hasFileType) {
          fileName = name;
        } else {
          throw `${name} dosen't have filetype`;
        }
      }

      const hasFileType = fileName.split(".").length > 1 ? true : false;
      if (hasFileType) {
        this.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
      } else {
        throw `${fileName} dosen't have filetype`;
      }

      await this.sendFile(filePath);
    } catch (error) {
      console.error(error);
    }
  }

  public redirect(url: string | "back") {
    let loc = url;
    if (url === "back") {
      loc = this.serverRequest.headers.get("Referrer") || "/";
    }
    this.setHeader("Location", encodeURI(loc));

    this.format({
      text: function () {
        return 302 + ". Redirecting to " + loc;
      },
      html: function () {
        var u = escape(loc);
        return "<p>" + 302 + '. Redirecting to <a href="' + u + '">' + u +
          "</a></p>";
      },
      default: function () {
        return "";
      },
    });

    this.status(302).end();
  }

  public async end(): Promise<void> {
    try {
      this.setHeader("Date", new Date().toUTCString());
      const currentETag = this.getHeader("etag");
      const len = this.getHeader("content-length") ||
        this.getBody.length.toString();
      const newETag = etag(
        this.getBody,
        parseInt(len, 10),
      );
      if (currentETag && currentETag === newETag) {
        this.status(304);
      } else {
        this.setHeader("etag", newETag);
      }

      this.done.resolve();
      const request = await this.executePending;
      await this.executePendingJobs(request);
      await this.serverRequest.respond(this.response);
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }
}
