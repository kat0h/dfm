import { Plugin, SubcmdOptions } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// 指定されたディレクリを起点に引数のgitコマンドを実行します
export default class Git implements Plugin {
  name = "git"

  private dotfiles_dir: string;
  constructor(dotfiles_dir: string) {
    this.dotfiles_dir = resolve_path(dotfiles_dir);
  }

  subcmds = [
    {
      name: "git",
      info: "run git command in dotfiles directory",
      func: this.subcmd,
    },
  ]
  async subcmd(options: SubcmdOptions) {
    await Deno.run({
      cmd: ["git", ...options.args],
      cwd: this.dotfiles_dir,
    }).status();
    return true;
  }
}
