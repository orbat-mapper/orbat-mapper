import ExportSettingsSpatialIllusions from "@/components/ExportSettingsSpatialIllusions.vue";
import type { EntityId } from "@/types/base";
import type { Unit } from "@/types/scenarioModels";
import {
  reinforcedStatus2SpatialIllusions,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { Exporter } from "./types";

export interface SpatialIllusionsSettings {
  rootUnit: EntityId;
  /** How many levels below the root unit to include. */
  maxLevels: number;
}

/** A unit hierarchy for the Spatial Illusions ORBAT builder. */
export const spatialIllusionsExporter: Exporter<SpatialIllusionsSettings> = {
  id: "unitgenerator",
  label: "Spatial Illusions ORBAT builder",
  description: "Unit hierarchy data",
  settingsComponent: ExportSettingsSpatialIllusions,
  defaultSettings: () => ({ rootUnit: "", maxLevels: 3 }),
  canCopyToClipboard: true,
  async generate({ scenario }, { rootUnit, maxLevels }) {
    const { unitActions, helpers } = scenario;
    const hierarchy = unitActions.expandUnitWithSymbolOptions(
      helpers.getUnitById(rootUnit),
    );
    return {
      content: JSON.stringify(
        toSpatialIllusionsOrbat(hierarchy, maxLevels),
        undefined,
        2,
      ),
      fileName: "spatialillusions-orbat.json",
      mimeType: "application/json",
      extension: ".json",
    };
  },
};

function toSpatialIllusionsOrbat(
  unit: Unit,
  maxLevels: number,
  level = 0,
): SpatialIllusionsOrbat {
  return {
    options: {
      uniqueDesignation: unit.name,
      sidc: unit.sidc,
      fillColor: unit.symbolOptions?.fillColor,
      reinforced: reinforcedStatus2SpatialIllusions[unit.reinforcedStatus ?? "None"],
      additionalInformation: unit.textAmplifiers?.additionalInformation,
    },
    subOrganizations:
      level < maxLevels
        ? (unit.subUnits?.map((subUnit) =>
            toSpatialIllusionsOrbat(subUnit, maxLevels, level + 1),
          ) ?? [])
        : [],
  };
}
