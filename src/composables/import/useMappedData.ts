import { computed, type Ref, unref } from "vue";
import { nanoid } from "@/utils";
import { setCharAt } from "@/components/helpers";
import type { Position } from "geojson";
import {
  buildSidc,
  getEchelonCodeFromName,
  getIconCodeFromName,
} from "@/views/texttoorbat/textToOrbat";
import {
  parseLatLonPair,
  parseCoordinateString,
  type CombinedCoordinateFormat,
} from "@/geo/utils";
import { commonFields } from "./useColumnMapping";
import type { CoordinateMode } from "@/components/import/types";
import type { UnitSymbolOptions } from "@/types/scenarioModels";

export interface MappedDataOptions {
  data: Ref<any[]>;
  fieldMappings: Ref<Record<string, string | null>>;
  idField: Ref<string | null>;
  idMode: Ref<"mapped" | "autogenerate">;
  parentMatchField: Ref<string | null>;
  coordinateMode: Ref<CoordinateMode>;
  latitudeField: Ref<string | null>;
  longitudeField: Ref<string | null>;
  positionField: Ref<string | null>;
  combinedCoordinateFormat: Ref<CombinedCoordinateFormat>;
  guessSidc: Ref<boolean>;
  parentSidc: Ref<string | undefined>;
  parentSymbolOptions: Ref<UnitSymbolOptions | undefined>;
  parentSideIdentifier?: Ref<string | undefined>;
}

// Unit type for hierarchy
export interface HierarchyUnit extends Record<string, unknown> {
  id: string;
  name: string;
  sidc?: string;
  subUnits?: HierarchyUnit[];
  _position?: Position;
}

function isNumericSidc(value: string) {
  return /^\d{10}(\d{5})?(\d{5})?$/.test(value);
}

function isCharacterSidc(value: string) {
  return /^[A-Z\-]{15}(\d{15})?$/.test(value);
}

export function useMappedData(options: MappedDataOptions) {
  const {
    data,
    fieldMappings,
    idField,
    idMode,
    parentMatchField,
    coordinateMode,
    latitudeField,
    longitudeField,
    positionField,
    combinedCoordinateFormat,
    guessSidc,
    parentSidc,
    parentSymbolOptions,
    parentSideIdentifier,
  } = options;

  const generatedIds = new WeakMap<object, string>();

  const mappedData = computed(() => {
    if (!data.value.length) return [];
    const pSidc = unref(parentSidc);
    const pSymbolOptions = unref(parentSymbolOptions);
    const pSideId = unref(parentSideIdentifier);
    let parentIdentity = "3";
    if (pSidc) {
      if (pSidc.startsWith("custom")) {
        parentIdentity = pSideId || "3";
      } else {
        parentIdentity = pSidc[3];
      }
    }

    return data.value.map((row) => {
      const r = row as Record<string, unknown>;
      const unit: Record<string, unknown> = {};

      // Map ID
      if (idMode.value === "mapped" && idField.value && r[idField.value] !== undefined) {
        unit.id = r[idField.value];
      } else if (idMode.value === "autogenerate") {
        let id = generatedIds.get(r);
        if (!id) {
          id = nanoid();
          generatedIds.set(r, id);
        }
        unit.id = id;
      }

      // Map other fields
      commonFields.forEach((field) => {
        const mappedHeader = fieldMappings.value[field.value];
        if (mappedHeader && r[mappedHeader] !== undefined) {
          unit[field.value] = r[mappedHeader];
        }
      });

      // Try to construct SIDC from specific icon/echelon fields if SIDC is missing
      if (!unit.sidc) {
        const iconHeader = fieldMappings.value["icon"];
        const echelonHeader = fieldMappings.value["echelon"];
        const iconValue = iconHeader ? (r[iconHeader] as string) : undefined;
        const echelonValue = echelonHeader ? (r[echelonHeader] as string) : undefined;

        if (iconValue || echelonValue) {
          if (iconValue && (isNumericSidc(iconValue) || isCharacterSidc(iconValue))) {
            if (iconValue.length >= 15) {
              unit.sidc = setCharAt(iconValue, 3, parentIdentity);
            } else {
              // Partial SIDC (10 digits) - assume it contains entity/type/subtype/mod
              // We construct full SIDC: 10 + context + identity + set + status + hq + amp + iconValue
              const derivedEchelon = echelonValue
                ? getEchelonCodeFromName(echelonValue) || "00"
                : "00";
              unit.sidc = "100" + parentIdentity + "1000" + derivedEchelon + iconValue;
            }
          } else {
            const derivedIcon = iconValue
              ? getIconCodeFromName(iconValue) || "0000000000"
              : "0000000000";

            const derivedEchelon = echelonValue
              ? getEchelonCodeFromName(echelonValue) || "00"
              : "00";

            // Standard Identity 3 (Friendly), SymbolSet 10 (Land Unit), Status 0, HQTFD 0
            unit.sidc = "100" + parentIdentity + "1000" + derivedEchelon + derivedIcon;
          }
        } else if (guessSidc.value && unit.name) {
          const sidc = buildSidc(0, unit.name as string);
          unit.sidc = setCharAt(sidc, 3, parentIdentity);
        }
      }

      // Parse position based on coordinate mode
      if (
        coordinateMode.value === "separate" &&
        latitudeField.value &&
        longitudeField.value
      ) {
        const lat = r[latitudeField.value];
        const lon = r[longitudeField.value];
        const pos = parseLatLonPair(lat, lon);
        if (pos) {
          unit._position = pos;
        }
      } else if (coordinateMode.value === "combined" && positionField.value) {
        const coordValue = r[positionField.value];
        if (coordValue && typeof coordValue === "string") {
          const pos = parseCoordinateString(coordValue, combinedCoordinateFormat.value);
          if (pos) {
            unit._position = pos;
          }
        }
      }

      if (pSymbolOptions) {
        unit.symbolOptions = pSymbolOptions;
      }

      return unit;
    });
  });

  // Build hierarchy from flat data when parentId is mapped
  const hierarchyData = computed<HierarchyUnit[]>(() => {
    if (!fieldMappings.value.parentId || !parentMatchField.value) {
      return [];
    }

    const sourceData = data.value as Record<string, unknown>[];
    const flatData = mappedData.value as HierarchyUnit[];
    if (!flatData.length || !sourceData.length) return [];

    const parentIdHeader = fieldMappings.value.parentId;
    const matchFieldHeader = parentMatchField.value;

    // Create a map from the parentMatchField column value to the hierarchy unit
    // parentMatchField is a column header in the SOURCE data
    const unitMap = new Map<string, HierarchyUnit>();
    sourceData.forEach((sourceRow, index) => {
      const matchValue = String(sourceRow[matchFieldHeader] ?? "");
      if (matchValue && flatData[index]) {
        unitMap.set(matchValue, { ...flatData[index], subUnits: [] });
      }
    });

    // Build the hierarchy
    const rootUnits: HierarchyUnit[] = [];

    sourceData.forEach((sourceRow) => {
      const matchValue = String(sourceRow[matchFieldHeader] ?? "");
      const hierarchyUnit = unitMap.get(matchValue);
      if (!hierarchyUnit) return;

      // Get the parent reference from the source data's parentId column
      const parentIdValue = String(sourceRow[parentIdHeader!] ?? "");
      const parentUnit = parentIdValue ? unitMap.get(parentIdValue) : null;

      if (parentUnit && parentUnit !== hierarchyUnit) {
        if (!parentUnit.subUnits) parentUnit.subUnits = [];
        parentUnit.subUnits.push(hierarchyUnit);
      } else {
        rootUnits.push(hierarchyUnit);
      }
    });

    return rootUnits;
  });

  return {
    mappedData,
    hierarchyData,
  };
}
