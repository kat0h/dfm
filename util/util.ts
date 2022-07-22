import { join, resolve } from "../deps.ts";

const homedir = Deno.env.get("HOME");

export function expand_tilde(path: string) {
  if (homedir === undefined) {
    return path;
  } else {
    if (!path) return path;
    if (path === "~") return homedir;
    if (path.slice(0, 2) !== "~/") return path;
    return join(homedir, path.slice(2));
  }
}

// BASEDIR is basedir of dotfiles
//   ~   $BASEDIR  ->  $HOME
//   ../ $BASEDIR  ->  $BASEDIR/../
//   ./  $BASEDIR  ->  $BASEDIR
//   a   $BASEDIR  ->  $BASEDIR/a
//   ./hoge/hugo   -> join($(pwd), "./hoge/hugo")
//   /hoge/hugo    -> "/hoge/hugo"
//   ~/hoge        -> "$HOME/hugo"
export function resolve_path(path: string, basedir?: string): string {
  if (basedir !== undefined) {
    return resolve(basedir, expand_tilde(path));
  } else {
    return resolve("", expand_tilde(path));
  }
}

export function isatty(): boolean {
  return Deno.isatty(Deno.stdout.rid);
}

export function os(): typeof Deno.build.os {
  return Deno.build.os;
}
