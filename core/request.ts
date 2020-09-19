/*!
 * Adapted from oak/request at https://github.com/oakserver/oak/blob/master/request.ts
 * which is licensed as:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2020 the oak authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import type {
  Body,
  BodyForm,
  BodyFormData,
  BodyOptions,
  BodyJson,
  BodyRaw,
  BodyReader,
  BodyText,
} from "./body.ts";
import { RequestBody } from "./body.ts";
import type { ServerRequest } from "../deps.ts";
import type { SupportMethodType } from "./types.ts";
import { preferredCharsets } from "./negotiation/charset.ts";
import { preferredEncodings } from "./negotiation/encoding.ts";
import { preferredLanguages } from "./negotiation/language.ts";
import { preferredMediaTypes } from "./negotiation/mediaType.ts";

const decoder = new TextDecoder();

/** An interface which provides information about the current request. */
export class Request {
  #body: RequestBody;
  #serverRequest: ServerRequest;
  #url?: URL;
  #secure: boolean;
  #startDate: number;

  [dynamicProperty: string]: any

  /** Is `true` if the request has a body, otherwise `false`. */
  get hasBody(): boolean {
    return this.#body.has();
  }

  /** The `Headers` supplied in the request. */
  get headers(): Headers {
    return this.#serverRequest.headers;
  }

  /** The HTTP Method used by the request. */
  get method(): SupportMethodType {
    return this.#serverRequest.method as SupportMethodType;
  }

  /** Set to the value of the _original_ Deno server request. */
  get serverRequest(): ServerRequest {
    return this.#serverRequest;
  }

  get startDate(): number {
    return this.#startDate;
  }

  /** A parsed URL for the request which complies with the browser standards.
   * When the application's `.proxy` is `true`, this value will be based off of
   * the `X-Forwarded-Proto` and `X-Forwarded-Host` header values if present in
   * the request. */
  get url(): URL {
    if (!this.#url) {
      const serverRequest = this.#serverRequest;
      let proto: string;
      let host: string;
      proto = this.#secure ? "https" : "http";
        host = serverRequest.headers.get("host") ?? "";
      this.#url = new URL(`${proto}://${host}${serverRequest.url}`);
    }
    return this.#url;
  }

  constructor(serverRequest: ServerRequest, secure = false) {
    this.#serverRequest = serverRequest;
    this.#secure = secure;
    this.#body = new RequestBody(serverRequest);
    this.#startDate = Date.now();
  }

  /** Returns an array of media types, accepted by the requestor, in order of
   * preference.  If there are no encodings supplied by the requestor,
   * `undefined` is returned.
   */
  accepts(): string[] | undefined;
  /** For a given set of media types, return the best match accepted by the
   * requestor.  If there are no encoding that match, then the method returns
   * `undefined`.
   */
  accepts(...types: string[]): string | undefined;
  accepts(...types: string[]): string | string[] | undefined {
    const acceptValue = this.#serverRequest.headers.get("Accept");
    if (!acceptValue) {
      return;
    }
    if (types.length) {
      return preferredMediaTypes(acceptValue, types)[0];
    }
    return preferredMediaTypes(acceptValue);
  }

  /** Returns an array of charsets, accepted by the requestor, in order of
   * preference.  If there are no charsets supplied by the requestor,
   * `undefined` is returned.
   */
  acceptsCharsets(): string[] | undefined;
  /** For a given set of charsets, return the best match accepted by the
   * requestor.  If there are no charsets that match, then the method returns
   * `undefined`. */
  acceptsCharsets(...charsets: string[]): string | undefined;
  acceptsCharsets(...charsets: string[]): string[] | string | undefined {
    const acceptCharsetValue = this.#serverRequest.headers.get(
      "Accept-Charset",
    );
    if (!acceptCharsetValue) {
      return;
    }
    if (charsets.length) {
      return preferredCharsets(acceptCharsetValue, charsets)[0];
    }
    return preferredCharsets(acceptCharsetValue);
  }

  /** Returns an array of encodings, accepted by the requestor, in order of
   * preference.  If there are no encodings supplied by the requestor,
   * `undefined` is returned.
   */
  acceptsEncodings(): string[] | undefined;
  /** For a given set of encodings, return the best match accepted by the
   * requestor.  If there are no encodings that match, then the method returns
   * `undefined`.
   *
   * **NOTE:** You should always supply `identity` as one of the encodings
   * to ensure that there is a match when the `Accept-Encoding` header is part
   * of the request.
   */
  acceptsEncodings(...encodings: string[]): string | undefined;
  acceptsEncodings(...encodings: string[]): string[] | string | undefined {
    const acceptEncodingValue = this.#serverRequest.headers.get(
      "Accept-Encoding",
    );
    if (!acceptEncodingValue) {
      return;
    }
    if (encodings.length) {
      return preferredEncodings(acceptEncodingValue, encodings)[0];
    }
    return preferredEncodings(acceptEncodingValue);
  }

  /** Returns an array of languages, accepted by the requestor, in order of
   * preference.  If there are no languages supplied by the requestor,
   * `undefined` is returned.
   */
  acceptsLanguages(): string[] | undefined;
  /** For a given set of languages, return the best match accepted by the
   * requestor.  If there are no languages that match, then the method returns
   * `undefined`. */
  acceptsLanguages(...langs: string[]): string | undefined;
  acceptsLanguages(...langs: string[]): string[] | string | undefined {
    const acceptLanguageValue = this.#serverRequest.headers.get(
      "Accept-Language",
    );
    if (!acceptLanguageValue) {
      return;
    }
    if (langs.length) {
      return preferredLanguages(acceptLanguageValue, langs)[0];
    }
    return preferredLanguages(acceptLanguageValue);
  }

  body(options: BodyOptions<"form">): BodyForm;
  body(options: BodyOptions<"form-data">): BodyFormData;
  body(options: BodyOptions<"json">): BodyJson;
  body(options: BodyOptions<"raw">): BodyRaw;
  body(options: BodyOptions<"reader">): BodyReader;
  body(options: BodyOptions<"text">): BodyText;
  body(options?: BodyOptions): Body;
  body(options: BodyOptions = {}): Body | BodyReader {
    return this.#body.get(options);
  }
}