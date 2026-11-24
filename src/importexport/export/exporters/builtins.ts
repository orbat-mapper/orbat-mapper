import ExportSettingsCsv from "@/components/ExportSettingsCsv.vue";
import ExportSettingsGeoJson from "@/components/ExportSettingsGeoJson.vue";
import ExportSettingsKmlKmz from "@/components/ExportSettingsKmlKmz.vue";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";
import ExportSettingsXlsx from "@/components/ExportSettingsXlsx.vue";
import type {
  CsvSettings,
  GeoJsonSettings,
  KmlKmzExportSettings,
  OrbatMapperExportSettings,
  XlsxSettings,
} from "@/types/importExport";
import { useScenarioExport, XLSX_MIME_TYPE } from "@/importexport/export/scenarioExport";
import type { ExportContext, Exporter } from "./types";

/*
 * The formats that still use the generators in `useScenarioExport()`. Each exporter here
 * only names the format and wraps its generator's result as a file.
 */

const KML_NOTE =
  "Please note that the export functionality is experimental. Scenario feature export is currently limited to geometries (no styles).";

const generators = (scenario: ExportContext["scenario"]) =>
  useScenarioExport({ activeScenario: scenario });

export const orbatMapperExporter: Exporter<OrbatMapperExportSettings> = {
  id: "orbatmapper",
  label: "ORBAT Mapper",
  description: "Native scenario data",
  settingsComponent: ExportSettingsOrbatMapper,
  defaultSettings: () => ({
    sideGroups: [],
    fileName: "scenario.json",
    customColors: true,
    emptySideIds: undefined,
    layerIds: undefined,
    scenarioName: undefined,
    snapshotGroupIds: undefined,
    snapshotTime: undefined,
    includeSnapshotStatus: undefined,
    timedSnapshotPositions: undefined,
    includeEvents: undefined,
    excludeFutureEvents: undefined,
  }),
  canCopyToClipboard: true,
  async generate({ scenario }, settings) {
    return {
      content: generators(scenario).generateOrbatMapper(settings),
      fileName: settings.fileName || "scenario-export-orbatmapper.json",
      mimeType: "application/json",
      extension: ".json",
    };
  },
};

export const geoJsonExporter: Exporter<GeoJsonSettings> = {
  id: "geojson",
  label: "GeoJSON",
  description: "Geographic JSON data",
  settingsComponent: ExportSettingsGeoJson,
  defaultSettings: () => ({
    includeUnits: true,
    includeFeatures: false,
    includeIdInProperties: false,
    includeId: true,
    includeSelectedUnitsOnly: false,
    customColors: true,
    fileName: "scenario.json",
  }),
  canCopyToClipboard: true,
  async generate({ scenario }, settings) {
    return {
      content: generators(scenario).generateGeoJSON(settings),
      fileName: settings.fileName || "scenario.json",
      mimeType: "application/json",
      extension: ".json",
    };
  },
};

const kmlDefaults = (): KmlKmzExportSettings => ({
  includeUnits: true,
  includeSelectedUnitsOnly: false,
  includeFeatures: false,
  embedIcons: true,
  useShortName: true,
  folderMode: "side",
  oneFolderPerSide: true,
  iconScale: 1.5,
  labelScale: 1,
  drawSymbolOutline: true,
  outlineColor: "rgba(255,255,255,0.8)",
  outlineWidth: 8,
  renderAmplifiers: false,
  renderCustomIconLabels: false,
  controlMeasureLabelMode: "native",
  timeMode: "current",
  exportEventId: "",
  exportEventIds: [],
  useRadioFolder: true,
});

export const kmlExporter: Exporter<KmlKmzExportSettings> = {
  id: "kml",
  label: "KML",
  description: "Data for Google Earth",
  hint: "KML displays geographic data in applications such as Google Earth. Use KMZ if you want to include unit icons.",
  settingsComponent: ExportSettingsKmlKmz,
  defaultSettings: kmlDefaults,
  canCopyToClipboard: true,
  note: KML_NOTE,
  async generate({ scenario }, settings) {
    return {
      content: await generators(scenario).generateKml(settings),
      fileName: "scenario.kml",
      mimeType: "application/vnd.google-earth.kml+xml",
      extension: ".kml",
    };
  },
};

export const kmzExporter: Exporter<KmlKmzExportSettings> = {
  id: "kmz",
  label: "KMZ",
  description: "Compressed KML with unit icons",
  hint: "KMZ is a compressed version of KML that can include unit icons.",
  settingsComponent: ExportSettingsKmlKmz,
  defaultSettings: kmlDefaults,
  canCopyToClipboard: false,
  note: KML_NOTE,
  async generate({ scenario }, settings) {
    const { blob, warnings } = await generators(scenario).generateKmz(settings);
    return {
      content: blob,
      fileName: "scenario.kmz",
      mimeType: "application/vnd.google-earth.kmz",
      extension: ".kmz",
      warnings,
    };
  },
};

export const xlsxExporter: Exporter<XlsxSettings> = {
  id: "xlsx",
  label: "XLSX",
  description: "Spreadsheet workbook",
  settingsComponent: ExportSettingsXlsx,
  defaultSettings: () => ({
    oneSheetPerSide: true,
    columns: [],
    locationFormat: "json",
    customColors: true,
    fileName: "scenario.xlsx",
  }),
  canCopyToClipboard: false,
  async generate({ scenario }, settings) {
    return {
      content: await generators(scenario).generateXlsx(settings),
      fileName: "scenario.xlsx",
      mimeType: XLSX_MIME_TYPE,
      extension: ".xlsx",
    };
  },
};

export const csvExporter: Exporter<CsvSettings> = {
  id: "csv",
  label: "CSV/TSV",
  description: "Delimited tabular data",
  settingsComponent: ExportSettingsCsv,
  defaultSettings: () => ({
    columns: [],
    locationFormat: "json",
    separator: ",",
    customColors: true,
    fileName: "scenario.csv",
  }),
  canCopyToClipboard: true,
  async generate({ scenario }, settings) {
    const isTsv = settings.separator === "\t";
    return {
      content: await generators(scenario).generateCsv(settings),
      fileName: isTsv ? "scenario.tsv" : "scenario.csv",
      mimeType: isTsv ? "text/tab-separated-values" : "text/csv",
      extension: isTsv ? ".tsv" : ".csv",
    };
  },
};
