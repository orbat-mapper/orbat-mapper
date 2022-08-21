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

  async function downloadAsGeoJSON(opts: ExportSettings) {
    const features = geo.everyVisibleUnit.value.map((unit) => {
      const { id, name, sidc, shortName } = unit;
      return point(unit._state?.location!, { name, shortName, sidc }, { id });
    });
    FileSaver.saveAs(
      new Blob([JSON.stringify(featureCollection(features), undefined, 2)], {
        type: "application/json",
      }),
      opts.fileName
    );
  }
  return { downloadAsGeoJSON };
}
