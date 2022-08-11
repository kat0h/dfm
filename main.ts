import { colors } from "./deps.ts";
import { DfmOptions, Plugin, Subcmd, SubcmdOptions } from "./types.ts";
import { isatty, resolvePath } from "./util/util.ts";
const { blue, bold, green, red, yellow, setColorEnabled, inverse } = colors;

const version = "v0.3";

export default class Dfm {
  private options: DfmOptions;
  private plugins: Plugin[] = [];
  private subcmds: Subcmd[];

  dfmFilePath: string;
  dotfilesDir: string;

  constructor(options: {
    dotfilesDir: string;
    dfmFilePath: string;
  }) {
    this.dfmFilePath = resolvePath(options.dfmFilePath);
    this.dotfilesDir = resolvePath(options.dotfilesDir);

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
            console.log(`・ ${plugin.name}`);
          });
          console.log();
          return this.cmd_base.bind(this)(options, "list");
        },
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
        func: this.cmd_help.bind(this),
      },
    ];
  }

  use(...plugins: Plugin[]) {
    // プラグインを登録する

    plugins.forEach((plugin) => {
      this.plugins.push(plugin);
      if (plugin.subcmds !== undefined) {
        plugin.subcmds.forEach((subcmd) => {
          this.subcmds.push({
            name: subcmd.name,
            info: subcmd.info,
            func: subcmd.func.bind(plugin),
          });
        });
      }
    });
  }

  async end() {
    // コマンドを実行する

    // もし他のコマンドにパイプされていた場合、エスケープシーケンスを利用しない
    if (!isatty()) {
      setColorEnabled(false);
    }
    // サブコマンドを実行
    if (this.options.subcmdOptions === undefined) {
      // 無引数で呼ばれた場合、ヘルプを表示する
      this.cmd_help({ cmdName: "help", args: [] });
    } else {
      const subcmd = this.options.subcmdOptions;
      const cmd = this.subcmds.find((sc: Subcmd) => sc.name === subcmd.cmdName);
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
        console.log(inverse(blue(bold(s.name.toUpperCase()))));
        const is_failed = !(await command.bind(s)());
        console.log();
        exit_status.push({ name: s.name, is_failed: is_failed });
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

function parse_argment(args: typeof Deno.args): DfmOptions {
  // コマンドライン引数を解析

  let subcmdOptions: SubcmdOptions | undefined = undefined;
  if (args.length !== 0) {
    subcmdOptions = {
      cmdName: Deno.args[0],
      args: Deno.args.slice(1),
    };
  }

  return {
    subcmdOptions: subcmdOptions,
  };
}
