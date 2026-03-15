/**
 * MappingRegistry — merges built-in icon/echelon definitions with user-defined
 * overrides and compiles them into ready-to-match pattern lists.
 *
 * Consumers obtain a default instance via {@link defaultRegistry} and can
 * optionally call mutation methods to layer user-defined mappings on top.
 */

import {
  BUILTIN_ICON_DEFINITIONS,
  ICON_UNSPECIFIED,
  type IconDefinition,
} from "./iconRegistry";
import {
  BUILTIN_ECHELON_DEFINITIONS,
  ECHELON_UNSPECIFIED,
  type EchelonDefinition,
} from "./echelonRegistry";

// ---------------------------------------------------------------------------
// Compiled pattern type (what the matcher loops over)
// ---------------------------------------------------------------------------

export interface CompiledPattern {
  pattern: RegExp;
  name: string;
  code: string;
  label: string;
  /** Symbol set override from the definition (e.g. "30" for sea surface). */
  symbolSet?: string;
  /** Whether this entry came from aliases or an explicit regex pattern. */
  sourceType: "alias" | "pattern";
}

// ---------------------------------------------------------------------------
// User-defined mapping types (for persistence / serialisation)
// ---------------------------------------------------------------------------

export interface UserIconMapping {
  /** 10-character SIDC entity code */
  code: string;
  /** Human-readable label */
  label: string;
  /** Case-insensitive keyword aliases */
  aliases: string[];
  /** Where to insert. Default: prepend (user mappings win) */
  position?: { placement: "before" | "after"; referenceCode: string } | "prepend";
}

export interface UserMappingData {
  /** Extra aliases for existing built-in icons */
  iconExtensions?: { code: string; extraAliases: string[] }[];
  /** Completely new icon mappings */
  iconAdditions?: UserIconMapping[];
  /** Extra aliases for existing echelons */
  echelonExtensions?: { code: string; extraAliases: string[] }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compile a definition's aliases + raw patterns into `CompiledPattern[]`. */
function compileDefinition(
  def: Pick<
    IconDefinition | EchelonDefinition,
    "name" | "code" | "label" | "aliases" | "patterns"
  > & { symbolSet?: string },
): CompiledPattern[] {
  const result: CompiledPattern[] = [];
  const symbolSet = def.symbolSet;

  // Aliases → single case-insensitive regex
  if (def.aliases && def.aliases.length > 0) {
    const joined = def.aliases.join("|");
    result.push({
      pattern: new RegExp(`\\b(${joined})\\b`, "i"),
      name: def.name,
      code: def.code,
      label: def.label,
      sourceType: "alias",
      ...(symbolSet && { symbolSet }),
    });
  }

  // Raw patterns pass through as-is (for case-sensitive matches etc.)
  if (def.patterns) {
    for (const p of def.patterns) {
      result.push({
        pattern: p,
        name: def.name,
        code: def.code,
        label: def.label,
        sourceType: "pattern",
        ...(symbolSet && { symbolSet }),
      });
    }
  }

  return result;
}

function compileDefinitions(
  defs: (IconDefinition | EchelonDefinition)[],
): CompiledPattern[] {
  return defs.flatMap(compileDefinition);
}

// ---------------------------------------------------------------------------
// MappingRegistry class
// ---------------------------------------------------------------------------

export class MappingRegistry {
  private _iconDefs: IconDefinition[];
  private _echelonDefs: EchelonDefinition[];

  // Cached compiled patterns (invalidated on mutation)
  private _iconPatterns: CompiledPattern[] | null = null;
  private _echelonPatterns: CompiledPattern[] | null = null;
  private _concatenatedSuffixes: string[] | null = null;
  private _iconCodeToName: Record<string, string> | null = null;
  private _echelonCodeToName: Record<string, string> | null = null;

  constructor(
    builtInIcons: IconDefinition[] = BUILTIN_ICON_DEFINITIONS,
    builtInEchelons: EchelonDefinition[] = BUILTIN_ECHELON_DEFINITIONS,
  ) {
    // Deep-clone so mutations don't affect the originals
    this._iconDefs = builtInIcons.map((d) => ({ ...d }));
    this._echelonDefs = builtInEchelons.map((d) => ({ ...d }));
  }

  // ── Getters (lazy-compiled, cached) ──────────────────────────────

  get iconPatterns(): CompiledPattern[] {
    if (!this._iconPatterns) {
      this._iconPatterns = compileDefinitions(this._iconDefs);
    }
    return this._iconPatterns;
  }

  get echelonPatterns(): CompiledPattern[] {
    if (!this._echelonPatterns) {
      this._echelonPatterns = compileDefinitions(this._echelonDefs);
    }
    return this._echelonPatterns;
  }

  get iconCodeToName(): Record<string, string> {
    if (!this._iconCodeToName) {
      const map: Record<string, string> = {};
      for (const d of this._iconDefs) {
        if (!(d.code in map)) map[d.code] = d.name;
      }
      map[ICON_UNSPECIFIED] = "ICON_UNSPECIFIED";
      this._iconCodeToName = map;
    }
    return this._iconCodeToName;
  }

  get echelonCodeToName(): Record<string, string> {
    if (!this._echelonCodeToName) {
      const map: Record<string, string> = {};
      for (const d of this._echelonDefs) {
        if (!(d.code in map)) map[d.code] = d.name;
      }
      map[ECHELON_UNSPECIFIED] = "ECHELON_UNSPECIFIED";
      this._echelonCodeToName = map;
    }
    return this._echelonCodeToName;
  }

  /** Echelon hierarchy in order from largest to smallest. */
  get echelonHierarchy(): string[] {
    // Deduplicate by code while preserving order
    const seen = new Set<string>();
    return this._echelonDefs
      .map((d) => d.code)
      .filter((c) => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      });
  }

  /** Concatenated suffixes derived from echelon definitions. */
  get concatenatedSuffixes(): string[] {
    if (!this._concatenatedSuffixes) {
      this._concatenatedSuffixes = this._echelonDefs.flatMap(
        (d) => d.concatenatedSuffixes ?? [],
      );
    }
    return this._concatenatedSuffixes;
  }

  // ── Mutation methods ─────────────────────────────────────────────

  /** Add extra aliases to an existing built-in icon by code. */
  extendIcon(code: string, extraAliases: string[]): void {
    for (const def of this._iconDefs) {
      if (def.code === code) {
        def.aliases = [...(def.aliases ?? []), ...extraAliases];
        break;
      }
    }
    this.invalidateIconCache();
  }

  /** Add a completely new icon mapping. */
  addIcon(def: IconDefinition, position?: UserIconMapping["position"]): void {
    if (position && position !== "prepend") {
      const idx = this._iconDefs.findIndex((d) => d.code === position.referenceCode);
      if (idx !== -1) {
        const insertAt = position.placement === "before" ? idx : idx + 1;
        this._iconDefs.splice(insertAt, 0, { ...def });
        this.invalidateIconCache();
        return;
      }
    }
    // Default: prepend so user mappings take priority
    this._iconDefs.unshift({ ...def });
    this.invalidateIconCache();
  }

  /** Add extra aliases to an existing echelon by code. */
  extendEchelon(code: string, extraAliases: string[]): void {
    for (const def of this._echelonDefs) {
      if (def.code === code) {
        def.aliases = [...(def.aliases ?? []), ...extraAliases];
        break;
      }
    }
    this.invalidateEchelonCache();
  }

  // ── Serialisation ────────────────────────────────────────────────

  /** Export user-defined additions for persistence (e.g. to IndexedDB). */
  exportUserMappings(): UserMappingData {
    // For now, return an empty object. This will be populated
    // when user-override tracking is added.
    return {};
  }

  /** Import previously saved user mappings. */
  importUserMappings(data: UserMappingData): void {
    if (data.iconExtensions) {
      for (const ext of data.iconExtensions) {
        this.extendIcon(ext.code, ext.extraAliases);
      }
    }
    if (data.iconAdditions) {
      for (const add of data.iconAdditions) {
        this.addIcon(
          { name: add.label.toUpperCase().replace(/\s+/g, "_"), ...add },
          add.position,
        );
      }
    }
    if (data.echelonExtensions) {
      for (const ext of data.echelonExtensions) {
        this.extendEchelon(ext.code, ext.extraAliases);
      }
    }
  }

  // ── Private ──────────────────────────────────────────────────────

  private invalidateIconCache(): void {
    this._iconPatterns = null;
    this._iconCodeToName = null;
  }

  private invalidateEchelonCache(): void {
    this._echelonPatterns = null;
    this._echelonCodeToName = null;
    this._concatenatedSuffixes = null;
  }
}

// ---------------------------------------------------------------------------
// Default instance (used when no custom registry is provided)
// ---------------------------------------------------------------------------

export const defaultRegistry = new MappingRegistry();
