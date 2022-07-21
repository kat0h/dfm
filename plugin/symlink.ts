import { Plugin, PluginInfo } from "../types.ts";
import { colors, ensureSymlinkSync, fromFileUrl, toFileUrl } from "../deps.ts";
import { resolve_path } from "../util/mod.ts";
const { green, red } = colors;

export default class Symlink implements Plugin {
  // links[n][0]: 実体 links[n][1]: シンボリックリンク
  private links: { from: URL; to: URL }[] = [];
  private dotfiles_dir: string;

  info: PluginInfo = {
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

  stat() {
    // link()で指定されたリンクが正常に貼られているかを確認
    const stat = check_symlinks(this.links);
    return stat;
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
        `${ok ? green("✔  ") : red("✘  ")} ${fromFileUrl(link.from)} → ${
          fromFileUrl(link.to)
        }`,
      );
    }
  });
  if (stat) {
    console.log("OK");
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
      console.log(`${green("✔  ")} ${from} → ${to}`);
      ensureSymlinkSync(from, to);
    }
  });
}
