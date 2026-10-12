import { type EntityId } from "@/types/base";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { ImportedFileInfo } from "@/importexport/fileHandling.ts";
import type { FeatureCollection } from "geojson";

export type ExportFormat =
  | "orbatmapper"
  | "geojson"
  | "kml"
  | "kmz"
  | "msdl"
  | "xlsx"
  | "csv"
  | "milx"
  | "unitgenerator";

export type ImportFormat =
  | "milx"
  | "geojson"
  | "gpx"
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

export type LocationExportFormat = "json" | "latlon" | "lonlat" | "mgrs" | "dms" | "dd";

export interface XlsxSettings extends BaseExportSettings {
  oneSheetPerSide: boolean;
  columns: ColumnMapping[];
  locationFormat: LocationExportFormat;
}

export type CsvSeparator = "," | "\t" | ";";

export interface CsvSettings extends BaseExportSettings {
  columns: ColumnMapping[];
  locationFormat: LocationExportFormat;
  separator: CsvSeparator;
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
  /** Explicitly selected sides that have no groups. */
  emptySideIds?: EntityId[];
  /**
   * The export form resets this to no layers each time it opens. Called directly,
   * buildRecipientScenario still treats undefined as every layer.
   */
  layerIds?: FeatureId[];
  scenarioName?: string;
  /**
   * Selected groups exported as their units at the current time only, without history,
   * plans, descriptions, resources or chain of command.
   */
  snapshotGroupIds?: EntityId[];
  /** When snapshot groups are taken. Undefined means the current scenario time. */
  snapshotTime?: number;
  /** Undefined keeps the scenario events, as before this option existed. */
  includeEvents?: boolean;
  /** Leaves out events after the snapshot time. */
  excludeFutureEvents?: boolean;
}

export type FolderMode = "one" | "side" | "sideGroup";
export type TimeMode = "current" | "event" | "multiple";
export type KmlControlMeasureLabelMode = "native" | "rendered";

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
  renderCustomIconLabels: boolean;
  controlMeasureLabelMode: KmlControlMeasureLabelMode;
  timeMode: TimeMode;
  exportEventId?: EntityId;
  exportEventIds: EntityId[];
  useRadioFolder: boolean;
}

export interface ExportSettings
  extends
    XlsxSettings,
    CsvSettings,
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
