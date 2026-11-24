import { buildRecipientScenario, snapshotSourceAt } from "./recipientScenario";
import { featureCollection } from "@turf/helpers";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { TScenario } from "@/scenariostore";
import type {
  ColumnMapping,
  CsvSettings,
  GeoJsonSettings,
  OrbatMapperExportSettings,
  XlsxSettings,
} from "@/types/importExport.ts";
import { INTERNAL_NAMES } from "@/types/internalModels";
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
  const { geo, store, unitActions, io } = scenario;
  const { sideMap } = store.state;

  const { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson } =
    useGeoJsonConverter(scenario);
  const { generateKml, generateKmz } = useKmlExport(scenario);

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

  /** One row per unit of a side, with its location at the current scenario time. */
  async function unitRows(
    sideId: string,
    locationFormat: XlsxSettings["locationFormat"],
  ): Promise<any[]> {
    const { formatLocation } = await import("@/importexport/export/locationFormat");
    const rows: any[] = [];
    unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
      rows.push({
        ...unit,
        location: formatLocation(unit._state?.location || unit.location, locationFormat),
        sideId: side.id,
        sideName: side?.name,
      });
    });
    return rows;
  }

  async function generateXlsx(opts: XlsxSettings): Promise<Blob> {
    const { xlsxWrite, xlsxUtils } = await import("@/extlib/xlsx-lazy");
    const workbook = xlsxUtils.book_new();
    const sideIds = Object.keys(sideMap);
    if (opts.oneSheetPerSide) {
      for (const sideId of sideIds) {
        const rows = await unitRows(sideId, opts.locationFormat);
        const ws = xlsxUtils.json_to_sheet(columnMapper(rows, opts.columns));
        xlsxUtils.book_append_sheet(workbook, ws, sideMap[sideId].name);
      }
    } else {
      const rows = (
        await Promise.all(sideIds.map((id) => unitRows(id, opts.locationFormat)))
      ).flat();
      const ws = xlsxUtils.json_to_sheet(columnMapper(rows, opts.columns));
      xlsxUtils.book_append_sheet(workbook, ws, "Units");
    }
    const data: ArrayBuffer = xlsxWrite(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([data], { type: XLSX_MIME_TYPE });
  }

  async function generateCsv(opts: CsvSettings): Promise<string> {
    const rows = (
      await Promise.all(
        Object.keys(sideMap).map((id) => unitRows(id, opts.locationFormat)),
      )
    ).flat();
    return toCsv(columnMapper(rows, opts.columns), opts.separator || ",");
  }

  function generateOrbatMapper(settings: OrbatMapperExportSettings): string {
    const scn = io.toObject();
    const newScenario = buildRecipientScenario(
      scn,
      settings,
      snapshotSourceAt(scenario, settings),
    );
    newScenario.id = nanoid();
    newScenario.meta = {
      ...scn.meta!,
      exportedFrom: scn.id,
      exportedDate: new Date().toISOString(),
    };
    return io.stringifyObject(newScenario);
  }

  return {
    generateGeoJSON,
    generateKml,
    generateKmz,
    generateXlsx,
    generateCsv,
    generateOrbatMapper,
  };
}

export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
