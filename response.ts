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
  #serverRequest?: ServerRequest;
  #response: AttainResponse;
  #pending: Function[];
  #resources: number[] = [];
  #processDone: boolean;

  constructor(_serverRequest: ServerRequest) {
    this.#serverRequest = _serverRequest;
    this.#response = {
      headers: new Headers(),
      status: 200,
    };
    this.#pending = [];
    this.#processDone = false;
    this.setHeader("X-Powered-By", `Deno, Attain v${version}`);
  }

  destroy(): void {
    this.#serverRequest = undefined;
    for (const rid of this.#resources) {
      Deno.close(rid);
    }
  }

  get processDone(): boolean {
    return this.#processDone;
  }

  /**
   * Return the original ServerRequest class object.
   */
  get serverRequest(): ServerRequest {
    if (!this.#serverRequest) {
      throw new Error("already responded");
    }
    return this.#serverRequest;
  }

  /**
   * Return the current response object which will be used for responding
   */
  get getResponse(): AttainResponse {
    return this.#response;
  }

  /**
   * Return the current header class object.
   */
  get headers(): Headers {
    return this.#response.headers;
  }

  /**
   * Return the current status number
   */
  get getStatus(): number | undefined {
    return this.#response.status;
  }

  /**
   * Return the current body data
   */
  get getBody() {
    return this.#response.body;
  }

  /**
   * Execute pend jobs, It's automatically executed after calling the `end()` or `send()`.
   * @param request - latest Request class object
   */
  public async executePendingJobs(request: Request): Promise<void> {
    if (this.#pending.length === 0) {
      return;
    }
    for await (const job of this.#pending) {
      await job(request, this)
    }
  }

  /**
   * Pend the jobs which will execute right before responding.
   * @param fn - An array of callback types
   * 
   * pend((afterReq, afterRes) => {...jobs})
   */
  public pend(...fn: CallBackType[]): void {
    this.#pending.push(...fn);
  }

  /**
   * Set the status
   * @param status - number of the http code.
   */
  public status(status: number) {
    this.#response.status = status;
    return this;
  }

  /**
   * Set the body without response
   * @param body - contents
   */
  public body(body: ContentsType) {
    if (generalBody.includes(typeof body)) {
      this.#response.body = encoder.encode(String(body));
      this.setContentType(
        isHtml(String(body))
          ? "text/html; charset=utf-8"
          : "text/plain; charset=utf-8",
      );
    } else if (body instanceof Uint8Array) {
      this.#response.body = body;
    } else if (body && instanceOfReader(body)) {
      this.#response.body = body;
    } else if (body && typeof body === "object") {
      this.#response.body = encoder.encode(JSON.stringify(body));
      this.setContentType("application/json; charset=utf-8");
    }
    return this;
  }

  /**
   * Replace the current entire header object with new Headers
   * @param headers - Headers(deno) class object
   */
  public setHeaders(headers: Headers) {
    this.#response.headers = headers;
    return this;
  }

  /**
   * Get the header data by a key
   * @param name - key
   * 
   */
  public getHeader(name: string) {
    return this.#response.headers.get(name);
  }

  /**
   * Set the header data
   * @param name - key
   * @param value - header data
   * 
   * setHeader("Content-Type", "application/json");
   */
  public setHeader(name: string, value: string) {
    this.#response.headers.set(name, value);
    return this;
  }

  /**
   * Remove data from the header by a key.
   * @param name - header key
   */
  public removeHeader(name: string) {
    this.#response.headers.delete(name);
    return this;
  }

  /**
   * Set the Content-Type header
   * It'll append the data
   * @param type - content type like "application/json"
   */
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

  /**
   * Set the body and respond with response object.
   * @param contents - the body contents
   * 
   */
  public async send(contents: ContentsType): Promise<void> {
    try {
      this.body(contents);
      this.end();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Serve the static files
   * @param filePath - path of the static file
   * 
   * Required `await`
   */
  public async sendFile(filePath: string): Promise<void> {
    let fileInfo = await Deno.stat(filePath);
    if (fileInfo.isFile) {
      const stream = await fileStream(this, filePath);
      this.#resources.push(stream.rid);
      this.status(200).body(stream).end();
    } else {
      throw new Error(`${filePath} can't find.`);
    }
  }

  /**
   * Serve the static file and force the browser to download it.
   * @param filePath - path of the static file
   * @param name - save as the `name`
   * 
   * Required `await`
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

  /**
   * Redirection
   * @param url 
   */
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

  /**
   * End the current process and respond
   */
  public async end(): Promise<void> {
    try {
      this.setHeader("Date", new Date().toUTCString());
      const currentETag = this.getHeader("etag");
      const len = this.getHeader("content-length") ||
        (this.getBody as Uint8Array).length.toString();
      const newETag = etag(
        (this.getBody as Uint8Array),
        parseInt(len, 10),
      );
      if (currentETag && currentETag === newETag) {
        this.status(304);
      } else {
        this.setHeader("etag", newETag);
      }
      this.#processDone = true;
    } catch (error) {
      if (error instanceof Deno.errors.BadResource) {
        console.log("Connection Lost");
      } else {
        console.error(error);
      }
    }
  }
}
