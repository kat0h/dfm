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
    name: string;
    info: string;
  };
}

export type Subcmd = {
  name: string;
  info: string;
  func: (options: SubcmdOptions) => boolean | Promise<boolean>;
};

export interface DfmOptions {
  subcmdOptions?: SubcmdOptions;
}

export interface SubcmdOptions {
  name: string;
  args: typeof Deno.args;
}
