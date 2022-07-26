import { assertEquals, join } from "../deps.ts";
import { expandTilde, resolvePath } from "../util/mod.ts";

const home = Deno.env.get("HOME") ?? "";
const pwd = Deno.env.get("PWD") ?? "";

// no tilde
Deno.test("expand_tilde #1", () => {
  const expect = "test/hoge/~";
  const actual = expandTilde("test/hoge/~");
  return assertEquals(expect, actual);
});

// ~
Deno.test("expand_tilde #2", () => {
  const expect = home;
  const actual = expandTilde("~");
  return assertEquals(expect, actual);
});

// ~/hoge/hugo
Deno.test("expand_tilde #3", () => {
  const expect = join(home, "hoge/hugo");
  const actual = expandTilde("~/hoge/hugo");
  return assertEquals(expect, actual);
});

const basedir = "/home/hoge";

//   ~   $BASEDIR  ->  $HOME
Deno.test("resolve_path #1", () => {
  const expect = home;
  const actual = resolvePath("~", basedir);
  return assertEquals(expect, actual);
});

//   ../ $BASEDIR  ->  $BASEDIR/../
Deno.test("resolve_path #1", () => {
  const expect = "/home";
  const actual = resolvePath("../", basedir);
  return assertEquals(expect, actual);
});

//   ./  $BASEDIR  ->  $BASEDIR
Deno.test("resolve_path #2", () => {
  const expect = basedir;
  const actual = resolvePath("./", basedir);
  return assertEquals(expect, actual);
});

//   a   $BASEDIR  ->  $BASEDIR/a
Deno.test("resolve_path #3", () => {
  const expect = join(basedir, "a");
  const actual = resolvePath("a", basedir);
  return assertEquals(expect, actual);
});

//   ./hoge/hugo   -> join($(pwd), "./hoge/hugo")
Deno.test("resolve_path #4", () => {
  const expect = join(pwd, "./hoge/hugo");
  const actual = resolvePath("./hoge/hugo");
  return assertEquals(expect, actual);
});

//   /hoge/hugo    -> "/hoge/hugo"
Deno.test("resolve_path #5", () => {
  const expect = "/hoge/hugo";
  const actual = resolvePath("/hoge/hugo");
  return assertEquals(expect, actual);
});

//   ~/hoge        -> "$HOME/hoge"
Deno.test("resolve_path #6", () => {
  const expect = join(home, "hoge");
  const actual = resolvePath("~/hoge");
  return assertEquals(expect, actual);
});
