/** The control measure package's `echelon` option value → SIDC echelon code. */
export const ECHELON_CODE_BY_VALUE: Readonly<Record<string, string>> = {
  none: "00",
  team: "11",
  squad: "12",
  section: "13",
  platoon: "14",
  company: "15",
  battalion: "16",
  regiment: "17",
  brigade: "18",
  division: "21",
  corps: "22",
  army: "23",
  "army-group": "24",
  region: "25",
  command: "26",
};

const ECHELON_VALUE_BY_CODE = new Map(
  Object.entries(ECHELON_CODE_BY_VALUE).map(([value, code]) => [code, value]),
);

/** SIDC echelon code → the package's `echelon` option value, if any. */
export function controlMeasureEchelonValue(code: string): string | undefined {
  return ECHELON_VALUE_BY_CODE.get(code);
}
