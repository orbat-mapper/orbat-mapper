import { describe, expect, it } from "vitest";
import { checkImportBase, describeImportBase } from "@/importexport/importBase";
import type { ExportRecord } from "@/types/scenarioModels";

function record(
  id: string,
  exportedDate: string,
  sideGroupIds: string[],
  extra: Partial<ExportRecord> = {},
): ExportRecord {
  return {
    id,
    exportedDate,
    sideGroupIds,
    snapshotGroupIds: [],
    layerIds: [],
    snapshotTime: exportedDate,
    ...extra,
  };
}

const october12 = record("export-1", "2026-10-12T14:05:00.000Z", ["blue-group"]);
const october14 = record("export-2", "2026-10-14T09:30:00.000Z", ["blue-group"]);

// A file the recipient re-exported from the opened export.
const reExported = (base: string) => ({
  id: "recipient-export",
  meta: {
    createdDate: "",
    lastModifiedDate: "",
    exportedFrom: base,
    exportedDate: "2026-10-15T00:00:00.000Z",
  },
});
// A file the recipient saved with Download scenario: the opened export keeps its ID.
const downloaded = (base: string) => ({
  id: base,
  meta: { createdDate: "", lastModifiedDate: "" },
});

describe("checkImportBase", () => {
  it("finds no problem when a re-exported file was made from the latest export", () => {
    expect(
      checkImportBase([october12, october14], reExported("export-2"), {
        sideGroupIds: ["blue-group"],
      }),
    ).toEqual({ status: "latest" });
  });

  it.each([
    ["re-exported", reExported("export-1")],
    ["downloaded", downloaded("export-1")],
  ])("warns when a %s file was made from an older export", (_, file) => {
    expect(
      checkImportBase([october12, october14], file, { sideGroupIds: ["blue-group"] }),
    ).toEqual({
      status: "older",
      baseDate: "2026-10-12T14:05:00.000Z",
      latestDate: "2026-10-14T09:30:00.000Z",
    });
  });

  it("finds the base of an export file that comes back unopened", () => {
    // The raw export names the source scenario in exportedFrom, not an export.
    const file = { ...reExported("source-scenario"), id: "export-2" };
    expect(
      checkImportBase([october12, october14], file, { sideGroupIds: ["blue-group"] }),
    ).toEqual({ status: "latest" });
  });

  it("reports an unknown origin when the base is not among the records", () => {
    expect(
      checkImportBase([october12], downloaded("from-another-scenario"), {
        sideGroupIds: ["blue-group"],
      }),
    ).toEqual({ status: "unknown" });
  });

  it("ignores newer exports that did not include the imported side groups or layers", () => {
    const otherGroup = record("export-3", "2026-10-14T12:00:00.000Z", ["red-group"]);
    expect(
      checkImportBase([october12, otherGroup], downloaded("export-1"), {
        sideGroupIds: ["blue-group"],
      }),
    ).toEqual({ status: "latest" });
  });

  it("ignores newer exports that held the group only as a snapshot", () => {
    // A snapshot carries no history, so it is never the file that comes back.
    const snapshot = record("export-3", "2026-10-14T12:00:00.000Z", ["blue-group"], {
      snapshotGroupIds: ["blue-group"],
    });
    expect(
      checkImportBase([october12, snapshot], downloaded("export-1"), {
        sideGroupIds: ["blue-group"],
      }),
    ).toEqual({ status: "latest" });
  });

  it("warns when a newer export included an imported layer", () => {
    const withLayer = record("export-3", "2026-10-14T12:00:00.000Z", [], {
      layerIds: ["layer-1"],
    });
    expect(
      checkImportBase([october12, withLayer], downloaded("export-1"), {
        layerIds: ["layer-1"],
      }),
    ).toMatchObject({ status: "older", latestDate: "2026-10-14T12:00:00.000Z" });
  });
});

describe("describeImportBase", () => {
  const formatDate = (iso: string) => iso.slice(0, 16);

  it("names both export dates in the warning", () => {
    const check = {
      status: "older" as const,
      baseDate: "2026-10-12T14:05:00.000Z",
      latestDate: "2026-10-14T09:30:00.000Z",
    };
    expect(describeImportBase(check, "this side", formatDate)?.message).toBe(
      "This file was made from the export of 2026-10-12T14:05. " +
        "A newer export of this side was made on 2026-10-14T09:30. " +
        "Importing it can undo changes made since 2026-10-12T14:05.",
    );
  });

  it("says nothing when the file was made from the latest export", () => {
    expect(describeImportBase({ status: "latest" }, "this side", formatDate)).toBe(
      undefined,
    );
  });
});
