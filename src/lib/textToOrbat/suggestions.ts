/**
 * Suggestions: the words the registry recognises (labels, aliases, label
 * abbreviations and literal patterns), each with a SIDC for a preview symbol.
 */

import type { EchelonDefinition } from "./echelonRegistry";
import type { IconDefinition } from "./iconRegistry";
import type { MappingRegistry } from "./mappingRegistry";

export interface Suggestion {
  /** The text to insert. */
  label: string;
  /** The definition label, when it differs from `label`. */
  detail?: string;
  /** A friendly SIDC showing what the word maps to. */
  previewSidc: string;
  kind: "icon" | "echelon";
}

const FRIENDLY_SI = "3";
const DEFAULT_ICON_CODE = "1211000000";

export function normalizeSuggestionKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeAliasForSuggestion(alias: string) {
  const normalized = alias.replace(/[().]/g, "").replace(/\s+/g, " ").trim();
  return normalized || null;
}

function extractLabelAbbreviations(label: string) {
  return [...label.matchAll(/\(([^)]+)\)/g)].flatMap((match) =>
    match[1]
      .split("/")
      .map((part) => part.trim().toLowerCase())
      .filter((part) => /^[a-z][a-z0-9-]{1,}$/.test(part)),
  );
}

function extractLiteralPatternSuggestions(patterns?: RegExp[]) {
  if (!patterns) {
    return [];
  }

  return patterns.flatMap((pattern) => {
    const source = pattern.source;
    const caseInsensitive = pattern.flags.includes("i");
    const exactWordMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\\b$/);
    if (exactWordMatch) {
      return [caseInsensitive ? exactWordMatch[1].toLowerCase() : exactWordMatch[1]];
    }

    const lookaheadMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\(\?=/);
    if (lookaheadMatch) {
      return [caseInsensitive ? lookaheadMatch[1].toLowerCase() : lookaheadMatch[1]];
    }

    return [];
  });
}

function buildSuggestions<T extends IconDefinition | EchelonDefinition>(
  definitions: readonly T[],
  kind: Suggestion["kind"],
  getPreviewSidc: (definition: T) => string,
): Suggestion[] {
  const seen = new Set<string>();
  return definitions.flatMap((definition) => {
    const previewSidc = getPreviewSidc(definition);
    const defLabel = definition.label.trim();
    const values = [
      defLabel,
      ...extractLabelAbbreviations(definition.label),
      ...(definition.aliases ?? [])
        .map((alias) => normalizeAliasForSuggestion(alias))
        .filter((alias): alias is string => Boolean(alias)),
      ...extractLiteralPatternSuggestions(definition.patterns),
    ];

    return values.flatMap((value) => {
      const key = normalizeSuggestionKey(value);
      if (!value || seen.has(key)) {
        return [];
      }
      seen.add(key);
      return [
        {
          label: value,
          ...(value !== defLabel && { detail: defLabel }),
          previewSidc,
          kind,
        },
      ];
    });
  });
}

/** Icon words first, then echelon words; each word appears once per kind. */
export function buildRegistrySuggestions(registry: MappingRegistry): Suggestion[] {
  return [
    ...buildSuggestions(
      registry.iconDefinitions,
      "icon",
      ({ sidc }) => sidc.substring(0, 3) + FRIENDLY_SI + sidc.substring(4),
    ),
    ...buildSuggestions(
      registry.echelonDefinitions,
      "echelon",
      ({ code }) => `10031000${code}${DEFAULT_ICON_CODE}`,
    ),
  ];
}
