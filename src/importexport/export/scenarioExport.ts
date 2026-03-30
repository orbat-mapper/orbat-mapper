import { featureCollection } from "@turf/helpers";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { TScenario } from "@/scenariostore";
import type {
  ColumnMapping,
  CsvSettings,
  ExportSettings,
  GeoJsonSettings,
  OrbatMapperExportSettings,
  UnitGeneratorSettings,
} from "@/types/importExport.ts";
import { INTERNAL_NAMES, type NUnit } from "@/types/internalModels";
import type { Unit } from "@/types/scenarioModels";
import {
  reinforcedStatus2SpatialIllusions,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { OrbatMapperGeoJsonLayer } from "@/importexport/jsonish/types";
import { saveBlobToLocalFile } from "@/utils/files";
import { useKmlExport } from "./kmlExport";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

function stringifyReplacer(name: string, val: any) {
  if (val === undefined) return undefined;
  if (INTERNAL_NAMES.includes(name)) return undefined;

  return val;
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

function escapeCsvField(value: any, separator: string): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(separator) || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(data: Record<string, any>[], separator: string): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerLine = headers.map((h) => escapeCsvField(h, separator)).join(separator);
  const lines = data.map((row) =>
    headers.map((h) => escapeCsvField(row[h], separator)).join(separator),
  );
  return [headerLine, ...lines].join("\n");
}

export function useScenarioExport(options: Partial<UseScenarioExportOptions> = {}) {
  const scenario = options.activeScenario || injectStrict(activeScenarioKey);
  const {
    geo,
    store,
    unitActions,
    io,
    helpers: { getUnitById },
  } = scenario;
  const { sideMap } = store.state;

  const { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson } =
    useGeoJsonConverter(scenario);

  function generateGeoJSON(opts: GeoJsonSettings): string {
    const units = opts.includeUnits
      ? convertUnitsToGeoJson(geo.everyVisibleUnit.value, opts).features
      : [];
    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson(opts).features
      : [];
    const combined = [...units, ...(features as any)];
    return JSON.stringify(featureCollection(combined), stringifyReplacer, 2);
  }

  async function downloadAsGeoJSON(opts: GeoJsonSettings) {
    await saveBlobToLocalFile(
      new Blob([generateGeoJSON(opts)], {
        type: "application/json",
      }),
      opts.fileName,
    );
  }

  const {
    generateKml,
    downloadAsKML,
    downloadAsKMZ: exportAsKMZ,
  } = useKmlExport(scenario);

  async function downloadAsKMZ(opts: ExportSettings) {
    return exportAsKMZ(opts);
  }

  async function generateMilx(opts: ExportSettings): Promise<string> {
    const { toMilx } = await import("@/importexport/milx");

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

    return toMilx(layers);
  }

  async function downloadAsMilx(opts: ExportSettings) {
    const milxString = await generateMilx(opts);
    await saveBlobToLocalFile(
      new Blob([milxString], {
        type: "application/xml",
      }),
      "scenario.milxly",
      { mimeTypes: ["application/xml"], extensions: [".milxly"] },
    );
  }

  async function downloadAsXlsx(opts: ExportSettings) {
    const { writeFileXLSX, xlsxUtils } = await import("@/extlib/xlsx-lazy");
    const { formatLocation } = await import("@/importexport/export/locationFormat");
    const workbook = xlsxUtils.book_new();
    let unitData: any[] = [];
    const formatLoc = (loc: any) => formatLocation(loc, opts.locationFormat);
    if (opts.oneSheetPerSide) {
      Object.keys(sideMap).forEach((sideId) => {
        unitData = [];
        const sideName = sideMap[sideId].name;
        unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
          unitData.push({
            ...unit,
            location: formatLoc(unit._state?.location || unit.location),
            sideId: side.id,
            sideName: side?.name,
          });
        });
        const ws = xlsxUtils.json_to_sheet(columnMapper(unitData, opts.columns));
        xlsxUtils.book_append_sheet(workbook, ws, sideName);
      });
    } else {
      Object.keys(sideMap).forEach((sideId) =>
        unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
          unitData.push({
            ...unit,
            location: formatLoc(unit._state?.location || unit.location),
            sideId: side.id,
            sideName: side?.name,
          });
        }),
      );
      const ws = xlsxUtils.json_to_sheet(columnMapper(unitData, opts.columns));
      xlsxUtils.book_append_sheet(workbook, ws, "Units");
    }

    writeFileXLSX(workbook, "scenario.xlsx");
  }

  async function generateCsv(opts: CsvSettings & ExportSettings): Promise<string> {
    const { formatLocation } = await import("@/importexport/export/locationFormat");
    const formatLoc = (loc: any) => formatLocation(loc, opts.locationFormat);
    const separator = opts.separator || ",";

    const unitData: any[] = [];
    Object.keys(sideMap).forEach((sideId) =>
      unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
        unitData.push({
          ...unit,
          location: formatLoc(unit._state?.location || unit.location),
          sideId: side.id,
          sideName: side?.name,
        });
      }),
    );

    const mappedData = columnMapper(unitData, opts.columns);
    return toCsv(mappedData, separator);
  }

  async function downloadAsCsv(opts: CsvSettings & ExportSettings) {
    const csvContent = await generateCsv(opts);
    const separator = opts.separator || ",";
    const extension = separator === "\t" ? ".tsv" : ".csv";
    const mimeType = separator === "\t" ? "text/tab-separated-values" : "text/csv";

    await saveBlobToLocalFile(
      new Blob([csvContent], { type: mimeType }),
      `scenario${extension}`,
      { mimeTypes: [mimeType], extensions: [extension] },
    );
  }

  function generateSpatialIllusions(opts: UnitGeneratorSettings): string {
    const { rootUnit } = opts;
    const hierarchy = unitActions.expandUnitWithSymbolOptions(getUnitById(rootUnit));

    const d = convertUnit(hierarchy, 0);
    function convertUnit(unit: Unit, level: number): SpatialIllusionsOrbat {
      return {
        options: {
          uniqueDesignation: unit.name,
          sidc: unit.sidc,
          fillColor: unit.symbolOptions?.fillColor,
          reinforced: reinforcedStatus2SpatialIllusions[unit.reinforcedStatus ?? "None"],
          additionalInformation: unit.textAmplifiers?.additionalInformation,
        },
        subOrganizations:
          level < opts.maxLevels
            ? unit.subUnits?.map((subUnit) => convertUnit(subUnit, level + 1)) || []
            : [],
      };
    }
    return JSON.stringify(d, undefined, 2);
  }

  async function downloadAsSpatialIllusions(opts: UnitGeneratorSettings) {
    await saveBlobToLocalFile(
      new Blob([generateSpatialIllusions(opts)], {
        type: "application/json",
      }),
      "spatialillusions-orbat.json",
      { mimeTypes: ["application/json"], extensions: [".json"] },
    );
  }

  function generateOrbatMapper({
    scenarioName,
    sideGroups,
  }: OrbatMapperExportSettings): string {
    const scn = io.toObject();
    const sidesWithFilteredGroups = scn.sides.map((side) => ({
      ...side,
      groups: side.groups.filter((g) => sideGroups.includes(g.id)),
    }));
    const newScenario = {
      ...scn,
      sides: sidesWithFilteredGroups.filter((e) => e.groups.length),
    };
    newScenario.id = nanoid();
    newScenario.meta = {
      ...scn.meta!,
      exportedFrom: scn.id,
      exportedDate: new Date().toISOString(),
    };
    if (scenarioName) newScenario.name = scenarioName;
    return JSON.stringify(newScenario, undefined, 2);
  }

  async function downloadAsOrbatMapper(opts: OrbatMapperExportSettings) {
    await saveBlobToLocalFile(
      new Blob([generateOrbatMapper(opts)], {
        type: "application/json",
      }),
      opts.fileName || "scenario-export-orbatmapper.json",
      { mimeTypes: ["application/json"], extensions: [".json"] },
    );
  }

  return {
    downloadAsGeoJSON,
    downloadAsKML,
    downloadAsKMZ,
    downloadAsXlsx,
    downloadAsCsv,
    downloadAsMilx,
    downloadAsSpatialIllusions,
    downloadAsOrbatMapper,
    generateGeoJSON,
    generateKml,
    generateCsv,
    generateMilx,
    generateSpatialIllusions,
    generateOrbatMapper,
  };
}
