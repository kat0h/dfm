# dfm

<img src="https://user-images.githubusercontent.com/45391880/184128345-ab2ed635-c9e8-466e-b9a1-d8b0d05e68a7.png" width="50%">

Example: [My settings is here](https://github.com/kat0h/dotfiles/blob/master/bin/dot.ts)

```typescript
#!/usr/bin/env -S deno run -A
import Dfm from "https://deno.land/x/dfm/mod.ts";
import { Shell, Repository, Symlink } from "https://deno.land/x/dfm/plugin/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.149.0/path/mod.ts";
import { os } from "https://deno.land/x/dfm/util/mod.ts";

const dfm = new Dfm({
  dotfilesDir: "~/dotfiles",
  dfmFilePath: fromFileUrl(import.meta.url),
});

const links: [string, string][] = [
  ["zshrc", "~/.zshrc"],
  ["tmux.conf", "~/.tmux.conf"],
  ["vimrc", "~/.vimrc"],
  ["vim", "~/.vim"],
  ["config/alacritty", "~/.config/alacritty"],
];

const cmds: string[] = [
  "vim",
  "nvim",
  "clang",
  "curl",
  "wget",
];

let path: string[] = [
  "~/.deno/bin",
]

if (os() == "darwin") {
  path = path.concat([
    "~/mybin",
    "/usr/local/opt/ruby/bin"
  ])

} else if (os() == "linux") {
  path = path.concat([])
}


dfm.use(
  new Symlink(dfm, links),
  new Shell({
    env_path: "~/.cache/env",
    cmds: cmds,
    path: path
  }),
  new Repository(dfm),
);
dfm.end();
// vim:filetype=typescript
```

**WARNING** DFM is a experimental implementation based on my idea

DFM is a dotfiles manager framework written in deno. This library is based on a
new (?) design.

- not a command just library
- no DSL
- declarative setting (?)
- do not depends on your memory

I had the following complaints with my previous Dotfiles manager

- I always forget command arguments.
- It is difficult to learn complex DSLs.
- The installation is complicated and requires many dependencies.

Deno's dependency resolution system has solved these problems brilliantly.

A single file manages the configuration settings and the commands to execute.
Deno automatically resolves dependencies. Since all configuration settings are
written in Typescript, conditional branching by the OS can be easily described
in a familiar way.

```typescript
#!/usr/bin/env deno run -A
import Dfm from "https://deno.land/x/dfm/mod.ts";
import { fromFileUrl } from "https://deno.land/std/path/mod.ts";

const dfm = new Dfm({
  dotfilesDir: "~/dotfiles",
  dfmFilePath: fromFileUrl(import.meta.url),
});

dfm.end();
```

1. Import Dfm module from deno.land
2. make instance of Dfm manager
3. run command with `Dfm.prototype.end()`

Save the script as command.sh and run then you would get this help.

```
$ ./command.sh

dfm(3) v0.3
	A dotfiles manager written in deno (typescript)

USAGE:
	deno run -A [filename] [SUBCOMMANDS]

SUBCOMMANDS:
	stat	show status of settings
	list	show list of settings
	sync	apply settings
	help	show this help
```

As it is, it cannot be used as a Dotfiles manager. DFM provides the following
functions as plugins.

- symlink.ts
  - Paste the specified symbolic link starting from the path specified by the
    dotfilesDir option.
- cmdcheck.ts
  - Checks if the specified command exists in $PATH.
- repository.ts
  - It provides a subcommand that executes git commands starting from
    dotfilesDir, a dir command that outputs dotfilesDir, and an edit command
    that opens the configuration file itself in $EDITOR.

Please check the examples at the top of the page for specific usage.

## Command

Suppose the configuration file described above is placed as dfm in a directory
with $PATH.

```
$ dfm
$ dfm help    # Display help. All subcommands are listed here

$ dfm stat    # The stat() function implemented in Plugin is executed. For example, the Symlink Plugin checks if the link is properly posted and then calls the
$ dfm list    # The list of all loaded Plugins and the list() function implemented in the Plugin are called.
$ dfm sync    # Synchronizes the settings described in the configuration file with the actual PC; the sync() function implemented in the plugin is called
```

![](https://user-images.githubusercontent.com/45391880/181022336-b752eecf-4c1c-495d-98b0-8d0c96f6ae50.png)
If the configuration is correctly described, the `$ dfm list` command returns
output similar to the above.

## Utility functions

You can import these functions from `https://deno.land/x/dfm/util/mod.ts`

- `expandTilde()`
  - expand "~/"
- `resolvePath(path: string, basedir?: string)`
  - ~ $BASEDIR -> $HOME
  - ../ $BASEDIR -> $BASEDIR/../
  - ./ $BASEDIR -> $BASEDIR
  - a $BASEDIR -> $BASEDIR/a
  - ./hoge/hugo -> join($(pwd), "./hoge/hugo")
  - /hoge/hugo -> "/hoge/hugo"
  - ~/hoge -> "$HOME/hugo"
- `isatty()`
  - Same as isatty() in c language
- `os()`
  - Determines for which OS Deno was built

## Security

Deno imports and executes URLs described in the source code as is. While this
feature is convenient, it can easily lead to a supply chain attack if used
incorrectly, so care must be taken. In the case of `deno.land/x/`, since
deno.land guarantees that the source code returned by the URL with a version
number is immutable, you can ensure safety by specifying @ in the URL. In the
above example, the version number is not attached to the URL for the sake of
simplicity, but when actually using the URL, be sure to specify the version and
import it.

## Author

kotakato (@kat0h)

## License

MIT
