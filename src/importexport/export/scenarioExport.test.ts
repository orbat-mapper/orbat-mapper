import { describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { toCsv, useScenarioExport } from "@/importexport/export/scenarioExport";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioIO } from "@/scenariostore/io";
import {
  FIXTURE_T2,
  loadControlMeasureScenarioFixture,
} from "@/testdata/controlMeasureScenario";
import type { TScenario } from "@/scenariostore";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

vi.mock("@/importexport/export/kmlExport", () => ({
  useKmlExport: () => ({
    generateKml: vi.fn(),
    downloadAsKML: vi.fn(),
    downloadAsKMZ: vi.fn(),
  }),
}));

function loadScenario() {
  const source = loadControlMeasureScenarioFixture();
  source.timeZone = "Europe/Oslo";
  source.sides.push({
    id: "blue",
    name: "Blue",
    standardIdentity: "3",
    groups: [
      {
        id: "blue-group",
        name: "Units",
        subUnits: [
          {
            id: "blue-unit",
            name: "1 BN",
            sidc: "10031000001211000000",
            subUnits: [],
            state: [{ id: "blue-unit-s1", t: FIXTURE_T2, location: [10, 60] }],
          },
        ],
      },
    ],
  });
  const store = useNewScenarioStore(source);
  const io = useScenarioIO(shallowRef(store));
  const activeScenario = {
    io,
    store,
    geo: { layerItemsLayers: { value: [] }, everyVisibleUnit: { value: [] } },
    unitActions: {},
    helpers: {},
  } as unknown as TScenario;
  return { io, store, exporter: useScenarioExport({ activeScenario }) };
}

describe("toCsv", () => {
  it("should return empty string for empty data", () => {
    expect(toCsv([], ",")).toBe("");
  });

  it("should generate CSV with comma separator", () => {
    const data = [
      { name: "Unit A", sidc: "10031000001211000000", location: "12.5, 45.3" },
      { name: "Unit B", sidc: "10031000001211000001", location: "13.0, 46.0" },
    ];
    const result = toCsv(data, ",");
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("name,sidc,location");
    expect(lines[1]).toBe('Unit A,10031000001211000000,"12.5, 45.3"');
    expect(lines[2]).toBe('Unit B,10031000001211000001,"13.0, 46.0"');
  });

  it("should generate TSV with tab separator", () => {
    const data = [
      { name: "Unit A", sidc: "ABC" },
      { name: "Unit B", sidc: "DEF" },
    ];
    const result = toCsv(data, "\t");
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("name\tsidc");
    expect(lines[1]).toBe("Unit A\tABC");
    expect(lines[2]).toBe("Unit B\tDEF");
  });

  it("should generate with semicolon separator", () => {
    const data = [{ name: "Unit A", value: "100" }];
    const result = toCsv(data, ";");
    const lines = result.split("\n");
    expect(lines[0]).toBe("name;value");
    expect(lines[1]).toBe("Unit A;100");
  });

  it("should escape fields containing the separator", () => {
    const data = [{ name: "Unit A, Special", sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit A, Special"');
  });

  it("should escape fields containing double quotes", () => {
    const data = [{ name: 'Unit "Alpha"', sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit ""Alpha"""');
  });

  it("should escape fields containing newlines", () => {
    const data = [{ name: "Unit\nAlpha", sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit\nAlpha"');
  });

  it("should handle null and undefined values", () => {
    const data = [{ name: null, sidc: undefined }];
    const result = toCsv(data as any, ",");
    const lines = result.split("\n");
    expect(lines[1]).toBe(",");
  });
});

describe("ORBAT Mapper export file format", () => {
  const settings = {
    sideGroups: ["blue-group"],
    customColors: true,
    fileName: "blue.json",
  };

  it("leaves out derived runtime fields", () => {
    const { exporter } = loadScenario();
    const exported = exporter.generateOrbatMapper(settings);
    expect(exported).toContain('"blue-unit"');
    expect(exported).not.toMatch(/"_\w+":/);
  });

  it("writes timestamps in the scenario's time zone, like Download scenario", () => {
    const { io, exporter } = loadScenario();
    const exported = JSON.parse(exporter.generateOrbatMapper(settings));
    const downloaded = JSON.parse(io.stringifyScenario());

    const unit = exported.sides[0].groups[0].subUnits[0];
    expect(unit.state[0].t).toBe("2025-06-01T14:00:00+02:00");
    expect(exported.startTime).toBe("2025-06-01T02:00:00+02:00");
    expect(exported.layerStack).toEqual(downloaded.layerStack);
  });
});

describe("export records", () => {
  const settings = {
    sideGroups: ["blue-group"],
    layerIds: [],
    snapshotTime: Date.parse("2025-06-01T12:00:00Z"),
    customColors: true,
    fileName: "blue.json",
  };

  it("records each recipient export, and the record is saved and reloaded", () => {
    const { io, exporter } = loadScenario();
    const exported = JSON.parse(exporter.generateOrbatMapper(settings));

    const reloaded = useNewScenarioStore(io.serializeToObject());
    expect(reloaded.state.exportRecords).toEqual([
      {
        id: exported.id,
        exportedDate: exported.meta.exportedDate,
        sideGroupIds: ["blue-group"],
        snapshotGroupIds: [],
        layerIds: [],
        snapshotTime: "2025-06-01T12:00:00.000Z",
      },
    ]);
  });

  it("leaves the records out of the exported file", () => {
    const { exporter } = loadScenario();
    exporter.generateOrbatMapper(settings);
    const second = exporter.generateOrbatMapper(settings);

    expect(second).not.toContain("exportRecords");
    expect(JSON.parse(second).meta).not.toHaveProperty("exports");
  });

  it("does not put the record on the undo stack, but marks the scenario changed", () => {
    const { store, exporter } = loadScenario();
    const before = store.revision.value;
    exporter.generateOrbatMapper(settings);

    expect(store.canUndo.value).toBe(false);
    expect(store.revision.value).not.toBe(before);
  });
});
