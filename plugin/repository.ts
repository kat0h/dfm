import { Plugin, SubcmdOptions } from "../types.ts";
import { resolve_path } from "../util/mod.ts";

// dotfilesのディレクトリを表示します
// cd $(dfm dir) などのように使ってください
export default class Repository implements Plugin {
  private dotfiles_dir: string;
  name = "dir";

  constructor(dotfiles_dir: string) {
    this.dotfiles_dir = resolve_path(dotfiles_dir);
  }

  list() {
    console.log(this.dotfiles_dir);
    return true;
  }

  subcmds = [
    {
      name: "dir",
      info: "print dotfiles dir",
      func: this.dir,
    },
    {
      name: "git",
      info: "run git command in dotfiles directory",
      func: this.git,
    },
  ];

  private dir() {
    console.log(this.dotfiles_dir);
    return true;
  }
  private async git(_: SubcmdOptions, args: string[]) {
    await Deno.run({
      cmd: ["git", ...args],
      cwd: this.dotfiles_dir,
    }).status();
    return true;
  }
}
