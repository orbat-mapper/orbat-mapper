import { EntityId } from "@/types/base";

export type ExportFormat =
  | "geojson"
  | "kml"
  | "kmz"
  | "msdl"
  | "xlsx"
  | "milx"
  | "unitgenerator";

export type ImportFormat =
  | "geojson"
  | "milx"
  | "msdl"
  | "unitgenerator"
  | "orbatgenerator";
export type GuessedImportFormat = "unknown" | ImportFormat;

export interface ColumnMapping<TData = Record<string, any>> {
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
}

export interface ExportSettings
  extends XlsxSettings,
    UnitGeneratorSettings,
    GeoJsonSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
  oneFolderPerSide: boolean;
}

export interface ImportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
}
