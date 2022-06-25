import { parse } from "https://deno.land/std@0.144.0/flags/mod.ts";
import {
  blue,
  bold,
  green,
  red,
  yellow,
} from "https://deno.land/std@0.145.0/fmt/colors.ts";
// todo: 終了ステータスを設定

type Subcmd = { name: string; info: string; func: () => boolean };

interface Info {
  name: string;
  subcmd?: {
    name: string;
    info: string;
  };
}

export interface Source {
  info: Info;
  setup: (manager: Manager) => void;
  // these must return exit status
  // if the process failed, the function returns false
  status?: () => boolean;
  update?: () => boolean;
  subcmd?: () => boolean;
}

export default class Manager {
  private args: ReturnType<typeof parse>;
  private sources: Source[] = [];
  private subcmds: Subcmd[];

  constructor() {
    this.args = parse(Deno.args);
    this.subcmds = [
      { name: "status", info: "show status", func: this.cmd_status.bind(this) },
      {
        name: "update",
        info: "keep up to date",
        func: this.cmd_update.bind(this),
      },
      { name: "help", info: "show this help", func: this.cmd_help.bind(this) },
    ];
  }

  use(source: Source) {
    this.sources.push(source);
    // if the source has subcmd
    if (source.info.subcmd != undefined && source.subcmd != undefined) {
      this.subcmds.push({
        name: source.info.subcmd.name,
        info: source.info.subcmd.info,
        func: source.subcmd.bind(source),
      });
    }
    return this;
  }

  end() {
    // exec subcmd
    if (this.args._.length == 0) {
      this.cmd_help();
    } else {
      // check builtincmd
      const cmd = this.subcmds.find((sc: Subcmd) => sc.name === this.args._[0]);
      if (cmd !== undefined) {
        const status = cmd.func();
        if (!status) {
          Deno.exit(1);
        }
      } else {
        console.error("Err: subcmd not found");
      }
    }
    // for debug
    if (this.args.debug === true) {
      this.debug();
    }
  }

  private cmd_status(): boolean {
    const exit_status: { name: string; is_failed: boolean }[] = [];
    this.sources.forEach((s) => {
      if (s.status != undefined) {
        const is_failed = s.status();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    });
    console.log(blue(bold("STATUS")));
    const noerr =
      exit_status.filter((s) => s.is_failed).length === exit_status.length;
    if (noerr) {
      console.log(bold(`${green("✔ ")}NO Error was detected`));
      return true;
    } else {
      exit_status.forEach((s) => {
        console.log(`${red("✘ ")}${s.name}`);
      });
      return false;
    }
  }

  private cmd_update(): boolean {
    const exit_status: { name: string; is_failed: boolean }[] = [];
    this.sources.forEach((s) => {
      if (s.update != undefined) {
        const is_failed = s.update();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    });
    console.log(blue(bold("STATUS")));
    const noerr =
      exit_status.filter((s) => s.is_failed).length === exit_status.length;
    if (noerr) {
      console.log(bold(`${green("✔ ")}NO Error was detected`));
      return true;
    } else {
      exit_status.forEach((s) => {
        console.log(`${red("✘ ")}${s.name}`);
      });
      return false;
    }
  }

  private cmd_help(): boolean {
    const p = console.log;
    p(yellow(bold("dotmanager(3) v0.1")));
    p("	A dotfiles manager written in deno (typescript)\n");
    p(yellow(bold("USAGE:")));
    p("	deno run -A [filename] [SUBCOMMANDS]\n");
    p(yellow(bold("SUBCOMMANDS:")));
    this.subcmds.forEach((c) => {
      console.log(`	${green(c.name)}	${c.info}`);
    });
    return true;
  }

  private debug() {
    console.log("\n\n==========DEBUG==========");
    console.log(blue(bold("ARGS")));
    console.dir(this.args);
    console.log(blue(bold("SOURCES")));
    console.dir(this.sources);
    console.log(blue(bold("BUILTINCMD")));
    console.dir(this.subcmds);
    console.log("=========================");
  }
}
