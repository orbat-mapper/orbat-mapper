export type ExportFormat = "geojson" | "kml" | "kmz" | "msdl";
export type ImportFormat = "geojson" | "milx" | "msdl";
export type GuessedImportFormat = "unknown" | ImportFormat;

export interface ExportSettings {
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
