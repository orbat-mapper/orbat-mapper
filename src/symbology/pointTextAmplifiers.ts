import type { PointSymbol } from "@orbat-mapper/tactical-draw";
import { CONTROL_MEASURE_SYMBOLSET_VALUE } from "@/symbology/values";

/*
 * Ported from tactrace (src/symbology/pointTextAmplifiers.ts): which MIL-STD-2525E
 * text amplifier fields a point symbol takes, and how they reach milsymbol.
 */

export type TextAmplifierField =
  | "C"
  | "F"
  | "G"
  | "H"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "P"
  | "T"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "AA"
  | "AD"
  | "AE"
  | "AF"
  | "AM"
  | "AN"
  | "AP"
  | "AQ"
  | "AR"
  | "AS"
  | "AW"
  | "AX";
export type TextAmplifierKey = `${TextAmplifierField}${"" | "1" | "2"}`;
export type TextAmplifiers = Partial<Record<TextAmplifierKey, string>>;

/** SIDC positions 5-6, matching `Sidc`'s own parse. Inlined because both
 * callers below sit on a per-render path where a full parse is pure overhead. */
function symbolSetOf(sidc: string): string {
  return sidc.substring(4, 6) || "10";
}

/** A Text Amplifier key is a field code plus an optional `1`/`2` instance
 *  number. */
function splitTextAmplifierSuffix(key: string): {
  base: string;
  suffix: "" | "1" | "2";
} {
  const suffix = key.charAt(key.length - 1);
  return suffix === "1" || suffix === "2"
    ? { base: key.slice(0, -1), suffix }
    : { base: key, suffix: "" };
}

export interface PointTextAmplifierDescriptor {
  code: TextAmplifierKey;
  label: string;
  alias: string;
  sets: "all" | readonly string[];
}

/**
 * The renderable subset of MIL-STD-2525E Table VI. Applicability is copied
 * literally from the standard-facing crosswalk in docs.local: the anomalous
 * 8, 14 and 52 values and the blank V cell are intentionally not inferred.
 */
export const POINT_TEXT_AMPLIFIER_FIELDS = {
  C: {
    label: "Quantity",
    alias: "quantity",
    sets: ["10", "11", "15", "25", "27", "60"],
  },
  F: {
    label: "Reinforced or Reduced",
    alias: "reinforcedReduced",
    sets: ["10"],
  },
  G: {
    label: "Staff Comments",
    alias: "staffComments",
    sets: ["01", "05", "10", "15", "20", "27", "30", "35", "40"],
  },
  H: {
    label: "Additional Information",
    alias: "additionalInformation",
    sets: "all",
  },
  J: {
    label: "Evaluation Rating",
    alias: "evaluationRating",
    sets: ["10", "15", "20", "27", "40"],
  },
  K: {
    label: "Combat Effectiveness",
    alias: "combatEffectiveness",
    sets: ["10", "15", "27"],
  },
  L: {
    label: "Signature Equipment",
    alias: "signatureEquipment",
    sets: ["15"],
  },
  M: {
    label: "Higher Formation",
    alias: "higherFormation",
    sets: ["10"],
  },
  N: { label: "Hostile (Enemy)", alias: "hostile", sets: ["15", "25"] },
  P: {
    label: "IFF/SIF/AIS",
    alias: "iffSif",
    sets: ["01", "10", "15", "27", "30", "35"],
  },
  T: {
    label: "Unique Designation",
    alias: "uniqueDesignation",
    sets: "all",
  },
  // Table VI leaves V's applicability cell blank: it renders nowhere.
  V: { label: "Type", alias: "type", sets: [] },
  W: {
    label: "Date/Time Group",
    alias: "dtg",
    sets: ["10", "15", "20", "25", "27", "40", "45"],
  },
  X: { label: "Altitude/Depth", alias: "altitudeDepth", sets: ["14"] },
  Y: {
    label: "Location",
    alias: "location",
    sets: ["10", "15", "20", "25", "27", "30", "40"],
  },
  Z: { label: "Speed", alias: "speed", sets: ["8"] },
  AA: {
    label: "Special C2 Headquarters",
    alias: "specialHeadquarters",
    sets: ["10"],
  },
  AD: { label: "Platform Type", alias: "platformType", sets: ["10", "15"] },
  AE: {
    label: "Equipment Teardown Time",
    alias: "equipmentTeardownTime",
    sets: ["15", "52"],
  },
  AF: {
    label: "Common Identifier",
    alias: "commonIdentifier",
    sets: ["10", "15", "27"],
  },
  AM: { label: "Distance", alias: "distance", sets: ["25"] },
  AN: { label: "Azimuth", alias: "azimuth", sets: ["25"] },
  AP: { label: "Target Number", alias: "targetNumber", sets: ["25"] },
  AQ: { label: "Guarded Unit", alias: "guardedUnit", sets: ["30"] },
  AR: {
    label: "Special Designator",
    alias: "specialDesignator",
    sets: ["10", "30", "35"],
  },
  AS: { label: "Country", alias: "country", sets: "all" },
  AW: {
    label: "Headquarters Element",
    alias: "headquartersElement",
    sets: ["10"],
  },
  AX: {
    label: "Installation Composition",
    alias: "installationComposition",
    sets: ["20"],
  },
} as const satisfies Record<
  TextAmplifierField,
  Omit<PointTextAmplifierDescriptor, "code">
>;

// Entity-specific fields from milsymbol 3.0.4 numbersidc/labels/tactical-points.js,
// in its placement order. The action-point fields also follow the 2525E
// Action/Amnesty examples.
const ACTION_POINT_ENTITIES = new Set([
  "130100",
  "130200",
  "130300",
  "130800",
  "130900",
  "131001",
  "131002",
  "131003",
  "131100",
  "131200",
  "131400",
  "131500",
  "131600",
  "132200",
]);
const OTHER_C2_FIELDS: Readonly<Record<string, readonly TextAmplifierKey[]>> = {
  "130400": [],
  "130500": ["T"],
  "130600": [],
  "130700": ["T"],
  "131300": ["T"],
  "131301": [],
  "131700": [],
  "131800": ["T"],
  "131900": ["T"],
  "132000": ["T"],
  "132100": ["T"],
  "132300": ["H"],
};

/** SIDC positions 11-16. Sliced rather than parsed for the same reason as
 *  {@link symbolSetOf}: both sit on the per-render amplifier path. */
function entityOf(sidc: string): string {
  return sidc.substring(10, 16);
}

function commandControlPointFieldCodes(
  entity: string,
): readonly TextAmplifierKey[] | undefined {
  if (!ACTION_POINT_ENTITIES.has(entity)) return OTHER_C2_FIELDS[entity];
  return [
    "H",
    "W",
    "W1",
    "T",
    "N",
    ...(entity === "130100" ? (["H1"] as const) : []),
    ...(entity.startsWith("1310") ? [] : (["T1"] as const)),
  ];
}

/** Mine Warfare has no Table VI point layout of its own. */
const EXCLUDED_SYMBOL_SETS = new Set(["36"]);

// The applicable field list is a pure function of the symbol set over frozen
// tables, so it is computed at most once per set rather than per render — this
// runs on the capability's `resolveOptions` hook, ahead of its own render cache.
const fieldsBySymbolSet = new Map<string, readonly PointTextAmplifierDescriptor[]>();
// C2 point fields vary per entity rather than per set; `null` marks an entity with
// no entity-specific list, which falls back to the symbol-set table.
const c2FieldsByEntity = new Map<
  string,
  readonly PointTextAmplifierDescriptor[] | null
>();

/** A numbered key (`T1`) renders through its base field's metadata under the
 *  matching numbered milsymbol alias (`uniqueDesignation1`). */
function descriptorFor(code: TextAmplifierKey): PointTextAmplifierDescriptor {
  const { base, suffix } = splitTextAmplifierSuffix(code);
  const field = POINT_TEXT_AMPLIFIER_FIELDS[base as TextAmplifierField];
  return { ...field, code, alias: field.alias + suffix };
}

export function pointTextAmplifierFields(
  sidc: string,
): readonly PointTextAmplifierDescriptor[] {
  const symbolSet = symbolSetOf(sidc);
  if (symbolSet === CONTROL_MEASURE_SYMBOLSET_VALUE) {
    const entity = entityOf(sidc);
    let fields = c2FieldsByEntity.get(entity);
    if (fields === undefined) {
      fields = commandControlPointFieldCodes(entity)?.map(descriptorFor) ?? null;
      c2FieldsByEntity.set(entity, fields);
    }
    if (fields) return fields;
  }
  const memoized = fieldsBySymbolSet.get(symbolSet);
  if (memoized) return memoized;
  const fields: readonly PointTextAmplifierDescriptor[] = EXCLUDED_SYMBOL_SETS.has(
    symbolSet,
  )
    ? []
    : Object.entries(POINT_TEXT_AMPLIFIER_FIELDS).flatMap(([code, field]) =>
        field.sets === "all" || (field.sets as readonly string[]).includes(symbolSet)
          ? [{ code: code as TextAmplifierKey, ...field }]
          : [],
      );
  fieldsBySymbolSet.set(symbolSet, fields);
  return fields;
}

/** Local compatibility adapter for fields the current point-symbol package
 * does not yet translate into milsymbol options itself.
 *
 * Wired as the capability's `resolveOptions`, which the package calls *before*
 * its own render-cache lookup — so this runs on every render, hit or miss, and
 * on every hit test. The empty case therefore returns before parsing the SIDC. */
export function pointTextAmplifierMilsymbolOptions(
  symbol: Pick<PointSymbol, "sidc" | "textAmplifiers">,
): Record<string, unknown> | undefined {
  const values = symbol.textAmplifiers as TextAmplifiers | undefined;
  if (!values) return undefined;
  let options: Record<string, unknown> | undefined;
  for (const field of pointTextAmplifierFields(symbol.sidc)) {
    const value = values[field.code];
    if (value === undefined) continue;
    (options ??= {})[field.alias] = value;
  }
  return options;
}
