import { type EntityId } from "@/types/base";
import type { ImportedFileInfo } from "@/importexport/fileHandling.ts";
import type { FeatureCollection } from "geojson";

export type ExportFormat =
  | "orbatmapper"
  | "geojson"
  | "kml"
  | "kmz"
  | "msdl"
  | "xlsx"
  | "milx"
  | "unitgenerator";

export type ImportFormat =
  | "milx"
  | "geojson"
  | "unitgenerator"
  | "orbatgenerator"
  | "image"
  | "kml"
  | "xlsx"
  | "csv"
  | "tsv"
  | "orbatmapper"
  | "orbatmapper-encrypted";
// | "msdl" // not implemented

export type GuessedImportFormat = "unknown" | ImportFormat;

export type FormatDialect = "geojson-plain" | "geojson-unitgenerator";
export type GuessedFormatDialect = "unknown" | FormatDialect;
export interface ColumnMapping<TData = Record<string, unknown>> {
  label: string;
  field: keyof TData | string;
}

export interface BaseExportSettings {
  customColors: boolean;
  fileName: string;
}

export interface XlsxSettings extends BaseExportSettings {
  oneSheetPerSide: boolean;
  columns: ColumnMapping[];
}

export interface UnitGeneratorSettings extends BaseExportSettings {
  rootUnit: EntityId;
  maxLevels: number;
}

export interface GeoJsonSettings extends BaseExportSettings {
  includeUnits: boolean;
  includeFeatures: boolean;
  includeIdInProperties: boolean;
  includeId: boolean;
  includeSelectedUnitsOnly: boolean;
}

export interface OrbatMapperExportSettings extends BaseExportSettings {
  sideGroups: EntityId[];
  scenarioName?: string;
}

export type FolderMode = "one" | "side" | "sideGroup";
export type TimeMode = "current" | "event" | "multiple";

export interface KmlKmzExportSettings {
  includeUnits: boolean;
  includeSelectedUnitsOnly: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
  folderMode: FolderMode;
  oneFolderPerSide: boolean;
  iconScale: number;
  labelScale: number;
  drawSymbolOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  renderAmplifiers: boolean;
  timeMode: TimeMode;
  exportEventId?: EntityId;
  exportEventIds: EntityId[];
  useRadioFolder: boolean;
}

export interface ExportSettings
  extends
    XlsxSettings,
    UnitGeneratorSettings,
    GeoJsonSettings,
    OrbatMapperExportSettings,
    KmlKmzExportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
}

export interface ImportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
}

interface GenericImportData<T extends ImportFormat, TData> {
  format: T;
  data: TData[];
  fileInfo: ImportedFileInfo[];
}

export type KmlImportData = GenericImportData<"kml", string>;
type GeoJsonImportData = GenericImportData<"geojson", FeatureCollection>;

export type ImportData = KmlImportData | GeoJsonImportData;
