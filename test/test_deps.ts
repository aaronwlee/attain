export const test = Deno.test;

export {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
  assertThrowsAsync,
} from "https://deno.land/std@0.62.0/testing/asserts.ts";

export { runBenchmarks, bench } from "https://deno.land/std@0.62.0/testing/bench.ts";
