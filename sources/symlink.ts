import {
  fromFileUrl,
  toFileUrl,
  join,
} from "https://deno.land/std@0.145.0/path/mod.ts";
import { expandTilde } from "../utils.ts";
import { Source, SourceInfo } from "../main.ts";
import {
  green,
  red,
  yellow,
} from "https://deno.land/std@0.145.0/fmt/colors.ts";

export default class Symlink implements Source {
  // links[n][0]: 実体 links[n][1]: シンボリックリンク
  private links: { from: URL; to: URL }[] = [];
  private dotfiles_dir: string;

  info: SourceInfo = {
    name: "symlink",
    subcmd: {
      info: "make symlinks",
    },
  };

  constructor(options?: { dotfiles_dir?: string }) {
    if (options !== undefined && options.dotfiles_dir !== undefined) {
      this.dotfiles_dir = expandTilde(options.dotfiles_dir);
    } else {
      this.dotfiles_dir = new URL(import.meta.url).pathname;
    }
  }

  status() {
    // Symlinkがきちんと貼られているか確認
    const stat = check_symlinks(this.links);
    return stat;
  }

  update() {
    console.log("symlink update\n");
    return true;
  }

  link(links: [string, string][]) {
    links.forEach((link) => {
      const from_url = toFileUrl(join(this.dotfiles_dir, expandTilde(link[0])));
      const to_url = toFileUrl(expandTilde(link[1]));
      this.links.push({
        from: from_url,
        to: to_url,
      });
    });
  }
}

function check_symlinks(links: { from: URL; to: URL }[]): boolean {
  let stat = true;
  console.log(yellow("LIST:"));
  links.forEach((link) => {
    const ok = check_symlink(link);
    if (!ok) {
      stat = false;
    }
    console.log(
      `${ok ? green("✔ ") : red("✘ ")} ${fromFileUrl(link.from)} → ${
        fromFileUrl(link.to)
      }`,
    );
  });
  console.log("");
  return stat;
}

function check_symlink(link: { from: URL; to: URL }): boolean {
  const lstat = Deno.lstatSync(link.to);
  if (lstat.isSymlink) {
    if (Deno.readLinkSync(link.to) === fromFileUrl(link.from)) {
      return true;
    }
    return false;
  } else {
    return false;
  }
}
