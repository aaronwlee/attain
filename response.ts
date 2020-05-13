import { ServerRequest, Response as DenoResponse, Deferred, deferred } from "./deps.ts";
import { AttainResponse } from "./type.ts";

type ContentsType = Uint8Array | Deno.Reader | string | object | boolean;

const generalBody = ["string", "number", "bigint", "boolean", "symbol"];
const encoder = new TextEncoder();

const isHtml = (value: string): boolean => {
  return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
}

class Response {
  private serverRequest: ServerRequest;
  private response: AttainResponse;
  public done: Deferred<Error | undefined> = deferred();

  constructor(_serverRequest: ServerRequest) {
    this.serverRequest = _serverRequest;
    this.response = {
      headers: new Headers()
    }

    this.getHeaders.set("X-Powered-By", "Deno.js, Attain 0.0.1")
  }

  get getHeaders(): Headers {
    return this.response.headers
  }

  get getStatus(): number | undefined {
    return this.response.status;
  }

  get getBody(): DenoResponse["body"] {
    return this.response.body;
  }

  get readyToSend(): Deferred<Error | undefined> {
    return this.done;
  }


  public status(status: number) {
    if(this.getStatus) {
      return this
    }
    this.response.status = status;
    return this;
  }

  public body(body: DenoResponse["body"]) {
    this.response.body = body;
    return this;
  }

  public setContentType(type: string) {
    if (this.getHeaders.has("Content-Type")) {
      this.getHeaders.append("Content-Type", type);
    } else {
      this.getHeaders.set("Content-Type", type);
    }
    return this;
  }

  public async send(contents: ContentsType): Promise<void | this> {
    try {
      if (this.getBody) {
        return this;
      }
      if (generalBody.includes(typeof contents)) {
        this.body(encoder.encode(String(contents)));
        this.setContentType(isHtml(String(contents)) ? "text/html; charset=utf-8" : "text/plain; charset=utf-8")
      } else if (contents instanceof Uint8Array) {
        this.body(contents);
      } else if (contents && typeof contents === "object") {
        this.body(encoder.encode(JSON.stringify(contents)));
        this.setContentType("application/json; charset=utf-8")
      }
      this.done.resolve();
      // this.end();
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }

  public async end(): Promise<void> {
    try {
      await this.serverRequest.respond(this.response);
    } catch (error) {
      console.error(error);
      this.done.reject(Error(error));
    }
  }

}

export default Response;