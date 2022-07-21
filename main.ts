import { colors, parse } from "./deps.ts";
import { Options, Plugin, Subcmd, SubcmdOptions } from "./types.ts";
import { isatty } from "./util/util.ts";
const { blue, bold, green, red, yellow, setColorEnabled, inverse } = colors;

const version = "v0.3";

export default class Dfm {
  private options: Options;
  private plugins: Plugin[] = [];
  private subcmds: Subcmd[];

  constructor() {
    this.options = parse_argment(Deno.args);
    // サブコマンドの定義
    this.subcmds = [
      {
        // 状態を確認する
        name: "stat",
        info: "show status of settings",
        func: (options: SubcmdOptions) => {
          return this.cmd_base.bind(this)(options, "stat");
        },
      },
      {
        name: "list",
        info: "show list of settings",
        func: (options: SubcmdOptions) => {
          // プラグインの一覧を表示
          console.log(inverse(blue(bold("PLUGINS"))));
          this.plugins.forEach((plugin) => {
            console.log(`・ ${plugin.info.name}`)
          })
          console.log()
          return this.cmd_base.bind(this)(options, "list");
        }
      },
      {
        // 設定を同期する
        name: "sync",
        info: "apply settings",
        func: (options: SubcmdOptions) => {
          return this.cmd_base.bind(this)(options, "sync");
        },
      },
      {
        // ヘルプを表示する
        name: "help",
        info: "show this help",
        func: this.cmd_help.bind(this)
      },
    ];
  }

  use(plugin: Plugin) {
    // プラグインを登録する

    this.plugins.push(plugin);
    // もしプラグインがサブコマンドを実装していた場合、サブコマンドを登録する
    if (plugin.info.subcmd != undefined && plugin.subcmd != undefined) {
      this.subcmds.push({
        name: plugin.info.name,
        info: plugin.info.subcmd.info,
        func: plugin.subcmd.bind(plugin),
      });
    }
    return this;
  }

  async end() {
    // コマンドを実行する

    // もし他のコマンドにパイプされていた場合、エスケープシーケンスを利用しない
    if (!isatty()) {
      setColorEnabled(false);
    }
    // サブコマンドを実行
    if (this.options.subcmd === undefined) {
      // 無引数で呼ばれた場合、ヘルプを表示する
      this.cmd_help({ name: "help", args: { _: [] } });
    } else {
      const subcmd = this.options.subcmd;
      const cmd = this.subcmds.find((sc: Subcmd) => sc.name === subcmd.name);
      if (cmd !== undefined) {
        const status = await cmd.func(subcmd);
        if (!status) {
          // コマンドの実行に失敗した場合、プロセスを終了する
          Deno.exit(1);
        }
      } else {
        // サブコマンドが見つからない場合、プロセスを終了する
        console.log(bold(red("Err: subcmd not found")));
        Deno.exit(1);
      }
    }
  }

  private async cmd_base(
    _: SubcmdOptions,
    func: "stat" | "sync" | "list",
  ): Promise<boolean> {
    // statとlist, syncは性質が似ているため、処理を共通化している

    const exit_status: { name: string; is_failed: boolean }[] = [];
    for (const s of this.plugins) {
      const command = s[func];
      if (command != undefined) {
        console.log(inverse(blue(bold(s.info.name.toUpperCase()))));
        const is_failed = !(await command.bind(s)());
        console.log()
        exit_status.push({ name: s.info.name, is_failed: is_failed });
      }
    }

    const noerr = exit_status.filter((s) => s.is_failed).length === 0;
    if (noerr) {
      console.log(bold(green("✔  NO Error was detected")));
      return true;
    } else {
      console.log(bold(red("✘  Error was detected")));
      exit_status.forEach((s) => {
        if (s.is_failed) {
          console.log(`・${s.name}`);
        }
      });
      return false;
    }
  }

  private cmd_help(_: SubcmdOptions): boolean {
    // ヘルプ

    const p = console.log;
    p(inverse(yellow(bold(`dfm(3) ${version}`))));
    p("	A dotfiles manager written in deno (typescript)\n");
    p(inverse(yellow(bold("USAGE:"))));
    p("	deno run -A [filename] [SUBCOMMANDS]\n");
    p(inverse(yellow(bold("SUBCOMMANDS:"))));
    this.subcmds.forEach((c) => {
      console.log(`	${green(c.name)}	${c.info}`);
    });
    return true;
  }
}

function parse_argment(args: typeof Deno.args): Options {
  // コマンドライン引数を解析

  const parsedargs = parse(args);

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
    subcmd: subcmd,
  };
}

