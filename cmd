#!/usr/bin/env deno run -A
import Manager from "./main.ts";
import Symlink from "./sources/symlink.ts";
const m = new Manager();

const s = new Symlink();
m.use(s);

s.link([
  ["vimrc", "~/.vimrc"],
  ["tmux.conf", "~/.tmux.conf"],
]);

m.end();
// vim:filetype=typescript
