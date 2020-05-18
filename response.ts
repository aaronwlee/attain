import {
  ServerRequest,
  Response as DenoResponse,
  Deferred,
  deferred,
} from "./deps.ts";
import { Request } from "./request.ts";
import { AttainResponse, CallBackType } from "./types.ts";
import version from "./version.ts";
import vary from "https://cdn.pika.dev/vary";
import { etag } from "./utils.ts";

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
  private request: Request;
  public done: Deferred<Error | undefined> = deferred();
  public pending: Function[];

  constructor(_serverRequest: ServerRequest, req: Request) {
    this.serverRequest = _serverRequest;
    this.response = {
      headers: new Headers(),
    };
    this.request = req;
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

  public whenReady(...fn: CallBackType[]): void {
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

  public setContentType(type: string) {
    if (this.headers.has("Content-Type")) {
      this.headers.append("Content-Type", type);
    } else {
      this.setHeader("Content-Type", type);
    }
    return this;
  }

  public vary(field: string) {
    vary(this, field);
    return this;
  }

  public async send(contents: ContentsType): Promise<void | this> {
    try {
      this.body(contents);
      this.end();
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }

  private async executePending(): Promise<void> {
    for await (const p of this.pending) {
      await p(this.request, this);
    }
  }

  public async end(): Promise<void> {
    try {
      this.setHeader("Date", new Date().toUTCString());
      const currentETag = this.getHeader("etag");
      const len = this.getHeader("content-length") || this.getBody.length.toString();
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
      await this.executePending();
      await this.serverRequest.respond(this.response);
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }
}
