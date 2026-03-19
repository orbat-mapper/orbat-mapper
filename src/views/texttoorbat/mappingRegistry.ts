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
// Serialisable mapping snapshot
// ---------------------------------------------------------------------------

/** Serialisable snapshot of all icon and echelon definitions. */
export interface AllMappingData {
  icons: { code: string; label: string; aliases: string[]; symbolSet?: string }[];
  echelons: { code: string; label: string; aliases: string[] }[];
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

  // Monotonically increasing version for reactive consumers
  private _version = 0;

  // Cached compiled patterns (invalidated on mutation)
  private _iconPatterns: CompiledPattern[] | null = null;
  private _echelonPatterns: CompiledPattern[] | null = null;
  private _concatenatedSuffixes: string[] | null = null;
  private _iconCodeToName: Record<string, string> | null = null;
  private _echelonCodeToName: Record<string, string> | null = null;

  constructor(
    private _builtInIcons: IconDefinition[] = BUILTIN_ICON_DEFINITIONS,
    private _builtInEchelons: EchelonDefinition[] = BUILTIN_ECHELON_DEFINITIONS,
  ) {
    // Deep-clone so mutations don't affect the originals
    this._iconDefs = _builtInIcons.map((d) => ({ ...d }));
    this._echelonDefs = _builtInEchelons.map((d) => ({ ...d }));
  }

  // ── Getters (lazy-compiled, cached) ──────────────────────────────

  /** Current icon definitions. Read-only snapshot. */
  get iconDefinitions(): readonly IconDefinition[] {
    return this._iconDefs;
  }

  /** Current echelon definitions. Read-only snapshot. */
  get echelonDefinitions(): readonly EchelonDefinition[] {
    return this._echelonDefs;
  }

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

  /** Monotonically increasing version — use in Vue reactivity to trigger recomputation. */
  get version(): number {
    return this._version;
  }

  // ── Mutation methods ─────────────────────────────────────────────

  /** Add extra aliases to an existing icon by code. */
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
  addIcon(def: IconDefinition, position?: "prepend"): void {
    if (!position || position === "prepend") {
      this._iconDefs.unshift({ ...def });
    }
    this.invalidateIconCache();
  }

  /** Remove an alias from icon definitions matching the given code. */
  removeIconAlias(code: string, alias: string): void {
    for (const def of this._iconDefs) {
      if (def.code === code && def.aliases) {
        def.aliases = def.aliases.filter((a) => a !== alias);
      }
    }
    this.invalidateIconCache();
  }

  /** Remove a raw pattern from icon definitions matching the given code. */
  removeIconPattern(code: string, patternSource: string): void {
    for (const def of this._iconDefs) {
      if (def.code === code && def.patterns) {
        def.patterns = def.patterns.filter((p) => p.source !== patternSource);
        if (def.patterns.length === 0) def.patterns = undefined;
      }
    }
    this.invalidateIconCache();
  }

  /** Remove an alias from echelon definitions matching the given code. */
  removeEchelonAlias(code: string, alias: string): void {
    for (const def of this._echelonDefs) {
      if (def.code === code && def.aliases) {
        def.aliases = def.aliases.filter((a) => a !== alias);
      }
    }
    this.invalidateEchelonCache();
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

  /** Reset to built-in defaults, discarding all customizations. */
  resetToDefaults(): void {
    this._iconDefs = this._builtInIcons.map((d) => ({ ...d }));
    this._echelonDefs = this._builtInEchelons.map((d) => ({ ...d }));
    this.invalidateIconCache();
    this.invalidateEchelonCache();
  }

  // ── Serialisation ────────────────────────────────────────────────

  /** Export all icon and echelon definitions as a flat snapshot. */
  exportMappings(): AllMappingData {
    // Deduplicate icons by grouping aliases per (code + symbolSet) pair
    const iconGroups = new Map<string, AllMappingData["icons"][0]>();
    for (const def of this._iconDefs) {
      const key = `${def.symbolSet ?? "10"}:${def.code}`;
      const existing = iconGroups.get(key);
      if (existing) {
        const seen = new Set(existing.aliases);
        for (const a of def.aliases ?? []) {
          if (!seen.has(a)) {
            existing.aliases.push(a);
            seen.add(a);
          }
        }
      } else {
        iconGroups.set(key, {
          code: def.code,
          label: def.label,
          aliases: [...(def.aliases ?? [])],
          ...(def.symbolSet && { symbolSet: def.symbolSet }),
        });
      }
    }

    // Deduplicate echelons by code
    const echelonGroups = new Map<string, AllMappingData["echelons"][0]>();
    for (const def of this._echelonDefs) {
      const existing = echelonGroups.get(def.code);
      if (existing) {
        const seen = new Set(existing.aliases);
        for (const a of def.aliases ?? []) {
          if (!seen.has(a)) {
            existing.aliases.push(a);
            seen.add(a);
          }
        }
      } else {
        echelonGroups.set(def.code, {
          code: def.code,
          label: def.label,
          aliases: [...(def.aliases ?? [])],
        });
      }
    }

    return {
      icons: [...iconGroups.values()],
      echelons: [...echelonGroups.values()],
    };
  }

  /** Replace all definitions from a previously exported snapshot. */
  importMappings(data: AllMappingData): void {
    if (data.icons) {
      this._iconDefs = data.icons.map((d) => ({
        name: d.label.toUpperCase().replace(/\s+/g, "_"),
        code: d.code,
        label: d.label,
        aliases: [...d.aliases],
        ...(d.symbolSet && { symbolSet: d.symbolSet }),
      }));
    }
    if (data.echelons) {
      this._echelonDefs = data.echelons.map((d) => ({
        name: d.label.toUpperCase().replace(/\s+/g, "_"),
        code: d.code,
        label: d.label,
        aliases: [...d.aliases],
      }));
    }
    this.invalidateIconCache();
    this.invalidateEchelonCache();
  }

  // ── Private ──────────────────────────────────────────────────────

  private invalidateIconCache(): void {
    this._iconPatterns = null;
    this._iconCodeToName = null;
    this._version++;
  }

  private invalidateEchelonCache(): void {
    this._echelonPatterns = null;
    this._echelonCodeToName = null;
    this._concatenatedSuffixes = null;
    this._version++;
  }
}

// ---------------------------------------------------------------------------
// Default instance (used when no custom registry is provided)
// ---------------------------------------------------------------------------

export const defaultRegistry = new MappingRegistry();
