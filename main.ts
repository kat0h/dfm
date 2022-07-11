import { parse } from "./deps.ts";
import { clr, deco } from "./util/mod.ts";

const version = "v0.2";

export interface Source {
  info: SourceInfo;
  // souces must returns exit status
  // if the process failed, the function returns false
  status?: () => boolean;
  update?: () => boolean;
  subcmd?: (options: SubcmdOptions) => boolean;
}

export interface SourceInfo {
  name: string;
  subcmd?: {
    info: string;
  };
}

type Subcmd = {
  name: string;
  info: string;
  func: (options: SubcmdOptions) => boolean;
};

interface Options {
  subcmd?: SubcmdOptions;
  debug: boolean;
}

export interface SubcmdOptions {
  name: string;
  args: ReturnType<typeof parse>;
}

export default class Dfm {
  private options: Options;
  private sources: Source[] = [];
  private subcmds: Subcmd[];

  constructor() {
    this.options = this.parse_argment(Deno.args);
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
        name: source.info.name,
        info: source.info.subcmd.info,
        func: source.subcmd.bind(source),
      });
    }
    return this;
  }

  end() {
    // exec subcmd
    if (this.options.subcmd === undefined) {
      this.cmd_help({ name: "help", args: { _: [] } });
    } else {
      const subcmd = this.options.subcmd;
      // check builtincmd
      const cmd = this.subcmds.find((sc: Subcmd) => sc.name === subcmd.name);
      if (cmd !== undefined) {
        const status = cmd.func(subcmd);
        if (!status) {
          Deno.exit(1);
        }
      } else {
        console.error(clr("Err: subcmd not found", "red"));
        Deno.exit(1);
      }
    }
    if (this.options.debug) this.debug();
  }

  private parse_argment(args: typeof Deno.args): Options {
    const parsedargs = parse(args);

    let debug = false;
    if (parsedargs.debug === true) {
      delete parsedargs.debug;
      debug = true;
    }

    let subcmd: SubcmdOptions | undefined = undefined;
    if (parsedargs._.length !== 0) {
      const name = parsedargs._[0].toString();
      parsedargs._.shift();
      subcmd = {
        name: name,
        args: parsedargs,
      };
    }

    return {
      debug: debug,
      subcmd: subcmd,
    };
  }

  private cmd_status(_: SubcmdOptions): boolean {
    const exit_status: { name: string; is_failed: boolean }[] = [];

    // LOADED SOURCES
    console.log(clr(deco("STATUS", "bold"), "blue"));
    console.log("LOADED SOURCES:");
    this.sources.forEach((s) => {
      console.log(`・${s.info.name}`);
    });
    console.log();

    // SOURCE's STATUS
    this.sources.forEach((s) => {
      if (s.status != undefined) {
        console.log(clr(deco(s.info.name.toUpperCase(), "bold"), "blue"));
        const is_failed = s.status();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    });

    // CHECK ERROR
    const noerr =
      exit_status.filter((s) => s.is_failed).length === exit_status.length;
    if (noerr) {
      console.log(deco(`${clr("✔  ", "green")}NO Error was detected`, "bold"));
      return true;
    } else {
      console.log(`${clr("✘  ", "red")}Error was detected`);
      exit_status.forEach((s) => {
        console.log(`・${s.name}`);
      });
      return false;
    }
  }

  private cmd_update(_: SubcmdOptions): boolean {
    const exit_status: { name: string; is_failed: boolean }[] = [];
    this.sources.forEach((s) => {
      if (s.update != undefined) {
        const is_failed = s.update();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    });
    console.log(clr(deco("STATUS", "bold"), "blue"));
    const noerr =
      exit_status.filter((s) => s.is_failed).length === exit_status.length;
    if (noerr) {
      console.log(deco(`${clr("✔ ", "green")}NO Error was detected`, "bold"));
      return true;
    } else {
      exit_status.forEach((s) => {
        console.log(`${clr("✘ ", "red")}${s.name}`);
      });
      return false;
    }
  }

  private cmd_help(_: SubcmdOptions): boolean {
    const p = console.log;
    p(clr(deco(`dfm(3) ${version}`, "bold"), "yellow"));
    p("	A dotfiles manager written in deno (typescript)\n");
    p(clr(deco("USAGE:", "bold"), "yellow"));
    p("	deno run -A [filename] [SUBCOMMANDS]\n");
    p(clr(deco("SUBCOMMANDS:", "bold"), "yellow"));
    this.subcmds.forEach((c) => {
      console.log(`	${clr(c.name, "green")}	${c.info}`);
    });
    return true;
  }

  private debug() {
    console.log("\n\n==========DEBUG==========");
    console.log(clr(deco("OPTIONS", "bold"), "blue"));
    console.dir(this.options);
    console.log(clr(deco("SOURCES", "bold"), "blue"));
    console.dir(this.sources);
    console.log(clr(deco("BUILTINCMD", "bold"), "blue"));
    console.dir(this.subcmds);
    console.log("=========================");
  }
}
