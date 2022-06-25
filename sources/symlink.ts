import Manager from "../main.ts"
import { Source } from "../main.ts"

export default class Symlink implements Source {
  info = {
    name: "symlink",
    subcmd: {
      name: "sym",
      info: "symlink",
    }
  }
  // TODO: 実装
  setup(manager: Manager) {
    console.log(manager)
  }
  status() {
    console.log("symlink status\n")
    return true
  }
  update() {
    console.log("symlink update\n")
    return true
  }
  subcmd() {
    console.log(this.info)
    return false;
  }
}
