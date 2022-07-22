import { Plugin } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// dotfilesのディレクトリを表示します
// cd $(dfm dir) などのように使ってください
export default class Dir implements Plugin {
  private dotfiles_dir: string;
  name = "dir";

  constructor(dotfiles_dir: string) {
    this.dotfiles_dir = resolve_path(dotfiles_dir);
  }
  list() {
    console.log(this.dotfiles_dir);
    return true;
  }
  subcmd() {
    console.log(this.dotfiles_dir);
    return true;
  }
  subcmds = [
    {
      name: "dir",
      info: "print dotfiles dir",
      func: this.subcmd,
    },
  ];
}
