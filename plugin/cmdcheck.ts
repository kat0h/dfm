import { Plugin } from "../types.ts";
import { colors } from "../deps.ts";
const { green, red } = colors;

// コマンドの存在を command -v を用いてチェックします
export default class CmdCheck implements Plugin {
  private cmds: string[] = [];

  name = "cmdcheck";

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
    console.log(`${this.cmds}`);
    return true;
  }

  cmd(cmds: string[]) {
    cmds.forEach((cmd) => {
      this.cmds.push(cmd);
    });
  }
}
