export type ExportFormat = "geojson" | "kml" | "msdl";
export interface ExportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
}
