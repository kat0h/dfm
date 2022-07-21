import { parse } from "./deps.ts";

export interface Plugin {
  info: PluginInfo;
  // souces must returns exit status
  // if the process failed, the function returns false
  stat?: () => boolean | Promise<boolean>;
  list?: () => boolean | Promise<boolean>;
  sync?: () => boolean | Promise<boolean>;
  subcmd?: (options: SubcmdOptions) => boolean | Promise<boolean>;
}

export interface PluginInfo {
  name: string;
  subcmd?: {
    info: string;
  };
}

export type Subcmd = {
  name: string;
  info: string;
  func: (options: SubcmdOptions) => boolean | Promise<boolean>;
};

export interface Options {
  subcmd?: SubcmdOptions;
}

export interface SubcmdOptions {
  name: string;
  args: ReturnType<typeof parse>;
}
