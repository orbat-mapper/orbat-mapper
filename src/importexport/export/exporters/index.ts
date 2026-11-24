import type { Exporter } from "./types";
import {
  csvExporter,
  geoJsonExporter,
  kmlExporter,
  kmzExporter,
  orbatMapperExporter,
  xlsxExporter,
} from "./builtins";
import { milxExporter } from "./milx";
import { spatialIllusionsExporter } from "./spatialIllusions";

export type { ExportContext, ExportFile, Exporter } from "./types";

/** Every export format, in the order the export dialog shows them. */
export const exporters: readonly Exporter<object>[] = [
  orbatMapperExporter,
  geoJsonExporter,
  kmlExporter,
  kmzExporter,
  xlsxExporter,
  csvExporter,
  milxExporter,
  spatialIllusionsExporter,
];

/** The exporter for a format id, or the native format if there is none. */
export function findExporter(id: string): Exporter<object> {
  return exporters.find((e) => e.id === id) ?? exporters[0];
}
