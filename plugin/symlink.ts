import Dfm from "../main.ts";
import { Plugin } from "../types.ts";
import {
  colors,
  dirname,
  ensureDirSync,
  ensureSymlinkSync,
  fromFileUrl,
  toFileUrl,
} from "../deps.ts";
import { resolvePath } from "../util/mod.ts";
const { green, red } = colors;

export default class Symlink implements Plugin {
  name = "symlink";

  // links[n][0]: 実体 links[n][1]: シンボリックリンク
  private links: { from: URL; to: URL }[] = [];
  private dotfilesDir: string;

  constructor(dfm: Dfm) {
    // set dotfiles basedir
    this.dotfilesDir = resolvePath(dfm.dotfilesDir);
  }

  stat() {
    // link()で指定されたリンクが正常に貼られているかを確認
    const stat = check_symlinks(this.links);
    return stat;
  }

  list() {
    this.links.forEach((link) => {
      console.log(`・ ${link.from.pathname} → ${link.to.pathname}`);
    });
    return true;
  }

  sync() {
    // リンクが存在していなければ貼る
    ensure_make_symlinks(this.links);
    console.log("OK");
    return true;
  }

  link(links: [string, string][]) {
    // 作成するシンボリックリンクを登録
    links.forEach((link) => {
      const from_url = toFileUrl(
        resolvePath(link[0], this.dotfilesDir),
      );
      const to_url = toFileUrl(resolvePath(link[1]));
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
        `・ ${ok ? green("✔  ") : red("✘  ")} ${fromFileUrl(link.from)} → ${
          fromFileUrl(link.to)
        }`,
      );
    }
  });
  if (stat) {
    console.log("OK");
  }
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
    ensureDirSync(dirname(to));
    if (!check_symlink(link)) {
      console.log(`・ ${green("✔  ")} ${from} → ${to}`);
      ensureSymlinkSync(from, to);
    }
  });
}
