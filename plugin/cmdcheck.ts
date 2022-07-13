import { Source, SourceInfo } from "../main.ts";

export default class CmdCheck implements Source {
  info: SourceInfo = {
    name: "cmdcheck",
  };

  status() {
    console.log("CMDCHECK MODULE");
    return true;
  }
}
