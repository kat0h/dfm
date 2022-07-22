import { Plugin, PluginInfo, SubcmdOptions } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// 指定されたディレクリを起点に引数のgitコマンドを実行します
export default class Git implements Plugin {
  private dotfiles_dir: string;
  constructor(dotfiles_dir: string) {
    this.dotfiles_dir = resolve_path(dotfiles_dir);
  }
  info: PluginInfo = {
    name: "git",
    subcmd: {
      name: "git",
      info: "run git command in dotfiles directory",
    },
  };
  async subcmd(options: SubcmdOptions) {
    await Deno.run({
      cmd: [ "git", ...options.args ],
      cwd: this.dotfiles_dir
    }).status()
    return true;
  }
}
