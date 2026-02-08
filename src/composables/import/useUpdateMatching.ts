import { computed, type Ref, type ComputedRef } from "vue";
import type { NUnit } from "@/types/internalModels";
import type { Position } from "geojson";
import type { UnitSymbolOptions } from "@/types/scenarioModels";
import { formatPosition } from "@/geo/utils";

import { setCharAt } from "@/components/helpers";

export type MatchMode = "id" | "name";

export interface MatchResult {
  rowIndex: number;
  row: Record<string, unknown>;
  existingUnit: NUnit | null;
  matchValue: string;
  matched: boolean;
  changes: Record<string, { old: unknown; new: unknown }>;
  mappedData: {
    id?: string;
    name?: string;
    shortName?: string;
    sidc?: string;
    description?: string;
    externalUrl?: string;
    _position?: Position;
    symbolOptions?: UnitSymbolOptions;
  };
}

export interface UpdateMatchingOptions {
  data: Ref<Record<string, unknown>[]> | ComputedRef<Record<string, unknown>[]>;
  mappedData: Ref<Record<string, unknown>[]> | ComputedRef<Record<string, unknown>[]>;
  matchMode: Ref<MatchMode>;
  matchField: Ref<string | null>;
  updateFields: Ref<string[]> | ComputedRef<string[]>;
  units: ComputedRef<NUnit[]>;
  unitMap: Record<string, NUnit>;
}

const UPDATABLE_FIELDS = [
  "name",
  "shortName",
  "sidc",
  "description",
  "externalUrl",
  "location",
] as const;

export type UpdatableField = (typeof UPDATABLE_FIELDS)[number];

export function getUpdatableFields(): readonly string[] {
  return UPDATABLE_FIELDS;
}

export function useUpdateMatching(options: UpdateMatchingOptions) {
  const { data, mappedData, matchMode, matchField, updateFields, units, unitMap } =
    options;

  // Build a name lookup map for efficient name matching
  const unitsByName = computed(() => {
    const map = new Map<string, NUnit>();
    for (const unit of units.value) {
      const lowerName = unit.name.toLowerCase().trim();
      // Only store the first match for each name (in case of duplicates)
      if (!map.has(lowerName)) {
        map.set(lowerName, unit);
      }
    }
    return map;
  });

  // Helper to compare positions
  function positionsEqual(pos1?: Position | null, pos2?: Position | null): boolean {
    if (!pos1 && !pos2) return true;
    if (!pos1 || !pos2) return false;
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  // Match imported rows to existing units
  const matchResults = computed<MatchResult[]>(() => {
    if (!matchField.value || !data.value.length) return [];

    return data.value.map((row, index) => {
      const matchValue = String(row[matchField.value!] ?? "").trim();
      let existingUnit: NUnit | null = null;

      if (matchValue) {
        if (matchMode.value === "id") {
          // Direct lookup by ID
          existingUnit = unitMap[matchValue] ?? null;
        } else {
          // Lookup by name (case-insensitive)
          existingUnit = unitsByName.value.get(matchValue.toLowerCase()) ?? null;
        }
      }

      // Get the mapped data for this row
      const mapped = (mappedData.value[index] ?? {}) as Record<string, unknown>;

      // Calculate changes if matched
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      if (existingUnit) {
        for (const field of updateFields.value) {
          if (field === "location") {
            // Special handling for location - compare positions
            const newPosition = mapped._position as Position | undefined;
            const oldPosition = existingUnit._state?.location;
            if (newPosition && !positionsEqual(newPosition, oldPosition)) {
              changes[field] = {
                old: formatPosition(oldPosition ?? undefined),
                new: formatPosition(newPosition),
              };
            }
          } else {
            let newValue = mapped[field];

            // Special handling for SIDC to preserve hierarchy/echelon if not specified in new value
            if (field === "sidc" && typeof newValue === "string") {
              const oldSidc = existingUnit.sidc;
              // Check if we have a valid 20-char SIDC to work with
              if (
                newValue.length === 20 &&
                oldSidc &&
                oldSidc.length === 20 &&
                /^\d+$/.test(newValue) &&
                /^\d+$/.test(oldSidc)
              ) {
                const newEchelon = newValue.substring(8, 10);
                const oldEchelon = oldSidc.substring(8, 10);

                // If new SIDC has '00' echelon (unspecified) and old SIDC has a specific echelon
                if (newEchelon === "00" && oldEchelon !== "00") {
                  let currentSidc = newValue;
                  currentSidc = setCharAt(currentSidc, 8, oldEchelon.charAt(0));
                  currentSidc = setCharAt(currentSidc, 9, oldEchelon.charAt(1));
                  newValue = currentSidc;
                }
              }
            }

            if (newValue !== undefined && newValue !== null) {
              const oldValue = existingUnit[field as keyof typeof existingUnit];
              if (oldValue !== newValue) {
                changes[field] = { old: oldValue, new: newValue };
              }
            }
          }
        }
      }

      return {
        rowIndex: index,
        row,
        existingUnit,
        matchValue,
        matched: existingUnit !== null,
        changes,
        mappedData: {
          id: mapped.id as string | undefined,
          name: mapped.name as string | undefined,
          shortName: mapped.shortName as string | undefined,
          sidc: mapped.sidc as string | undefined,
          description: mapped.description as string | undefined,
          externalUrl: mapped.externalUrl as string | undefined,
          _position: mapped._position as Position | undefined,
          symbolOptions: mapped.symbolOptions as UnitSymbolOptions | undefined,
        },
      };
    });
  });

  // Statistics
  const matchedResults = computed(() => matchResults.value.filter((r) => r.matched));
  const unmatchedResults = computed(() => matchResults.value.filter((r) => !r.matched));

  const matchedCount = computed(() => matchedResults.value.length);
  const unmatchedCount = computed(() => unmatchedResults.value.length);
  const changesCount = computed(
    () => matchedResults.value.filter((r) => Object.keys(r.changes).length > 0).length,
  );

  return {
    matchResults,
    matchedResults,
    unmatchedResults,
    matchedCount,
    unmatchedCount,
    changesCount,
    getUpdatableFields,
  };
}
