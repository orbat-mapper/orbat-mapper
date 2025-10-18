import type { SymbolValue } from "@/types/constants.ts";

export type SymbolFillColor = SymbolValue;

export const SYMBOL_FILL_COLORS: SymbolFillColor[] = [
  { code: "#80e0ff", text: "Blue (standard)" },
  { code: "#ff8080", text: "Red (standard)" },
  { code: "#aaffaa", text: "Green (standard)" },
  { code: "#ffff80", text: "Yellow (standard)" },
  { code: "#ffa1ff", text: "Pink (civilian)" },
  { code: "#aab074", text: "Olive" },
  { code: "#5baa5b", text: "Infantry (Battle Order)" },
  { code: "#ffd00b", text: "Armor (Battle Order)" },
  { code: "#ff3333", text: "Artillery (Battle Order)" },
  { code: "#f7f7f7", text: "Combat Support (Battle Order)" },
  { code: "#d87600", text: "Service Support (Battle Order)" },
  { code: "#a2e3e8", text: "Aviation (Battle Order)" },
];
