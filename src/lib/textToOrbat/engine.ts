import { MappingRegistry, type AllMappingData } from "./mappingRegistry";
import {
  buildIconSidc,
  extractEntityCode,
  extractSymbolSet,
  ICON_UNSPECIFIED,
} from "./iconRegistry";
import { ECHELON_UNSPECIFIED } from "./echelonRegistry";
import {
  getEchelonFromSidc,
  inferSymbol,
  parseTextToUnits,
  toUnits,
  type ParsedUnit,
  type ParseOptions,
} from "./parser";
import {
  applyUnitFieldsToText,
  clearAllShortNames,
  generateMissingShortNames,
  type ShortNameOptions,
} from "./shortNames";
import { buildRegistrySuggestions, type Suggestion } from "./suggestions";

export interface TextToOrbatOptions {
  /**
   * Mappings to start from instead of the built-in ones, as saved from
   * `engine.mappings.exportMappings()`. Throws if they cannot be read.
   */
  mappings?: AllMappingData | null;
}

/** What the mappings make of a single name. */
export interface Classification {
  /** The SIDC a root unit with this name gets. */
  sidc: string;
  /** The echelon the name matched, if any. */
  echelon: { code: string; label: string } | null;
  /** The icon the name matched, if any. `sidc` is the 20-char template. */
  icon: { sidc: string; entityCode: string; label: string } | null;
}

export interface ShortNameRewriteOptions extends ParseOptions {
  shortNames?: ShortNameOptions;
}

export interface TextToOrbat {
  /**
   * The icon and echelon mappings this engine matches against. Edit them in
   * place; every other method sees the change at once. Use
   * `mappings.subscribe()` to persist or re-render.
   */
  readonly mappings: MappingRegistry;

  /** Parse indented text into a unit tree with inferred SIDCs. */
  parse(text: string, options?: ParseOptions): ParsedUnit[];

  /** Match a single name, for instance a unit name or a spreadsheet cell. */
  classify(name: string, options?: Omit<ParseOptions, "fields">): Classification;

  /** Human-readable echelon and icon labels for a SIDC, when known. */
  describe(sidc: string): { echelon?: string; icon?: string };

  /**
   * Generate missing short names, or clear all of them, and write the result
   * back into `text`. Changed lines use `name,shortName,description` order and
   * keep their indentation, metadata and comment; other lines are untouched.
   * Parse the returned text with that field order.
   */
  rewriteShortNames(
    text: string,
    action: "generate" | "clear",
    options?: ShortNameRewriteOptions,
  ): { text: string; changedCount: number };

  /** Words the mappings recognise, for autocompletion. */
  suggestions(): readonly Suggestion[];
}

/**
 * Create a text-to-ORBAT engine with its own mappings. Engines share no
 * state, so an app can hold one per document or one for the whole app.
 */
export function createTextToOrbat(options: TextToOrbatOptions = {}): TextToOrbat {
  const mappings = new MappingRegistry();
  if (options.mappings) {
    mappings.importMappings(options.mappings);
    mappings.clearUndoRedoStack();
  }

  let cachedSuggestions: { version: number; value: Suggestion[] } | null = null;

  return {
    mappings,

    parse(text, parseOptions) {
      return parseTextToUnits(text, mappings, parseOptions);
    },

    classify(name, classifyOptions = {}) {
      const {
        sidc,
        matchedEchelon: echelonCode,
        matchedIcon: iconSidc,
      } = inferSymbol({ level: 0, displayName: name, ...classifyOptions }, mappings);
      const entityCode = extractEntityCode(iconSidc);
      return {
        sidc,
        echelon:
          echelonCode === ECHELON_UNSPECIFIED
            ? null
            : {
                code: echelonCode,
                label: mappings.echelonCodeToName[echelonCode] ?? echelonCode,
              },
        icon:
          entityCode === ICON_UNSPECIFIED
            ? null
            : {
                sidc: iconSidc,
                entityCode,
                label: mappings.iconCodeToName[iconSidc] ?? entityCode,
              },
      };
    },

    describe(sidc) {
      const iconTemplate = buildIconSidc(extractEntityCode(sidc), extractSymbolSet(sidc));
      return {
        echelon: mappings.echelonCodeToName[getEchelonFromSidc(sidc)],
        icon: mappings.iconCodeToName[iconTemplate],
      };
    },

    rewriteShortNames(text, action, rewriteOptions = {}) {
      const { shortNames, ...parseOptions } = rewriteOptions;
      const original = toUnits(parseTextToUnits(text, mappings, parseOptions));
      const updated =
        action === "generate"
          ? generateMissingShortNames(original, shortNames).units
          : clearAllShortNames(original);
      const result = applyUnitFieldsToText(text, original, updated);
      return { text: result.text, changedCount: result.updatedCount };
    },

    suggestions() {
      if (cachedSuggestions?.version !== mappings.version) {
        cachedSuggestions = {
          version: mappings.version,
          value: buildRegistrySuggestions(mappings),
        };
      }
      return cachedSuggestions.value;
    },
  };
}
