import Manager from "../main.ts"
import { Source } from "../main.ts"
import {
  bold,
  yellow,
} from "https://deno.land/std@0.145.0/fmt/colors.ts";

export default class Symlink implements Source {
  // links[n][0]: 実体 links[n][1]: シンボリックリンク
  private links: [string, string][] = []

  info = {
    name: "symlink",
  }

  setup(manager: Manager) {
    console.log(manager)
  }

  status() {
    console.log(bold(yellow("SYMLINK LIST:")))
    this.links.forEach((link) => {
      console.log(`${link[0]} ->	${link[1]}`)
    })
    console.log("")
    return true
  }

  update() {
    console.log("symlink update\n")
    return true
  }

  link(links: typeof this.links) {
    links.forEach((link) => {
      this.links.push(link)
    })
  }
}
