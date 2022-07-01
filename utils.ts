import { fromFileUrl, join } from "https://deno.land/std@0.145.0/path/mod.ts";

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

export function expand_path(path: string, basedir?: string) {
  const path1 = expand_tilde(path);
  if (path === path1) {
    if (basedir == undefined) {
      return fromFileUrl(new URL(path, import.meta.url));
    } else {
      const path2 = join(path1, basedir);
      return fromFileUrl(new URL(path2, basedir));
    }
  } else {
    return path1;
  }
}
