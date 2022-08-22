export type ExportFormat = "geojson" | "kml" | "kmz" | "msdl";
export interface ExportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
}
