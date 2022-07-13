import { colors, parse } from "./deps.ts";
const { blue, bold, green, red, yellow, setColorEnabled } = colors;

export interface Plugin {
  info: PluginInfo;
  // souces must returns exit status
  // if the process failed, the function returns false
  status?: () => boolean | Promise<boolean>;
  update?: () => boolean | Promise<boolean>;
  subcmd?: (options: SubcmdOptions) => boolean | Promise<boolean>;
}

export interface PluginInfo {
  name: string;
  subcmd?: {
    info: string;
  };
}

type Subcmd = {
  name: string;
  info: string;
  func: (options: SubcmdOptions) => boolean | Promise<boolean>;
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
  private sources: Plugin[] = [];
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

  use(source: Plugin) {
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

  async end() {
    if (!Deno.isatty(Deno.stdout.rid)) {
      setColorEnabled(false);
    }
    // exec subcmd
    if (this.options.subcmd === undefined) {
      this.cmd_help({ name: "help", args: { _: [] } });
    } else {
      const subcmd = this.options.subcmd;
      // check builtincmd
      const cmd = this.subcmds.find((sc: Subcmd) => sc.name === subcmd.name);
      if (cmd !== undefined) {
        const status = await cmd.func(subcmd);
        if (!status) {
          Deno.exit(1);
        }
      } else {
        console.error(red("Err: subcmd not found"));
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

  private async cmd_status(_: SubcmdOptions): Promise<boolean> {
    const exit_status: { name: string; is_failed: boolean }[] = [];

    // LOADED SOURCES
    console.log(blue(bold("STATUS")));
    console.log("LOADED SOURCES:");
    this.sources.forEach((s) => {
      console.log(`・${s.info.name}`);
    });
    console.log();

    // SOURCE's STATUS
    for (const s of this.sources) {
      if (s.status != undefined) {
        console.log(blue(bold(s.info.name.toUpperCase())));
        const is_failed = await s.status();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    }

    // CHECK ERROR
    const noerr =
      exit_status.filter((s) => s.is_failed).length === exit_status.length;
    console.log();
    if (noerr) {
      console.log(bold(`${green("✔  ")}NO Error was detected`));
      return true;
    } else {
      console.log(`${red("✘  ")}Error was detected`);
      exit_status.forEach((s) => {
        console.log(`・${s.name}`);
      });
      return false;
    }
  }

  private async cmd_update(_: SubcmdOptions): Promise<boolean> {
    const exit_status: { name: string; is_failed: boolean }[] = [];
    for (const s of this.sources) {
      if (s.update != undefined) {
        console.log(blue(bold(s.info.name.toUpperCase())));
        const is_failed = await s.update();
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    }
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

  private cmd_help(_: SubcmdOptions): boolean {
    const p = console.log;
    p(yellow(bold("dfm(3) v0.1")));
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
    console.log(blue(bold("OPTIONS")));
    console.dir(this.options);
    console.log(blue(bold("SOURCES")));
    console.dir(this.sources);
    console.log(blue(bold("BUILTINCMD")));
    console.dir(this.subcmds);
    console.log("=========================");
  }
}
