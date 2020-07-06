import { MiddlewareProps, ErrorMiddlewareProps } from "./types.ts";
import {
  yellow,
  cyan,
  green,
  red
} from "./deps.ts";


export async function circulateMiddlewares(
  currentMiddlewares: MiddlewareProps[],
  step: number = 0,
) {
  for (const current of currentMiddlewares) {
    if (current.next) {
      const currentIndent = step + 1;
      const nextIndent = step + 2;
      console.log("   ".repeat(step) + "{");
      current.method &&
        console.log(
          "   ".repeat(currentIndent) + `method: ${cyan(current.method)},`,
        );
      current.url &&
        console.log(
          "   ".repeat(currentIndent) + `url: ${green(current.url)},`,
        );
      console.log("   ".repeat(currentIndent) + `next: [`);
      circulateMiddlewares(current.next, nextIndent);
      console.log("   ".repeat(currentIndent) + `]`);
      console.log("   ".repeat(step) + "}");
    } else {
      console.log(`${"   ".repeat(step)}{`);
      current.method &&
        console.log(
          `${"   ".repeat(step + 1)}method: ${cyan(current.method)}`,
        );
      current.url &&
        console.log(`${"   ".repeat(step + 1)}url: ${green(current.url)}`);
      current.paramHandlers &&
        console.log(
          `${"   ".repeat(step + 1)}paramHandlers: [${
            red((current.paramHandlers.map((e) => e.paramName)).join(", "))
          }]`,
        );
      current.callBack &&
        console.log(
          `${"   ".repeat(step + 1)}callBack: ${
            yellow(current.callBack.name || "Anonymous")
          }`,
        );
      console.log(`${"   ".repeat(step)}},`);
    }
  }
};

export async function circulateErrorMiddlewares(
  currentErrorMiddlewares: ErrorMiddlewareProps[],
  step: number = 0,
) {
  for (const current of currentErrorMiddlewares) {
    if (current.next) {
      const currentIndent = step + 1;
      const nextIndent = step + 2;
      console.log("   ".repeat(step) + "{");
      current.url &&
        console.log(
          "   ".repeat(currentIndent) + `url: ${green(current.url)},`,
        );
      console.log("   ".repeat(currentIndent) + `next: [`);
      circulateErrorMiddlewares(current.next, nextIndent);
      console.log("   ".repeat(currentIndent) + `]`);
      console.log("   ".repeat(step) + "}");
    } else {
      console.log(`${"   ".repeat(step)}{`);
      current.url &&
        console.log(`${"   ".repeat(step + 1)}url: ${green(current.url)}`);
      current.callBack &&
        console.log(
          `${"   ".repeat(step + 1)}callBack: ${
            yellow(current.callBack.name || "Anonymous")
          }`,
        );
      console.log(`${"   ".repeat(step)}},`);
    }
  }
};

