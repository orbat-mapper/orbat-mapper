import { feature, featureCollection, point } from "@turf/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { ExportSettings } from "@/types/convert";
import * as FileSaver from "file-saver";

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

export function useScenarioExport(options: Partial<UseScenarioExportOptions> = {}) {
  const { geo } = options.activeScenario || injectStrict(activeScenarioKey);

  function convertUnitsToGeoJson() {
    const features = geo.everyVisibleUnit.value.map((unit) => {
      const { id, name, sidc, shortName, description } = unit;
      return point(
        unit._state?.location!,
        { name, shortName, sidc, description },
        { id }
      );
    });
    return featureCollection(features);
  }

  function convertScenarioFeaturesToGeoJson() {
    return featureCollection(geo.layers.value.map((layer) => layer.features).flat(1));
  }

  async function downloadAsGeoJSON(opts: ExportSettings) {
    const units = opts.includeUnits ? convertUnitsToGeoJson().features : [];
    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];
    const combined = [...units, ...(features as any)];

    FileSaver.saveAs(
      new Blob([JSON.stringify(featureCollection(combined), undefined, 2)], {
        type: "application/json",
      }),
      opts.fileName
    );
  }

  async function downloadAsKML(opts: ExportSettings) {
    const { foldersToKML } = await import("@placemarkio/tokml");
    const units = opts.includeUnits ? convertUnitsToGeoJson().features : [];
    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];

    const root = { type: "root", children: [] as any[] };

    if (opts.includeUnits) {
      root.children.push({ type: "folder", meta: { name: "Units" }, children: units });
    }

    if (opts.includeFeatures) {
      root.children.push({
        type: "folder",
        meta: { name: "Scenario features" },
        children: features,
      });
    }

    FileSaver.saveAs(
      new Blob([foldersToKML(root)], {
        type: "application/json",
      }),
      "scenario.kml"
    );
  }
  return { downloadAsGeoJSON, downloadAsKML };
}
