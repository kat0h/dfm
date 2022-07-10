// TODO: ディレクトリを掘る
//
// リンクを配置する手順
// ・配置するディレクトリが存在するか確かめる
// ・権限を持っているかを確かめる
// ・リンクを貼る

import {
  fromFileUrl,
  toFileUrl,
} from "https://deno.land/std@0.145.0/path/mod.ts";
import { resolve_path } from "../util/mod.ts";
import { Source, SourceInfo } from "../main.ts";
import { green, red } from "https://deno.land/std@0.145.0/fmt/colors.ts";
import { ensureSymlinkSync } from "https://deno.land/std@0.145.0/fs/mod.ts";

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
    // set dotfiles basedir
    if (options !== undefined && options.dotfiles_dir !== undefined) {
      this.dotfiles_dir = resolve_path(options.dotfiles_dir);
      resolve_path(options.dotfiles_dir);
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
    ensure_make_symlinks(this.links);
    console.log();
    return true;
  }

  // 作成するシンボリックリンクを登録
  link(links: [string, string][]) {
    links.forEach((link) => {
      const from_url = toFileUrl(
        resolve_path(link[0], this.dotfiles_dir),
      );
      const to_url = toFileUrl(resolve_path(link[1]));
      this.links.push({
        from: from_url,
        to: to_url,
      });
    });
  }
}

function check_symlinks(links: { from: URL; to: URL }[]): boolean {
  let stat = true;
  links.forEach((link) => {
    const ok = check_symlink(link);
    if (!ok) {
      stat = false;
      console.log(
        `${ok ? green("✔ ") : red("✘ ")} ${fromFileUrl(link.from)} → ${
          fromFileUrl(link.to)
        }`,
      );
    }
  });
  if (stat) {
    console.log("All symlinks are ok");
  }
  console.log("");
  return stat;
}

// シンボリックリンクが適切に作成されているかを確かめる
function check_symlink(link: { from: URL; to: URL }): boolean {
  try {
    // Check for the presence of links
    const lstat = Deno.lstatSync(link.to);
    if (lstat.isSymlink) {
      // Check where the link points
      if (Deno.readLinkSync(link.to) === fromFileUrl(link.from)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (_) {
    return false;
  }
}

// if symlink does not exist, make symlink
function ensure_make_symlinks(links: { from: URL; to: URL }[]): void {
  links.forEach((link) => {
    const from = link.from.pathname;
    const to = link.to.pathname;
    if (!check_symlink(link)) {
      console.log(`${green("✔ ")} ${from} -> ${to}`);
      ensureSymlinkSync(from, to);
      // } else {
      // console.log(`${green("✔ ")} ${to}`);
    }
  });
}
