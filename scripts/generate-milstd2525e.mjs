/**
 * Generates src/symbology/standards/milstd2525e.ts from the `milstandard-e`
 * npm package (MIL-STD-2525 E / STANAG APP-6 E symbology data).
 *
 * The package ships the standard as TSV tables that it parses into plain JS
 * objects keyed by the raw column headers ("Entity", "First Modifier", ...).
 * This script maps those into the `SymbolSetMap` shape used by ORBAT Mapper
 * (see src/symbology/types.ts) and emits a formatted TypeScript module that
 * mirrors the layout of milstd2525.ts / app6d.ts.
 *
 * Run with:  node scripts/generate-milstd2525e.mjs
 * (or `pnpm gen:milstd2525e` if wired up in package.json)
 */

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { ms2525e } = require("milstandard-e");

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../src/symbology/standards/milstd2525e.ts");

/** Symbol-set keys to emit, in the order they should appear in the output. */
const SYMBOL_SET_ORDER = [
  "01", // Air
  "02", // Air missile
  "05", // Space
  "06", // Space missile
  "10", // Land unit
  "11", // Land civilian unit/organization
  "15", // Land equipment
  "20", // Land installations
  "25", // Control measure
  "27", // Dismounted individuals
  "30", // Sea surface
  "35", // Sea subsurface
  "36", // Mine warfare
  "40", // Activity/Event
  "50", // Signals Intelligence – Space
  "51", // Signals Intelligence – Air
  "52", // Signals Intelligence – Land
  "53", // Signals Intelligence – Surface
  "54", // Signals Intelligence – Subsurface
  "60", // Cyberspace
];

const trimmed = (value) => (typeof value === "string" ? value.trim() : value);
const nonEmpty = (value) => {
  const v = trimmed(value);
  return v ? v : undefined;
};

/** Placeholder rows for codes that have been retired from the standard. */
const isDisused = (value) => trimmed(value) === "{Disused}";

/** A main-icon row is disused when its most specific named level is "{Disused}". */
const mainIconDisused = (row) =>
  isDisused(row["Entity"]) ||
  isDisused(row["Entity Type"]) ||
  isDisused(row["Entity Subtype"]);

const modifierDisused = (row) =>
  isDisused(row["First Modifier"]) || isDisused(row["Second Modifier"]);

/** Map one parsed main-icon TSV row to a MainIconEntity. */
function mapMainIcon(row) {
  return {
    entity: trimmed(row["Entity"]) ?? "",
    entityType: nonEmpty(row["Entity Type"]),
    entitySubtype: nonEmpty(row["Entity Subtype"]),
    geometry: nonEmpty(row["Geometric Rendering"]),
    code: trimmed(row["Code"]) ?? "",
    remarks: nonEmpty(row["Remarks"]),
  };
}

/** Map one parsed modifier TSV row to a ModifierEntity. */
function mapModifier(row) {
  return {
    modifier: trimmed(row["First Modifier"] ?? row["Second Modifier"]) ?? "",
    category: nonEmpty(row["Category"]),
    code: trimmed(row["Code"]) ?? "",
    remarks: nonEmpty(row["Remarks"]),
  };
}

const common = ms2525e["common"] ?? { modifier1: [], modifier2: [] };

/** Build the list of set-specific modifiers, prefixed with an Unspecified entry. */
function buildModifiers(setRows, unspecifiedCode) {
  return [
    { modifier: "Unspecified", code: unspecifiedCode },
    ...setRows.filter((row) => !modifierDisused(row)).map(mapModifier),
  ];
}

function buildSymbolSet(key) {
  const src = ms2525e[key];
  if (!src) throw new Error(`Symbol set ${key} missing from milstandard-e data`);
  return {
    symbolSet: key,
    name: src.name,
    mainIcon: [
      { entity: "Unspecified", code: "000000" },
      ...src.mainIcon.filter((row) => !mainIconDisused(row)).map(mapMainIcon),
    ],
    modifierOne: buildModifiers(src.modifier1 ?? [], "00"),
    modifierTwo: buildModifiers(src.modifier2 ?? [], "00"),
  };
}

// The standard factors out modifiers that apply across every symbol set into a
// shared "common" table (codes 100+). Kept separate rather than merged into
// each set so consumers can apply them on top of the set-specific modifiers.
const commonModifiers = {
  modifierOne: (common.modifier1 ?? [])
    .filter((row) => !modifierDisused(row))
    .map(mapModifier),
  modifierTwo: (common.modifier2 ?? [])
    .filter((row) => !modifierDisused(row))
    .map(mapModifier),
};

// ---- Serialization -------------------------------------------------------
// Emit object literals with unquoted identifier keys and a fixed key order so
// the diff stays stable and matches the hand-written sibling files. We let
// Prettier handle final indentation/line wrapping.

const lit = (value) => JSON.stringify(value);

function obj(entries) {
  const parts = entries
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${lit(value)}`);
  return `{ ${parts.join(", ")} }`;
}

function serializeMainIcon(icon) {
  return obj([
    ["entity", icon.entity],
    ["entityType", icon.entityType],
    ["entitySubtype", icon.entitySubtype],
    ["geometry", icon.geometry],
    ["code", icon.code],
    ["remarks", icon.remarks],
  ]);
}

function serializeModifier(mod) {
  return obj([
    ["modifier", mod.modifier],
    ["category", mod.category],
    ["code", mod.code],
    ["remarks", mod.remarks],
  ]);
}

function serializeSet(set) {
  const mainIcon = set.mainIcon.map(serializeMainIcon).join(",\n");
  const modifierOne = set.modifierOne.map(serializeModifier).join(",\n");
  const modifierTwo = set.modifierTwo.map(serializeModifier).join(",\n");
  return [
    `${lit(set.symbolSet)}: {`,
    `symbolSet: ${lit(set.symbolSet)},`,
    `name: ${lit(set.name)},`,
    `mainIcon: [\n${mainIcon},\n],`,
    `modifierOne: [\n${modifierOne},\n],`,
    `modifierTwo: [\n${modifierTwo},\n],`,
    `}`,
  ].join("\n");
}

const header = `/**
 * MIL-STD-2525 E / STANAG APP-6 E symbology data
 *
 * Generated by scripts/generate-milstd2525e.mjs from the \`milstandard-e\`
 * npm package — do not edit by hand.
 *
 * Based on data from https://github.com/spatialillusions/milstandard-e
 *
 * MIT License
 * Copyright (c) 2017 Måns Beckman - www.spatialillusions.com
 *
 */

import type { ModifierEntity, SymbolSetMap } from "../types";

export const ms2525e: SymbolSetMap = {
`;

const body = SYMBOL_SET_ORDER.map(buildSymbolSet).map(serializeSet).join(",\n");

const commonOne = commonModifiers.modifierOne.map(serializeModifier).join(",\n");
const commonTwo = commonModifiers.modifierTwo.map(serializeModifier).join(",\n");
const commonBlock = `
/**
 * Modifiers shared across all symbol sets (codes 100+). Apply these on top of
 * a symbol set's own \`modifierOne\` / \`modifierTwo\` rather than in place of them.
 */
export const ms2525eCommonModifiers: {
  modifierOne: ModifierEntity[];
  modifierTwo: ModifierEntity[];
} = {
  modifierOne: [
${commonOne},
],
  modifierTwo: [
${commonTwo},
],
};
`;

const source = `${header}${body},\n};\n${commonBlock}`;

writeFileSync(OUT_FILE, source);

// Format with the repo's Prettier so the output matches the sibling files.
// `standards/` is listed in .prettierignore (these are generated data files),
// so bypass the ignore file to format this one explicitly.
try {
  execFileSync(
    "pnpm",
    ["exec", "prettier", "--write", "--ignore-path", "/dev/null", OUT_FILE],
    { stdio: "inherit" },
  );
} catch {
  console.warn("Prettier formatting skipped (run `pnpm format` manually).");
}

const setCount = SYMBOL_SET_ORDER.length;
console.log(`Wrote ${setCount} symbol sets to ${OUT_FILE}`);
