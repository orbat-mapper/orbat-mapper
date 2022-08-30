import { featureCollection, point } from "@turf/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { ExportSettings } from "@/types/convert";
import * as FileSaver from "file-saver";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Root } from "@tmcw/togeojson";

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

  async function createKMLString(sidcs: string[], opts: ExportSettings) {
    const { foldersToKML } = await import("@/extlib/tokml");
    const units = opts.includeUnits ? convertUnitsToGeoJson().features : [];
    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];

    const root: Root = { type: "root", children: [] };

    if (opts.includeUnits) {
      root.children.push({
        type: "folder",
        meta: { name: "Units" },
        children: units.map((unit) => {
          const { name, shortName, description } = unit.properties;
          return {
            ...unit,
            properties: {
              name: opts.useShortName ? shortName || name : name,
              description,
              styleUrl: `#sidc${unit.properties.sidc}`,
            },
          };
        }),
      });
    }

    if (opts.includeFeatures) {
      root.children.push({
        type: "folder",
        meta: { name: "Scenario features" },
        children: features,
      });
    }
    return foldersToKML(root, sidcs);
  }

  async function downloadAsKML(opts: ExportSettings) {
    const kmlString = await createKMLString([], opts);
    FileSaver.saveAs(
      new Blob([kmlString], {
        type: "application/vnd.google-earth.kml+xml",
      }),
      "scenario.kml"
    );
  }

  async function downloadAsKMZ(opts: ExportSettings) {
    const { zipSync } = await import("fflate");
    const data: Record<string, Uint8Array> = {};
    const usedSidcs = new Set<string>();
    if (opts.embedIcons) {
      for (const unit of geo.everyVisibleUnit.value) {
        const { sidc } = unit;
        if (!usedSidcs.has(sidc)) {
          const symb = symbolGenerator(sidc);
          usedSidcs.add(sidc);
          const blob: Blob | null = await new Promise((resolve) =>
            symb.asCanvas().toBlob(resolve)
          );
          if (blob) {
            data[`icons/${sidc}.png`] = new Uint8Array(await blob.arrayBuffer());
          }
        }
      }
    }
    const kmlString = await createKMLString([...usedSidcs], opts);

    data["doc.kml"] = new TextEncoder().encode(kmlString);

    const zipData = zipSync(data);
    FileSaver.saveAs(
      new Blob([zipData], {
        type: "application/octet-stream",
      }),
      "scenario.kmz"
    );
  }

  return { downloadAsGeoJSON, downloadAsKML, downloadAsKMZ };
}
