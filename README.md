# dfm

![](https://user-images.githubusercontent.com/45391880/175961680-875ae156-41ce-417c-99f7-a3deaf1d0516.png)

Example:

```typescript
#!/usr/bin/env deno run -A
import Dfm from "https://deno.land/x/dfm/mod.ts";
import { CmdCheck, Symlink } from "https://deno.land/x/dfm/plugin/mod.ts";

const dfm = new Dfm();
const s = new Symlink({
  dotfiles_dir: "~/dotfiles",
});
const c = new CmdCheck();

s.link([
  ["zshrc", "~/.zshrc"],
  ["tmux.conf", "~/.tmux.conf"],
  ["vimrc", "~/.vimrc"],
  ["vim", "~/.vim"],
  ["config/alacritty", "~/.config/alacritty"],
]);

// コマンドの存在チェック
c.cmd([
  "vim",
  "nvim",
  "clang",
  "curl",
  "wget",
  "hoge",
]);

dfm.use(s);
dfm.use(c);
dfm.end();
```
