import { describe, expect, it } from "vitest";
import { exporters, findExporter } from "./index";

describe("exporters", () => {
  it("offers every export format, in the order the export dialog shows them", () => {
    expect(
      exporters.map(({ id, label, canCopyToClipboard }) => ({
        id,
        label,
        canCopyToClipboard,
      })),
    ).toEqual([
      { id: "orbatmapper", label: "ORBAT Mapper", canCopyToClipboard: true },
      { id: "geojson", label: "GeoJSON", canCopyToClipboard: true },
      { id: "kml", label: "KML", canCopyToClipboard: true },
      { id: "kmz", label: "KMZ", canCopyToClipboard: false },
      { id: "xlsx", label: "XLSX", canCopyToClipboard: false },
      { id: "csv", label: "CSV/TSV", canCopyToClipboard: true },
      { id: "milx", label: "MilX", canCopyToClipboard: true },
      {
        id: "unitgenerator",
        label: "Spatial Illusions ORBAT builder",
        canCopyToClipboard: true,
      },
    ]);
  });

  it("falls back to the native format for an unknown saved format", () => {
    expect(findExporter("no-such-format").id).toBe("orbatmapper");
    expect(findExporter("csv").id).toBe("csv");
  });
});
