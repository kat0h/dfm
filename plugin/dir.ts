import { Plugin, PluginInfo } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// dotfilesのディレクトリを表示します
// cd $(dfm dir) などのように使ってください
export default class Dir implements Plugin {
  private dotfiles_dir: string;
  constructor(dotfiles_dir: string) {
    this.dotfiles_dir = resolve_path(dotfiles_dir);
  }
  info: PluginInfo = {
    name: "dir",
    subcmd: {
      name: "dir",
      info: "print dotfiles dir",
    },
  };
  list() {
    console.log(this.dotfiles_dir);
    return true;
  }
  subcmd() {
    console.log(this.dotfiles_dir);
    return true;
  }
}
