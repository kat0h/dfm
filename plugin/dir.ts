import { Plugin, PluginInfo } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// dotfilesのディレクトリを表示します
// cd $(dfm dir) などのように使ってください
export default class Dir implements Plugin {
  private dir: string
  constructor(dir: string) {
    this.dir = resolve_path(dir);
  }
  info: PluginInfo = {
    name: "dir",
    subcmd: {
      info: "print dotfiles dir"
    }
  };
  list() {
    console.log(this.dir)
    return true;
  }
  subcmd() {
    console.log(this.dir)
    return true;
  }
}

