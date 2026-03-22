/**
 * MappingRegistry — merges built-in icon/echelon definitions with user-defined
 * overrides and compiles them into ready-to-match pattern lists.
 *
 * Consumers obtain a default instance via {@link defaultRegistry} and can
 * optionally call mutation methods to layer user-defined mappings on top.
 */

import {
  buildIconSidc,
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
  /** For icons: full 20-char template SIDC. For echelons: 2-char echelon code. */
  code: string;
  label: string;
  /** Whether this entry came from aliases or an explicit regex pattern. */
  sourceType: "alias" | "pattern";
}

// ---------------------------------------------------------------------------
// Serialisable mapping snapshot
// ---------------------------------------------------------------------------

/** A serialisable regex pattern: source + flags. */
interface SerializedPattern {
  source: string;
  flags: string;
}

/** Current export format version. */
const MAPPING_DATA_VERSION = 1;

/** Serialisable snapshot of all icon and echelon definitions. */
export interface AllMappingData {
  version?: number;
  icons: {
    sidc: string;
    label: string;
    aliases: string[];
    patterns?: SerializedPattern[];
    /** @deprecated old format fields, kept for migration */
    code?: string;
    symbolSet?: string;
  }[];
  echelons: {
    code: string;
    label: string;
    aliases: string[];
    patterns?: SerializedPattern[];
    concatenatedSuffixes?: string[];
  }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip Unicode combining marks so e.g. "é" → "e", "ô" → "o". */
export function normalizeInput(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const REGEX_ESCAPE = /[\\^$*+?{}[\]|]/g;

/**
 * Compile a plain-text alias into a regex source string.
 *
 * Mini-syntax (two rules):
 * - `(text)` → optional segment (`(?:text)?`)
 * - `.`      → optional literal dot (`\.?`)
 * - spaces   → flexible separator (`[\s.\-]*`)
 * - everything else is literal
 */
export function compileSimpleAlias(alias: string): string {
  const normalized = normalizeInput(alias.toLowerCase());
  let result = "";
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === "(") {
      // Collect content until closing paren
      const close = normalized.indexOf(")", i + 1);
      if (close === -1) {
        // No closing paren — treat as literal
        result += "\\(";
        i++;
      } else {
        const content = normalized.slice(i + 1, close);
        result += `(?:${content.replace(REGEX_ESCAPE, "\\$&")})?`;
        i = close + 1;
      }
    } else if (ch === ".") {
      result += "\\.?";
      i++;
    } else if (ch === " ") {
      result += "[\\s.\\-]*";
      i++;
    } else {
      result += ch.replace(REGEX_ESCAPE, "\\$&");
      i++;
    }
  }
  return result;
}

/** Compile a definition's aliases + raw patterns into `CompiledPattern[]`. */
function compileDefinition(
  def: Pick<IconDefinition | EchelonDefinition, "label" | "aliases" | "patterns">,
  code: string,
): CompiledPattern[] {
  const result: CompiledPattern[] = [];

  // Aliases → single case-insensitive regex
  if (def.aliases && def.aliases.length > 0) {
    const joined = def.aliases.map(compileSimpleAlias).join("|");
    result.push({
      pattern: new RegExp(`\\b(${joined})\\b`, "i"),
      code,
      label: def.label,
      sourceType: "alias",
    });
  }

  // Raw patterns pass through as-is (for case-sensitive matches etc.)
  if (def.patterns) {
    for (const p of def.patterns) {
      result.push({
        pattern: p,
        code,
        label: def.label,
        sourceType: "pattern",
      });
    }
  }

  return result;
}

function compileIconDefinitions(defs: IconDefinition[]): CompiledPattern[] {
  return defs.flatMap((d) => compileDefinition(d, d.sidc));
}

function compileEchelonDefinitions(defs: EchelonDefinition[]): CompiledPattern[] {
  return defs.flatMap((d) => compileDefinition(d, d.code));
}

// ---------------------------------------------------------------------------
// MappingRegistry class
// ---------------------------------------------------------------------------

interface RegistrySnapshot {
  iconDefs: IconDefinition[];
  echelonDefs: EchelonDefinition[];
}

function cloneDefs<T extends object>(defs: T[]): T[] {
  return defs.map((d) => ({ ...d }));
}

export class MappingRegistry {
  private _iconDefs: IconDefinition[];
  private _echelonDefs: EchelonDefinition[];

  // Monotonically increasing version for reactive consumers
  private _version = 0;

  // Undo/redo stacks (snapshots of definition arrays)
  private _undoStack: RegistrySnapshot[] = [];
  private _redoStack: RegistrySnapshot[] = [];
  private static readonly MAX_UNDO = 50;

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
      this._iconPatterns = compileIconDefinitions(this._iconDefs);
    }
    return this._iconPatterns;
  }

  get echelonPatterns(): CompiledPattern[] {
    if (!this._echelonPatterns) {
      this._echelonPatterns = compileEchelonDefinitions(this._echelonDefs);
    }
    return this._echelonPatterns;
  }

  get iconCodeToName(): Record<string, string> {
    if (!this._iconCodeToName) {
      const map: Record<string, string> = {};
      for (const d of this._iconDefs) {
        if (!(d.sidc in map)) map[d.sidc] = d.label;
      }
      map[ICON_UNSPECIFIED] = "Unspecified";
      this._iconCodeToName = map;
    }
    return this._iconCodeToName;
  }

  get echelonCodeToName(): Record<string, string> {
    if (!this._echelonCodeToName) {
      const map: Record<string, string> = {};
      for (const d of this._echelonDefs) {
        if (!(d.code in map)) map[d.code] = d.label;
      }
      map[ECHELON_UNSPECIFIED] = "Unspecified";
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

  // ── Undo / Redo ────────────────────────────────────────────────

  get canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  undo(): boolean {
    const snapshot = this._undoStack.pop();
    if (!snapshot) return false;
    this._redoStack.push({
      iconDefs: cloneDefs(this._iconDefs),
      echelonDefs: cloneDefs(this._echelonDefs),
    });
    this._iconDefs = snapshot.iconDefs;
    this._echelonDefs = snapshot.echelonDefs;
    this.invalidateAllCaches();
    return true;
  }

  redo(): boolean {
    const snapshot = this._redoStack.pop();
    if (!snapshot) return false;
    this._undoStack.push({
      iconDefs: cloneDefs(this._iconDefs),
      echelonDefs: cloneDefs(this._echelonDefs),
    });
    this._iconDefs = snapshot.iconDefs;
    this._echelonDefs = snapshot.echelonDefs;
    this.invalidateAllCaches();
    return true;
  }

  clearUndoRedoStack(): void {
    this._undoStack = [];
    this._redoStack = [];
  }

  /** Save a snapshot before a mutation so it can be undone. */
  private pushUndo(): void {
    this._undoStack.push({
      iconDefs: cloneDefs(this._iconDefs),
      echelonDefs: cloneDefs(this._echelonDefs),
    });
    if (this._undoStack.length > MappingRegistry.MAX_UNDO) {
      this._undoStack.shift();
    }
    this._redoStack = [];
  }

  // ── Mutation methods ─────────────────────────────────────────────

  /** Add extra aliases to an existing icon by SIDC. */
  extendIcon(sidc: string, extraAliases: string[]): void {
    this.pushUndo();
    for (const def of this._iconDefs) {
      if (def.sidc === sidc) {
        def.aliases = [...(def.aliases ?? []), ...extraAliases];
        break;
      }
    }
    this.invalidateIconCache();
  }

  /** Add a raw regex pattern to an existing icon by SIDC. */
  extendIconPattern(sidc: string, pattern: RegExp): void {
    this.pushUndo();
    for (const def of this._iconDefs) {
      if (def.sidc === sidc) {
        def.patterns = [...(def.patterns ?? []), pattern];
        break;
      }
    }
    this.invalidateIconCache();
  }

  /** Add a completely new icon mapping. */
  addIcon(def: IconDefinition, position?: "prepend"): void {
    this.pushUndo();
    if (!position || position === "prepend") {
      this._iconDefs.unshift({ ...def });
    }
    this.invalidateIconCache();
  }

  /** Remove an alias from icon definitions matching the given SIDC. */
  removeIconAlias(sidc: string, alias: string): void {
    this.pushUndo();
    for (const def of this._iconDefs) {
      if (def.sidc === sidc && def.aliases) {
        def.aliases = def.aliases.filter((a) => a !== alias);
      }
    }
    this.invalidateIconCache();
  }

  /** Remove a raw pattern from icon definitions matching the given SIDC. */
  removeIconPattern(sidc: string, patternSource: string): void {
    this.pushUndo();
    for (const def of this._iconDefs) {
      if (def.sidc === sidc && def.patterns) {
        def.patterns = def.patterns.filter((p) => p.source !== patternSource);
        if (def.patterns.length === 0) def.patterns = undefined;
      }
    }
    this.invalidateIconCache();
  }

  /** Move an icon definition from one index to another. */
  moveIconTo(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this._iconDefs.length) return;
    if (toIndex < 0 || toIndex >= this._iconDefs.length) return;
    this.pushUndo();
    const [item] = this._iconDefs.splice(fromIndex, 1);
    this._iconDefs.splice(toIndex, 0, item);
    this.invalidateIconCache();
  }

  /** Remove all icon definitions matching the given SIDC. */
  removeIcon(sidc: string): void {
    this.pushUndo();
    this._iconDefs = this._iconDefs.filter((d) => d.sidc !== sidc);
    this.invalidateIconCache();
  }

  /** Remove a single icon definition by array index. */
  removeIconAt(index: number): void {
    if (index < 0 || index >= this._iconDefs.length) return;
    this.pushUndo();
    this._iconDefs.splice(index, 1);
    this.invalidateIconCache();
  }

  /** Remove all echelon definitions matching the given code. */
  removeEchelon(code: string): void {
    this.pushUndo();
    this._echelonDefs = this._echelonDefs.filter((d) => d.code !== code);
    this.invalidateEchelonCache();
  }

  /** Clear all aliases and patterns from echelon definitions matching the given code. */
  clearEchelonAliases(code: string): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code) {
        def.aliases = [];
        def.patterns = [];
      }
    }
    this.invalidateEchelonCache();
  }

  /** Remove an alias from echelon definitions matching the given code. */
  removeEchelonAlias(code: string, alias: string): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code && def.aliases) {
        def.aliases = def.aliases.filter((a) => a !== alias);
      }
    }
    this.invalidateEchelonCache();
  }

  /** Update label (and optionally SIDC) for icon definitions matching the given SIDC. */
  updateIcon(sidc: string, updates: { label?: string; sidc?: string }): void {
    this.pushUndo();
    for (const def of this._iconDefs) {
      if (def.sidc === sidc) {
        if (updates.label !== undefined) def.label = updates.label;
        if (updates.sidc !== undefined) {
          def.sidc = updates.sidc;
        }
      }
    }
    this.invalidateIconCache();
  }

  /** Update label for echelon definitions matching the given code. */
  updateEchelon(code: string, updates: { label?: string }): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code) {
        if (updates.label !== undefined) def.label = updates.label;
      }
    }
    this.invalidateEchelonCache();
  }

  /** Add a concatenated suffix to an existing echelon by code. */
  addEchelonSuffix(code: string, suffix: string): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code) {
        def.concatenatedSuffixes = [...(def.concatenatedSuffixes ?? []), suffix];
        break;
      }
    }
    this.invalidateEchelonCache();
  }

  /** Remove a concatenated suffix from echelon definitions matching the given code. */
  removeEchelonSuffix(code: string, suffix: string): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code && def.concatenatedSuffixes) {
        def.concatenatedSuffixes = def.concatenatedSuffixes.filter((s) => s !== suffix);
        if (def.concatenatedSuffixes.length === 0) def.concatenatedSuffixes = undefined;
      }
    }
    this.invalidateEchelonCache();
  }

  /** Add a raw regex pattern to an existing echelon by code. */
  extendEchelonPattern(code: string, pattern: RegExp): void {
    this.pushUndo();
    for (const def of this._echelonDefs) {
      if (def.code === code) {
        def.patterns = [...(def.patterns ?? []), pattern];
        break;
      }
    }
    this.invalidateEchelonCache();
  }

  /** Add extra aliases to an existing echelon by code. */
  extendEchelon(code: string, extraAliases: string[]): void {
    this.pushUndo();
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
    this.pushUndo();
    this._iconDefs = this._builtInIcons.map((d) => ({ ...d }));
    this._echelonDefs = this._builtInEchelons.map((d) => ({ ...d }));
    this.invalidateIconCache();
    this.invalidateEchelonCache();
  }

  /** Reset only icon definitions to built-in defaults. */
  resetIconsToDefaults(): void {
    this.pushUndo();
    this._iconDefs = this._builtInIcons.map((d) => ({ ...d }));
    this.invalidateIconCache();
  }

  /** Reset only echelon definitions to built-in defaults. */
  resetEchelonsToDefaults(): void {
    this.pushUndo();
    this._echelonDefs = this._builtInEchelons.map((d) => ({ ...d }));
    this.invalidateEchelonCache();
  }

  // ── Serialisation ────────────────────────────────────────────────

  /** Export all icon and echelon definitions as a flat snapshot. */
  exportMappings(): AllMappingData {
    return {
      version: MAPPING_DATA_VERSION,
      icons: this._iconDefs.map((def) => ({
        sidc: def.sidc,
        label: def.label,
        aliases: [...(def.aliases ?? [])],
        ...(def.patterns &&
          def.patterns.length > 0 && {
            patterns: def.patterns.map((p) => ({ source: p.source, flags: p.flags })),
          }),
      })),
      echelons: this._echelonDefs.map((def) => ({
        code: def.code,
        label: def.label,
        aliases: [...(def.aliases ?? [])],
        ...(def.patterns &&
          def.patterns.length > 0 && {
            patterns: def.patterns.map((p) => ({ source: p.source, flags: p.flags })),
          }),
        ...(def.concatenatedSuffixes &&
          def.concatenatedSuffixes.length > 0 && {
            concatenatedSuffixes: [...def.concatenatedSuffixes],
          }),
      })),
    };
  }

  /** Replace all definitions from a previously exported snapshot. */
  importMappings(data: AllMappingData): void {
    this.pushUndo();
    if (data.icons) {
      this._iconDefs = data.icons.map((d) => {
        // Migrate old format (code + symbolSet) to new (sidc)
        const sidc =
          "sidc" in d && d.sidc
            ? d.sidc
            : buildIconSidc(d.code ?? "0000000000", d.symbolSet ?? "10");
        return {
          sidc,
          label: d.label,
          aliases: [...d.aliases],
          ...(d.patterns &&
            d.patterns.length > 0 && {
              patterns: d.patterns.map((p) => new RegExp(p.source, p.flags)),
            }),
        };
      });
    }
    if (data.echelons) {
      this._echelonDefs = data.echelons.map((d) => ({
        code: d.code,
        label: d.label,
        aliases: [...d.aliases],
        ...(d.patterns &&
          d.patterns.length > 0 && {
            patterns: d.patterns.map((p) => new RegExp(p.source, p.flags)),
          }),
        ...(d.concatenatedSuffixes &&
          d.concatenatedSuffixes.length > 0 && {
            concatenatedSuffixes: [...d.concatenatedSuffixes],
          }),
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

  private invalidateAllCaches(): void {
    this.invalidateIconCache();
    this.invalidateEchelonCache();
  }

  // ── XLSX serialisation ──────────────────────────────────────────

  /** Export icon definitions as flat row objects for `json_to_sheet`. */
  exportIconRows(): Record<string, string>[] {
    return this._iconDefs.map((def) => ({
      SIDC: def.sidc,
      Label: def.label,
      Aliases: (def.aliases ?? []).join(", "),
      Patterns:
        def.patterns && def.patterns.length > 0
          ? def.patterns
              .map((p) => (p.flags ? `${p.source}/${p.flags}` : p.source))
              .join(", ")
          : "",
    }));
  }

  /** Export echelon definitions as flat row objects for `json_to_sheet`. */
  exportEchelonRows(): Record<string, string>[] {
    return this._echelonDefs.map((def) => ({
      Code: def.code,
      Label: def.label,
      Aliases: (def.aliases ?? []).join(", "),
      Patterns:
        def.patterns && def.patterns.length > 0
          ? def.patterns
              .map((p) => (p.flags ? `${p.source}/${p.flags}` : p.source))
              .join(", ")
          : "",
      "Concatenated Suffixes":
        def.concatenatedSuffixes && def.concatenatedSuffixes.length > 0
          ? def.concatenatedSuffixes.join(", ")
          : "",
    }));
  }
}

// ---------------------------------------------------------------------------
// XLSX workbook → AllMappingData conversion
// ---------------------------------------------------------------------------

/** Split a comma-separated cell value into trimmed, non-empty strings. */
function splitCell(value: unknown): string[] {
  if (value == null || value === "") return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse a pattern string that may contain flags after a trailing `/`. */
function parsePatternString(raw: string): { source: string; flags: string } {
  const lastSlash = raw.lastIndexOf("/");
  if (lastSlash > 0 && /^[gimsuy]*$/.test(raw.slice(lastSlash + 1))) {
    return { source: raw.slice(0, lastSlash), flags: raw.slice(lastSlash + 1) };
  }
  return { source: raw, flags: "" };
}

/**
 * Convert an XLSX workbook (with "Icons" and "Echelons" sheets) into
 * the standard {@link AllMappingData} format that `importMappings()` accepts.
 */
export function parseMappingsFromXlsxWorkbook(
  workbook: { SheetNames: string[]; Sheets: Record<string, unknown> },
  sheetToJson: (sheet: unknown) => Record<string, unknown>[],
): AllMappingData {
  const data: AllMappingData = { version: MAPPING_DATA_VERSION, icons: [], echelons: [] };

  const iconsSheet = workbook.Sheets["Icons"];
  if (iconsSheet) {
    const rows = sheetToJson(iconsSheet);
    data.icons = rows
      .filter((r) => r["SIDC"] || r["Label"])
      .map((r) => {
        const aliases = splitCell(r["Aliases"]);
        const patternStrings = splitCell(r["Patterns"]);
        const patterns =
          patternStrings.length > 0
            ? patternStrings.map((s) => parsePatternString(s))
            : undefined;
        return {
          sidc: String(r["SIDC"] ?? ""),
          label: String(r["Label"] ?? ""),
          aliases,
          ...(patterns && { patterns }),
        };
      });
  }

  const echelonsSheet = workbook.Sheets["Echelons"];
  if (echelonsSheet) {
    const rows = sheetToJson(echelonsSheet);
    data.echelons = rows
      .filter((r) => r["Code"] || r["Label"])
      .map((r) => {
        const aliases = splitCell(r["Aliases"]);
        const patternStrings = splitCell(r["Patterns"]);
        const patterns =
          patternStrings.length > 0
            ? patternStrings.map((s) => parsePatternString(s))
            : undefined;
        const concatenatedSuffixes = splitCell(r["Concatenated Suffixes"]);
        return {
          code: String(r["Code"] ?? ""),
          label: String(r["Label"] ?? ""),
          aliases,
          ...(patterns && { patterns }),
          ...(concatenatedSuffixes.length > 0 && { concatenatedSuffixes }),
        };
      });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Default instance (used when no custom registry is provided)
// ---------------------------------------------------------------------------

export const defaultRegistry = new MappingRegistry();
