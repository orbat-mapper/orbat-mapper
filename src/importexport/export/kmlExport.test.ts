import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKmlExport } from "./kmlExport";

const {
  saveBlobToLocalFileMock,
  foldersToKMLMock,
  zipSyncMock,
  strToU8Mock,
  symbolGeneratorMock,
  mapSettingsMock,
} = vi.hoisted(() => ({
  saveBlobToLocalFileMock: vi.fn(),
  foldersToKMLMock: vi.fn(() => "<kml></kml>"),
  zipSyncMock: vi.fn((data: Record<string, Uint8Array>) => data),
  strToU8Mock: vi.fn((s: string) => new TextEncoder().encode(s)),
  symbolGeneratorMock: vi.fn(() => ({
    getOctagonAnchor: () => ({ x: 10, y: 12 }),
    getSize: () => ({ width: 40, height: 30 }),
    asCanvas: () => document.createElement("canvas"),
  })),
  mapSettingsMock: {
    mapLabelSize: 12,
    mapWrapUnitLabels: false,
    mapWrapLabelWidth: 15,
    mapIconSize: 30,
    mapCustomIconScale: 1.7,
  },
}));

vi.mock("@/utils/files", () => ({
  saveBlobToLocalFile: saveBlobToLocalFileMock,
}));

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbolOptions: {} }),
}));
vi.mock("@/stores/mapSettingsStore.ts", () => ({
  useMapSettingsStore: () => mapSettingsMock,
}));

vi.mock("@/stores/selectedStore.ts", () => ({
  useSelectedItems: () => ({ selectedUnitIds: { value: new Set<string>() } }),
}));

vi.mock("@/symbology/milsymbwrapper", () => ({
  symbolGenerator: symbolGeneratorMock,
}));

vi.mock("fflate", () => ({
  zipSync: zipSyncMock,
  strToU8: strToU8Mock,
}));

vi.mock("@/extlib/tokml", () => ({
  foldersToKML: foldersToKMLMock,
}));

vi.mock("@/importexport/export/geojsonConverter", () => ({
  useGeoJsonConverter: () => ({
    convertUnitsToGeoJson: (units: any[]) => ({
      features: units.map((unit) => ({
        type: "Feature",
        properties: {
          id: unit.id,
          name: unit.name,
          shortName: unit.shortName,
          description: unit.description,
          sidc: unit.sidc,
          fillColor: unit.fillColor,
        },
        geometry: { type: "Point", coordinates: unit._state?.location ?? [0, 0] },
      })),
    }),
    convertScenarioFeaturesToGeoJson: () => ({ features: [] }),
  }),
}));

class MockImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  naturalWidth = 32;
  naturalHeight = 32;
  width = 32;
  height = 32;
  crossOrigin: string | null = null;
  private _src = "";

  set src(value: string) {
    this._src = value;
    if (value.includes("fail")) {
      this.onerror?.();
      return;
    }
    this.onload?.();
  }

  get src() {
    return this._src;
  }
}

function createScenario(
  customSymbolMap: Record<
    string,
    {
      id: string;
      name: string;
      src: string;
      sidc: string;
      anchor?: [number, number];
    }
  >,
  options: { unitName?: string } = {},
) {
  const { unitName = "Unit 1" } = options;
  const sidc = "custom1:10031000000000000000:custom-1";
  const unit = {
    id: "unit-1",
    name: unitName,
    sidc,
    _state: { sidc, location: [10, 59] },
    textAmplifiers: {},
  };
  return {
    geo: { everyVisibleUnit: { value: [unit] } },
    store: {
      state: {
        sideMap: {},
        customSymbolMap,
        currentTime: 0,
        events: [],
        eventMap: {},
      },
    },
    helpers: {
      getUnitById: (id: string) => (id === unit.id ? unit : null),
    },
    unitActions: {
      getCombinedSymbolOptions: () => ({}),
      walkSide: () => {},
      walkItem: () => {},
    },
    time: { setCurrentTime: () => {} },
  } as any;
}

function createMilScenario() {
  const sidc = "10031000000000000000";
  const unit = {
    id: "unit-mil-1",
    name: "MIL Unit 1",
    sidc,
    _state: { sidc, location: [11, 60] },
    textAmplifiers: {},
  };
  return {
    geo: { everyVisibleUnit: { value: [unit] } },
    store: {
      state: {
        sideMap: {},
        customSymbolMap: {},
        currentTime: 0,
        events: [],
        eventMap: {},
      },
    },
    helpers: {
      getUnitById: (id: string) => (id === unit.id ? unit : null),
    },
    unitActions: {
      getCombinedSymbolOptions: () => ({}),
      walkSide: () => {},
      walkItem: () => {},
    },
    time: { setCurrentTime: () => {} },
  } as any;
}

function createKmzOptions(overrides: Record<string, unknown> = {}) {
  return {
    includeUnits: true,
    includeSelectedUnitsOnly: false,
    includeFeatures: false,
    embedIcons: true,
    useShortName: true,
    folderMode: "one" as const,
    oneFolderPerSide: false,
    iconScale: 1,
    labelScale: 1,
    drawSymbolOutline: true,
    outlineColor: "white",
    outlineWidth: 8,
    renderAmplifiers: false,
    renderCustomIconLabels: false,
    timeMode: "current" as const,
    exportEventIds: [],
    useRadioFolder: false,
    ...overrides,
  };
}

describe("downloadAsKMZ custom symbols", () => {
  const originalImage = globalThis.Image;
  let fillTextMock: ReturnType<typeof vi.fn>;
  let strokeTextMock: ReturnType<typeof vi.fn>;
  let measureTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    symbolGeneratorMock.mockClear();
    saveBlobToLocalFileMock.mockClear();
    foldersToKMLMock.mockClear();
    zipSyncMock.mockClear();
    strToU8Mock.mockClear();
    mapSettingsMock.mapLabelSize = 12;
    mapSettingsMock.mapWrapUnitLabels = false;
    mapSettingsMock.mapWrapLabelWidth = 15;
    mapSettingsMock.mapIconSize = 30;
    mapSettingsMock.mapCustomIconScale = 1.7;

    vi.stubGlobal("Image", MockImage as any);
    fillTextMock = vi.fn();
    strokeTextMock = vi.fn();
    measureTextMock = vi.fn(() => ({ width: 40 }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      measureText: measureTextMock,
      fillText: fillTextMock,
      strokeText: strokeTextMock,
      font: "",
      textAlign: "center",
      textBaseline: "top",
      lineWidth: 1,
      strokeStyle: "",
      fillStyle: "",
    } as any);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (cb) {
      cb?.({
        type: "image/png",
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Blob);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    globalThis.Image = originalImage;
  });

  it("embeds custom icon and derives hotspot from custom anchor", async () => {
    const scenario = createScenario({
      "custom-1": {
        id: "custom-1",
        name: "Custom Alpha",
        src: "data:image/png;base64,AAAA",
        sidc: "10031000000000000000",
        anchor: [0.25, 0.8],
      },
    });
    const { downloadAsKMZ } = useKmlExport(scenario);

    const result = await downloadAsKMZ(createKmzOptions());

    expect(result.warnings).toHaveLength(0);
    expect(symbolGeneratorMock).not.toHaveBeenCalled();
    expect(zipSyncMock).toHaveBeenCalledTimes(1);
    const zipData = zipSyncMock.mock.calls[0][0] as Record<string, Uint8Array>;
    expect(Object.keys(zipData).some((k) => k.startsWith("icons/"))).toBe(true);

    const styles = (foldersToKMLMock.mock.calls as any[])[0][1] as Array<
      Record<string, unknown>
    >;
    expect(styles[0]?.xUnits).toBe("insetPixels");
    expect(styles[0]?.yUnits).toBe("insetPixels");
    expect(styles[0]?.xOffset).toBeCloseTo(38.25);
    expect(styles[0]?.yOffset).toBeCloseTo(40.8);
  });

  it("falls back when custom symbol is missing", async () => {
    const scenario = createScenario({});
    const { downloadAsKMZ } = useKmlExport(scenario);

    const result = await downloadAsKMZ(createKmzOptions());

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("is missing");
    expect(symbolGeneratorMock).toHaveBeenCalledTimes(1);
    expect((symbolGeneratorMock.mock.calls as any[])[0][0]).toBe("10031000000000000000");

    const styles = (foldersToKMLMock.mock.calls as any[])[0][1] as Array<
      Record<string, unknown>
    >;
    expect(styles[0]?.xUnits).toBe("insetPixels");
    expect(styles[0]?.yUnits).toBe("insetPixels");
  });

  it("falls back when custom image cannot be loaded", async () => {
    const scenario = createScenario({
      "custom-1": {
        id: "custom-1",
        name: "Custom Broken",
        src: "https://example.com/fail.png",
        sidc: "10031000000000000000",
      },
    });
    const { downloadAsKMZ } = useKmlExport(scenario);

    const result = await downloadAsKMZ(createKmzOptions());

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("could not be embedded");
    expect(symbolGeneratorMock).toHaveBeenCalledTimes(1);
  });

  it("renders unit label into custom icon and suppresses KML label when amplifiers are enabled", async () => {
    const scenario = createScenario({
      "custom-1": {
        id: "custom-1",
        name: "Custom Label",
        src: "data:image/png;base64,AAAA",
        sidc: "10031000000000000000",
      },
    });
    const { downloadAsKMZ } = useKmlExport(scenario);

    const result = await downloadAsKMZ(
      createKmzOptions({ renderCustomIconLabels: true }),
    );

    expect(result.warnings).toHaveLength(0);
    expect(fillTextMock).toHaveBeenCalled();
    expect(String(fillTextMock.mock.calls[0][0]).length).toBeGreaterThan(0);
    const styles = (foldersToKMLMock.mock.calls as any[])[0][1] as Array<
      Record<string, unknown>
    >;
    expect(styles[0]?.labelScale).toBe(0);
  });

  it("keeps icon size stable for long labels when rendering custom labels", async () => {
    const scenario = createScenario(
      {
        "custom-1": {
          id: "custom-1",
          name: "Custom Long Label",
          src: "data:image/png;base64,AAAA",
          sidc: "10031000000000000000",
        },
      },
      { unitName: "This is a very long unit label that should not shrink the icon" },
    );
    const { downloadAsKMZ } = useKmlExport(scenario);

    await downloadAsKMZ(createKmzOptions({ renderCustomIconLabels: true }));

    const styles = (foldersToKMLMock.mock.calls as any[])[0][1] as Array<
      Record<string, unknown>
    >;
    expect(styles[0]?.xUnits).toBe("insetPixels");
    expect(styles[0]?.xOffset).toBeCloseTo(25.5);
  });

  it("allows label canvas to be wider than icon without shrinking text", async () => {
    measureTextMock.mockImplementation((text: string) => ({ width: text.length * 12 }));
    const scenario = createScenario(
      {
        "custom-1": {
          id: "custom-1",
          name: "Custom Wide Label",
          src: "data:image/png;base64,AAAA",
          sidc: "10031000000000000000",
        },
      },
      { unitName: "Very long label that should expand canvas width" },
    );
    const { downloadAsKMZ } = useKmlExport(scenario);

    await downloadAsKMZ(createKmzOptions({ renderCustomIconLabels: true }));

    const styles = (foldersToKMLMock.mock.calls as any[])[0][1] as Array<
      Record<string, unknown>
    >;
    expect(styles[0]?.xOffset as number).toBeGreaterThan(25.5);
  });

  it("uses map label size and wrap width settings for custom icon labels", async () => {
    mapSettingsMock.mapLabelSize = 20;
    mapSettingsMock.mapWrapUnitLabels = true;
    mapSettingsMock.mapWrapLabelWidth = 4;
    const scenario = createScenario(
      {
        "custom-1": {
          id: "custom-1",
          name: "Custom Wrapped",
          src: "data:image/png;base64,AAAA",
          sidc: "10031000000000000000",
        },
      },
      { unitName: "Alpha Bravo Charlie" },
    );
    const { downloadAsKMZ } = useKmlExport(scenario);

    await downloadAsKMZ(createKmzOptions({ renderCustomIconLabels: true }));

    // Wrapped labels should render on multiple lines when wrap width is small.
    expect(fillTextMock.mock.calls.length).toBeGreaterThan(1);
  });

  it("embeds ordinary symbol icon when canvas toBlob returns null", async () => {
    const scenario = createMilScenario();
    const { downloadAsKMZ } = useKmlExport(scenario);

    const toDataURLSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/png;base64,AAAA");

    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (cb) {
      cb?.(null);
    });

    const result = await downloadAsKMZ(createKmzOptions());

    expect(result.warnings).toHaveLength(0);
    expect(symbolGeneratorMock).toHaveBeenCalledTimes(1);
    expect(toDataURLSpy).toHaveBeenCalledTimes(1);
    const zipData = zipSyncMock.mock.calls[0][0] as Record<string, Uint8Array>;
    expect(Object.keys(zipData).some((k) => k.startsWith("icons/"))).toBe(true);
  });
});
