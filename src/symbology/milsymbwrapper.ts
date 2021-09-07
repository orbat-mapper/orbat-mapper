/**
 * Custom milsymbol wrapper
 *
 */

import * as ms from "milsymbol";
import { Symbol as MilSymbol, SymbolOptions } from "milsymbol";

const customColorMode = ms.getColorMode("Light");
customColorMode.Friend = "rgb(170, 176, 116)";

const customIconColor = { ...ms.getColorMode("FrameColor") };
customIconColor.Friend = "rgb(65, 70, 22)";

const cm2 = ms.getColorMode("Light");
cm2.Friend = cm2.Hostile;

function replaceAt(text: string, index: number, replace: string) {
  return text.substring(0, index) + replace + text.substring(index + 1);
}

export function symbolGenerator(
  sidc: string,
  options: SymbolOptions = {}
): MilSymbol {
  let opts = options;
  if (sidc[3] === "7") {
    sidc = replaceAt(sidc, 3, "3");
    opts = {
      colorMode: { ...customColorMode },
      frameColor: { ...customIconColor },
      iconColor: { ...customIconColor },
      ...options,
    };
  } else if (sidc[3] === "8") {
    sidc = replaceAt(sidc, 3, "3");
    opts = { colorMode: cm2, ...options };
  }
  return new MilSymbol(sidc, opts);
}
