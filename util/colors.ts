import { colors } from "../deps.ts";
const isatty = Deno.isatty(Deno.stdout.rid);

const color_func = {
  "white": colors.white,
  "black": colors.black,
  "blue": colors.blue,
  "cyan": colors.cyan,
  "gray": colors.gray,
  "green": colors.green,
  "magenta": colors.magenta,
  "red": colors.red,
  "yellow": colors.yellow,
};
type Color = keyof typeof color_func;
export function clr(str: string, color: Color) {
  if (!isatty) {
    return str;
  } else {
    return color_func[color](str);
  }
}

const deco_func = {
  "bold": colors.bold,
  "italic": colors.italic,
};
type Deco = keyof typeof deco_func;
export function deco(str: string, deco: Deco) {
  if (!isatty) {
    return str;
  } else {
    return deco_func[deco](str);
  }
}
