import { join } from "https://deno.land/std@0.145.0/path/mod.ts";

const homedir = Deno.env.get("HOME");

export function expandTilde(path: string) {
  if (homedir === undefined) {
    return path;
  } else {
    if (!path) return path;
    if (path === "~") return homedir;
    if (path.slice(0, 2) !== "~/") return path;
    return join(homedir, path.slice(2));
  }
}
