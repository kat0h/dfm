import { Plugin } from "../types.ts";
import { colors } from "../deps.ts";
const { green, red, bold } = colors;

// コマンドの存在を command -v を用いてチェックします
export default class Shell implements Plugin {
  private cmds: string[] = [];
  private path: string[] = [];

  name = "shell";

  constructor(opts: {
    cmds?: string[];
    path?: string[];
  }) {
    opts.cmds?.forEach((cmd) => {
      this.cmds.push(cmd);
    });
    opts.path?.forEach((path) => {
      this.path.push(path);
    });
  }

  async stat() {
    const p: { cmd: string; promise: Promise<Deno.ProcessStatus> }[] = [];
    this.cmds.forEach((cmd) => {
      p.push({
        cmd: cmd,
        promise: Deno.run({
          cmd: ["sh", "-c", `command -v '${cmd}'`],
          stdin: "null",
          stdout: "null",
          stderr: "null",
        }).status(),
      });
    });

    const succe: string[] = [];
    const fails: string[] = [];

    for (const i of p) {
      if ((await i.promise).success) {
        succe.push(i.cmd);
      } else {
        fails.push(i.cmd);
      }
    }

    if (succe.length !== 0) {
      console.log(`${green("✔︎ ")} ${succe}`);
    }
    if (fails.length !== 0) {
      console.log(`${red("✘ ")} ${fails}`);
    }

    if (fails.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  list() {
    console.log(bold("COMMANDS"));
    console.log(`・ ${this.cmds}`);
    console.log();

    console.log(bold("PATH"));
    this.path.forEach((path) => {
      console.log(`・ ${path}`);
    });
    return true;
  }
}
