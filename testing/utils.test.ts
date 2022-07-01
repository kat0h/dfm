import { assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.145.0/path/mod.ts";
import { expand_path, expand_tilde } from "../utils.ts";

Deno.test("expand_path #1", () => {
  const expect = join(Deno.env.get("HOME") ?? "", "test/hoge");
  const actual = expand_path("~/test/hoge");
  return assertEquals(expect, actual);
});

Deno.test("expand_path #2", () => {
  const expect = join("/test/hoge");
  const actual = expand_path("/test/hoge");
  return assertEquals(expect, actual);
});

Deno.test("expand_tilde", () => {
  const expect = join(Deno.env.get("HOME") ?? "", "test/hoge");
  const actual = expand_tilde("~/test/hoge");
  return assertEquals(expect, actual);
});
