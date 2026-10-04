import {
  getControlMeasureMetadata,
  type ControlMeasureKind,
  type ControlMeasureStyle,
} from "@orbat-mapper/control-measures";
import type { MilXGraphic } from "./model";

/**
 * MSS free-format graphics (`GF9…`), keyed like `functionKey`. They carry no
 * standard code, so they bypass convert-symbology. Ellipses, pins and
 * polysectors have no Generic Graphic counterpart.
 */
export const GENERIC_KINDS: Record<
  string,
  { kind: ControlMeasureKind; options?: Record<string, unknown> }
> = {
  "G*9*LP": { kind: "line", options: { smooth: false } },
  "G*9*LB": { kind: "line", options: { smooth: true, smoothMode: "bezier" } },
  "G*9*AP": { kind: "polygon", options: { smooth: false } },
  "G*9*AB": { kind: "polygon", options: { smooth: true, smoothMode: "bezier" } },
  "G*9*AR": { kind: "rectangle" },
  "G*9*AC": { kind: "circle" },
  "G*9*T": { kind: "text" },
};

/** Delphi's named colors, e.g. `clRed`. */
const DELPHI_COLORS: Record<string, string> = {
  black: "#000000",
  maroon: "#800000",
  green: "#008000",
  olive: "#808000",
  navy: "#000080",
  purple: "#800080",
  teal: "#008080",
  gray: "#808080",
  silver: "#c0c0c0",
  red: "#ff0000",
  lime: "#00ff00",
  yellow: "#ffff00",
  blue: "#0000ff",
  fuchsia: "#ff00ff",
  aqua: "#00ffff",
  white: "#ffffff",
  ltgray: "#c0c0c0",
  dkgray: "#808080",
  moneygreen: "#c0dcc0",
  skyblue: "#a6caf0",
  cream: "#fffbf0",
  medgray: "#a4a0a0",
};

/** MSS colors are Delphi TColor values, `$00BBGGRR` or a name such as
 *  `clRed`. A non-zero high byte names a system or palette color, which has no
 *  fixed RGB. */
export function mssColor(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toLowerCase() ?? "";
  if (trimmed.startsWith("cl")) return DELPHI_COLORS[trimmed.slice(2)];
  const match = /^\$?00([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(trimmed);
  if (!match) return undefined;
  const [, blue, green, red] = match;
  return `#${red}${green}${blue}`;
}

/** MSS draws a free-format graphic without a line color in black. */
const DEFAULT_LINE_COLOR = "#000000";
/** A fill without a transparency renders half transparent in MSS. */
const DEFAULT_FILL_OPACITY = 0.5;

function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return alpha >= 255 ? hex : `${hex}${alpha.toString(16).padStart(2, "0")}`;
}

const RTF_SKIPPED = new Set(["fonttbl", "colortbl", "stylesheet", "info", "pict"]);
const RTF_ALIGN = { ql: "left", qc: "center", qr: "right" } as const;
/** The one-character fallback that follows a `\uN` Unicode character. */
const RTF_UNICODE_FALLBACK = /\\'[0-9a-f]{2}|[^\\{}]/iy;
const CP1252 = new TextDecoder("windows-1252");

/** The plain text and paragraph alignment of an MSS `XN` RTF text. Fonts,
 *  sizes and inline formatting are dropped. */
export function readRtf(rtf: string): {
  text: string;
  textAlign?: "left" | "center" | "right";
} {
  if (!rtf.trimStart().startsWith("{\\rtf")) return { text: rtf.trim() };
  let text = "";
  let textAlign: "left" | "center" | "right" | undefined;
  let depth = 0;
  let skipFrom = Infinity;
  const token =
    /\\(?:([a-z]+)(-?\d+)? ?|'([0-9a-f]{2})|([^a-z]))|([{}])|[\r\n]|([^\\{}\r\n]+)/giy;
  for (let match; (match = token.exec(rtf));) {
    const [, word, parameter, hex, symbol, brace, run] = match;
    if (brace === "{") depth++;
    else if (brace === "}") {
      if (depth === skipFrom) skipFrom = Infinity;
      depth--;
    } else if (depth >= skipFrom) continue;
    else if (run) text += run;
    else if (hex) text += CP1252.decode(new Uint8Array([Number.parseInt(hex, 16)]));
    // `\*` marks a destination a reader may ignore.
    else if (symbol === "*" || (word && RTF_SKIPPED.has(word))) skipFrom = depth;
    else if (symbol) text += symbol === "~" ? " " : "\\{}".includes(symbol) ? symbol : "";
    else if (word === "par" || word === "line") text += "\n";
    else if (word === "tab") text += "\t";
    else if (word && word in RTF_ALIGN)
      textAlign = RTF_ALIGN[word as keyof typeof RTF_ALIGN];
    else if (word === "u" && parameter) {
      const code = Number.parseInt(parameter, 10);
      text += String.fromCharCode(code < 0 ? code + 65536 : code);
      RTF_UNICODE_FALLBACK.lastIndex = token.lastIndex;
      if (RTF_UNICODE_FALLBACK.exec(rtf))
        token.lastIndex = RTF_UNICODE_FALLBACK.lastIndex;
    }
  }
  return {
    text: text
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim(),
    ...(textAlign ? { textAlign } : {}),
  };
}

/**
 * A free-format graphic's authored style and the options its style and text
 * set, or null when a text graphic has no text. A kind that paints no stroke
 * paints its text from the stroke channel, so it takes the text color there.
 */
export function genericAppearance(
  graphic: MilXGraphic,
  kind: ControlMeasureKind,
): { style: ControlMeasureStyle; options: Record<string, unknown> } | null {
  const { Line: line, Fill: fill = {}, Text: textStyle } = graphic.style;
  const { paints } = getControlMeasureMetadata(kind);
  const strokeColor =
    (paints.stroke ? undefined : mssColor(textStyle?.Color)) ??
    mssColor(line?.Color) ??
    DEFAULT_LINE_COLOR;
  // An explicit style wins; otherwise a fill color alone fills, as MSS does.
  const filled = fill.StyleEx ? fill.StyleEx === "bsSolidGS" : !!fill.Color;
  const transparency = Number.parseFloat(fill.Transparency ?? "");
  const fillColor = withOpacity(
    mssColor(fill.Color) ?? strokeColor,
    !filled
      ? 1
      : Number.isFinite(transparency)
        ? 1 - transparency / 100
        : DEFAULT_FILL_OPACITY,
  );
  const options: Record<string, unknown> = paints.fill === "user" ? { filled } : {};
  if (kind === "text") {
    const content = readRtf(graphic.text);
    if (!content.text) return null;
    Object.assign(options, content);
  }
  const style: ControlMeasureStyle = { color: strokeColor };
  if (paints.fill !== "none" && fillColor !== strokeColor) style.fillColor = fillColor;
  return { style, options };
}
