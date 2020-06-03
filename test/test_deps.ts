export const test = Deno.test;

export {
  assert,
  assertEquals,
  assertStrictEq,
  assertThrows,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";

export { runBenchmarks, bench } from "https://deno.land/std/testing/bench.ts";