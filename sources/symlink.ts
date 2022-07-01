// TODO: ディレクトリを掘る
//
// リンクが正しく配置されていないパターン
// ・リンクがない
// ・リンク先が間違っている
// リンクを配置する手順
// ・配置するディレクトリが存在するか確かめる
// ・権限を持っているかを確かめる
// ・リンクを貼る
// パスを展開する手順
// ・チルダを展開する
// ・BaseDirと結合する
// ・URL型に変換する

import {
  fromFileUrl,
  join,
  toFileUrl,
} from "https://deno.land/std@0.145.0/path/mod.ts";
import { expand_tilde } from "../utils.ts";
import { Source, SourceInfo } from "../main.ts";
import {
  green,
  red,
  yellow,
} from "https://deno.land/std@0.145.0/fmt/colors.ts";
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
    if (options !== undefined && options.dotfiles_dir !== undefined) {
      this.dotfiles_dir = expand_tilde(options.dotfiles_dir);
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

  link(links: [string, string][]) {
    links.forEach((link) => {
      const from_url = toFileUrl(
        join(this.dotfiles_dir, expand_tilde(link[0])),
      );
      const to_url = toFileUrl(expand_tilde(link[1]));
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
  try {
    const lstat = Deno.lstatSync(link.to);
    if (lstat.isSymlink) {
      if (Deno.readLinkSync(link.to) === fromFileUrl(link.from)) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  } catch (_) {
    return false;
  }
}

function ensure_make_symlinks(links: { from: URL; to: URL }[]): void {
  links.forEach((link) => {
    const from = link.from.pathname;
    const to = link.to.pathname;
    if (!check_symlink(link)) {
      console.log(`${green("✔ ")} ${from} -> ${to}`);
      ensureSymlinkSync(from, to);
    } else {
      console.log(`${green("✔ ")} ${to}`);
    }
  });
}
