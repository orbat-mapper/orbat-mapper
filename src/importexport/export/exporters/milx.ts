import ExportSettingsMilx from "@/components/ExportSettingsMilx.vue";
import type { NUnit } from "@/types/internalModels";
import type { OrbatMapperGeoJsonLayer } from "@/importexport/jsonish/types";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";
import type { Exporter } from "./types";

export interface MilxSettings {
  includeUnits: boolean;
  /** One MilX layer per side instead of one layer with every unit. */
  oneFolderPerSide: boolean;
}

/** Units with a location at the current scenario time, as MilX layers. */
export const milxExporter: Exporter<MilxSettings> = {
  id: "milx",
  label: "MilX",
  description: "MilX layers",
  settingsComponent: ExportSettingsMilx,
  defaultSettings: () => ({ includeUnits: true, oneFolderPerSide: true }),
  canCopyToClipboard: true,
  note: "Please note that the MilX export is experimental. It is currently limited and has several bugs.",
  async generate({ scenario }, { includeUnits, oneFolderPerSide }) {
    const { toMilx } = await import("@/importexport/milx");
    const { convertUnitsToGeoJson } = useGeoJsonConverter(scenario);
    const { geo, store, unitActions } = scenario;

    const layers: OrbatMapperGeoJsonLayer[] = [];
    if (includeUnits && oneFolderPerSide) {
      for (const side of Object.values(store.state.sideMap)) {
        const units: NUnit[] = [];
        unitActions.walkSide(side.id, (unit) => {
          if (unit._state?.location) units.push(unit);
        });
        layers.push({ name: side.name, featureCollection: convertUnitsToGeoJson(units) });
      }
    } else if (includeUnits) {
      layers.push({
        name: "Units",
        featureCollection: convertUnitsToGeoJson(geo.everyVisibleUnit.value),
      });
    }

    return {
      content: toMilx(layers),
      fileName: "scenario.milxly",
      mimeType: "application/xml",
      extension: ".milxly",
    };
  },
};
