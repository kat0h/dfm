import { Plugin, PluginInfo } from "../main.ts";

export default class CmdCheck implements Plugin {
  private cmds: string[] = [];

  info: PluginInfo = {
    name: "cmdcheck",
  };

  async status() {
    console.log(this.cmds);
    const p: {cmd: string, promise: Promise<Deno.ProcessStatus>}[] = [];
    this.cmds.forEach((cmd) => {
      p.push({cmd: cmd,promise: Deno.run({cmd: ["command", "-v", cmd],stdin: "null",stdout: "null",stderr: "null"}).status()});
    })

    for (const i of p) {
      console.log(`${i.cmd}	→	${(await i.promise).success}`)
    }

    return true;
  }

  cmd(cmds: string[]) {
    cmds.forEach((cmd) => {
      this.cmds.push(cmd);
    });
  }
}
