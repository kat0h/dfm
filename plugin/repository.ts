import Dfm from "../main.ts";
import { Plugin, SubcmdOptions } from "../types.ts";
import { resolvePath } from "../util/mod.ts";

// dotfilesのディレクトリを表示します
// cd $(dfm dir) などのように使ってください
export default class Repository implements Plugin {
  private dotfilesDir: string;
  private dfmFilePath: string;
  name = "dir";

  constructor(dfm: Dfm) {
    this.dotfilesDir = resolvePath(dfm.dotfilesDir);
    this.dfmFilePath = resolvePath(dfm.dfmFilePath);
  }

  list() {
    console.log(`・ ${this.dotfilesDir}`);
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
    {
      name: "edit",
      info: "edit dotfiles with $EDITOR",
      func: this.edit,
    },
  ];

  private dir() {
    console.log(`${this.dotfilesDir}`);
    return true;
  }

  private async git(options: SubcmdOptions) {
    await Deno.run({
      cmd: ["git", ...options.args],
      cwd: this.dotfilesDir,
    }).status();
    return true;
  }

  private async edit(options: SubcmdOptions) {
    let editor = undefined;
    if (options.args.length === 0) {
      editor = Deno.env.get("EDITOR");
      if (editor === undefined) {
        console.error(
          "$EDITOR is undefined, specify the command you want to use as an argument",
        );
        return false;
      }
    } else {
      editor = options.args[0];
    }
    await Deno.run({
      cmd: [editor, resolvePath(this.dfmFilePath)],
      cwd: this.dotfilesDir,
    }).status();
    return true;
  }
}
