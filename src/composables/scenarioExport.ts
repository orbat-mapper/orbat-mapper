import { featureCollection, point } from "@turf/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { ColumnMapping, ExportSettings, XlsxSettings } from "@/types/convert";
import * as FileSaver from "file-saver";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Root } from "@tmcw/togeojson";
import { useSettingsStore } from "@/stores/settingsStore";
import { NUnit } from "@/types/internalModels";

const settingsStore = useSettingsStore();

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

  function convertUnitsToGeoJson() {
    const features = geo.everyVisibleUnit.value.map((unit) => {
      const { id, name, sidc, shortName, description } = unit;
      return point(
        unit._state?.location!,
        { name, shortName, sidc: unit._state?.sidc || sidc, description },
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
        const sidc = unit._state?.sidc || unit.sidc;
        if (!usedSidcs.has(sidc)) {
          const symb = symbolGenerator(sidc, {
            standard: settingsStore.symbologyStandard,
            simpleStatusModifier: true,
          });
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

  async function downloadAsXlsx(opts: ExportSettings) {
    const { writeFileXLSX, utils } = await import("xlsx");
    const { unitMap, sideGroupMap, sideMap } = store.state;

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

  return { downloadAsGeoJSON, downloadAsKML, downloadAsKMZ, downloadAsXlsx };
}
