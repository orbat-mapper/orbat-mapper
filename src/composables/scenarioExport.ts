import { featureCollection, point } from "@turf/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { ColumnMapping, ExportSettings } from "@/types/convert";
import * as FileSaver from "file-saver";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Root } from "@tmcw/togeojson";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { NUnit } from "@/types/internalModels";
import {
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
  OrbatMapperGeoJsonLayer,
} from "@/lib/milx/types";

const symbolSettings = useSymbolSettingsStore();
export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

function columnMapper(data: any[], columnMap: ColumnMapping[]): Record<string, any>[] {
  const mappedData: Record<string, any>[] = [];

  data.forEach((item) => {
    const mappedItem: Record<string, any> = {};
    columnMap.forEach(({ label, field }) => {
      mappedItem[label] = mapField(item[field]);
    });
    mappedData.push(mappedItem);
  });
  return mappedData;
}

function mapField(field: any): string | number | Date {
  if (Array.isArray(field)) return JSON.stringify(field);
  return field;
}

export function useScenarioExport(options: Partial<UseScenarioExportOptions> = {}) {
  const { geo, store, unitActions } =
    options.activeScenario || injectStrict(activeScenarioKey);
  const { sideMap } = store.state;

  function convertUnitsToGeoJson(units: NUnit[]) {
    const features = units.map((unit) => {
      const { id, name, sidc, shortName, description } = unit;
      const symbolOptions = unitActions.getCombinedSymbolOptions(unit);

      return point<MilSymbolProperties>(
        unit._state?.location!,
        {
          name,
          shortName,
          sidc: unit._state?.sidc || sidc,
          description,
          ...symbolOptions,
        },
        { id }
      );
    });
    return featureCollection(features) as OrbatMapperGeoJsonCollection;
  }

  function convertScenarioFeaturesToGeoJson() {
    return featureCollection(geo.layers.value.map((layer) => layer.features).flat(1));
  }

  async function downloadAsGeoJSON(opts: ExportSettings) {
    const units = opts.includeUnits
      ? convertUnitsToGeoJson(geo.everyVisibleUnit.value).features
      : [];
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
    const root: Root = { type: "root", children: [] };

    function createFolder(units: NUnit[], name: string) {
      root.children.push({
        type: "folder",
        meta: { name },
        children: convertUnitsToGeoJson(units).features.map((unit) => {
          const { name, shortName, description } = unit.properties;
          return {
            ...unit,
            properties: {
              name: opts.useShortName ? shortName || name : name,
              description,
              styleUrl: `#sidc${unit.properties.sidc}${(
                unit.properties.fillColor || ""
              ).replaceAll("#", "")}`,
            },
          };
        }),
      });
    }

    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];

    if (opts.includeUnits) {
      if (opts.oneFolderPerSide) {
        Object.keys(sideMap).forEach((sideId) => {
          const side = sideMap[sideId];
          const units: NUnit[] = [];
          unitActions.walkSide(sideId, (unit) => {
            if (unit._state?.location) units.push(unit);
          });
          createFolder(units, side.name);
        });
      } else {
        createFolder(geo.everyVisibleUnit.value, "Units");
      }
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
        const sidc = unit._state?.sidc || unit.sidc;
        const symbolOptions = unitActions.getCombinedSymbolOptions(unit);
        const cacheKey = (sidc + (symbolOptions.fillColor || "")).replaceAll("#", "");
        if (!usedSidcs.has(cacheKey)) {
          const symb = symbolGenerator(sidc, {
            ...symbolSettings.symbolOptions,
            ...symbolOptions,
          });
          usedSidcs.add(cacheKey);
          const blob: Blob | null = await new Promise((resolve) =>
            symb.asCanvas().toBlob(resolve)
          );
          if (blob) {
            data[`icons/${cacheKey}.png`] = new Uint8Array(await blob.arrayBuffer());
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

  async function downloadAsMilx(opts: ExportSettings) {
    const { toMilx } = await import("@/lib/milx");

    const layers: OrbatMapperGeoJsonLayer[] = [];

    if (opts.includeUnits) {
      if (opts.oneFolderPerSide) {
        Object.keys(sideMap).forEach((sideId) => {
          const side = sideMap[sideId];
          const units: NUnit[] = [];
          unitActions.walkSide(sideId, (unit) => {
            if (unit._state?.location) units.push(unit);
          });
          layers.push({
            name: side.name,
            featureCollection: convertUnitsToGeoJson(units),
          });
        });
      } else {
        layers.push({
          name: "Units",
          featureCollection: convertUnitsToGeoJson(geo.everyVisibleUnit.value),
        });
      }
    }

    const milxString = toMilx(layers);
    FileSaver.saveAs(
      new Blob([milxString], {
        type: "application/xml",
      }),
      "scenario.milxly"
    );
  }

  async function downloadAsXlsx(opts: ExportSettings) {
    const { writeFileXLSX, utils } = await import("@/extlib/xlsx-lazy");
    const workbook = utils.book_new();
    let unitData: any[] = [];
    if (opts.oneSheetPerSide) {
      Object.keys(sideMap).forEach((sideId) => {
        unitData = [];
        const sideName = sideMap[sideId].name;
        unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
          unitData.push({ ...unit, sideId: side.id, sideName: side?.name });
        });
        const ws = utils.json_to_sheet(columnMapper(unitData, opts.columns));
        utils.book_append_sheet(workbook, ws, sideName);
      });
    } else {
      Object.keys(sideMap).forEach((sideId) =>
        unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
          unitData.push({ ...unit, sideId: side.id, sideName: side?.name });
        })
      );
      const ws = utils.json_to_sheet(columnMapper(unitData, opts.columns));
      utils.book_append_sheet(workbook, ws, "Units");
    }

    writeFileXLSX(workbook, "scenario.xlsx");
  }

  return {
    downloadAsGeoJSON,
    downloadAsKML,
    downloadAsKMZ,
    downloadAsXlsx,
    downloadAsMilx,
  };
}
