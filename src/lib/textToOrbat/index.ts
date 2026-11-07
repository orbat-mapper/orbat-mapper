/**
 * Text to ORBAT: turn indented unit names into a unit tree with MIL-STD-2525
 * symbols guessed from the names.
 *
 * ```ts
 * const engine = createTextToOrbat({ mappings: saved });
 * const tree = engine.parse("1st Armoured Division\n  7th Armoured Brigade");
 * const units = toUnits(tree); // { id, name, shortName?, description?, sidc, subUnits }
 * engine.mappings.subscribe(() => save(engine.mappings.exportMappings()));
 * ```
 *
 * This folder depends only on `nanoid` (and `@codemirror/*` for the optional
 * `./codemirror` entry), never on the host app, so it can be copied or
 * published as a package. Import from this file only; the other files are
 * internal.
 */

export {
  createTextToOrbat,
  type Classification,
  type ShortNameRewriteOptions,
  type TextToOrbat,
  type TextToOrbatOptions,
} from "./engine";
export {
  INDENT_SIZE,
  toUnits,
  unitsToText,
  type CommaFieldOrder,
  type OrbatUnit,
  type ParsedUnit,
  type ParseOptions,
  type TextUnit,
} from "./parser";
export { analyzeLine, type LineRange } from "./lineSyntax";
export type { ShortNameOptions } from "./shortNames";
export type { Suggestion } from "./suggestions";
export { createShortUnitName, type CreateShortUnitNameOptions } from "./shortUnitName";

// Mappings: the registry type, its serialised form and the built-in tables
export {
  parseMappingsFromXlsxWorkbook,
  type AllMappingData,
  type MappingRegistry,
} from "./mappingRegistry";
export {
  ICON_UNSPECIFIED,
  extractEntityCode,
  extractSymbolSet,
  type IconDefinition,
} from "./iconRegistry";
export {
  BUILTIN_ECHELON_DEFINITIONS,
  ECHELON_UNSPECIFIED,
  type EchelonDefinition,
} from "./echelonRegistry";
