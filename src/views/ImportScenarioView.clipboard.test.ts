import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ImportScenarioView from "@/views/ImportScenarioView.vue";

let mockQuery: Record<string, string> = {};
const pushMock = vi.fn();
const replaceMock = vi.fn();
const consumeImportedScenarioMock = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: mockQuery }),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

vi.mock("@/composables/scenarioShare", () => ({
  useScenarioShare: () => ({
    loadScenarioFromUrlParam: vi.fn(),
  }),
}));

vi.mock("@/composables/importScenarioTransfer", () => ({
  consumeImportedScenario: (...args: unknown[]) => consumeImportedScenarioMock(...args),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    getScenarioInfo: vi.fn().mockResolvedValue(null),
    addScenario: vi.fn(),
    putScenario: vi.fn(),
  }),
}));

describe("ImportScenarioView clipboard mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows preview immediately for clipboard token scenario", async () => {
    mockQuery = { source: "clipboard", token: "abc" };
    consumeImportedScenarioMock.mockReturnValue({
      type: "ORBAT-mapper",
      id: "s1",
      version: "0.6.0",
      name: "Clipboard Scenario",
      sides: [],
      events: [],
      layers: [],
      mapLayers: [],
    });

    const wrapper = mount(ImportScenarioView, {
      global: { stubs: { UseDark: true } },
    });
    await flushPromises();

    expect(consumeImportedScenarioMock).toHaveBeenCalledWith("abc");
    expect(wrapper.text()).toContain("Clipboard Scenario");
    expect(wrapper.text()).not.toContain("Download Scenario");
  });

  it("shows error when clipboard token is missing", async () => {
    mockQuery = { source: "clipboard" };

    const wrapper = mount(ImportScenarioView, {
      global: { stubs: { UseDark: true } },
    });
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Clipboard scenario is no longer available. Paste again.",
    );
  });

  it("shows preview immediately for external token scenario", async () => {
    mockQuery = { source: "external", token: "ext" };
    consumeImportedScenarioMock.mockReturnValue({
      type: "ORBAT-mapper",
      id: "s-ext",
      version: "0.6.0",
      name: "External Scenario",
      sides: [],
      events: [],
      layers: [],
      mapLayers: [],
    });

    const wrapper = mount(ImportScenarioView, {
      global: { stubs: { UseDark: true } },
    });
    await flushPromises();

    expect(consumeImportedScenarioMock).toHaveBeenCalledWith("ext");
    expect(wrapper.text()).toContain("External Scenario");
    expect(wrapper.text()).toContain("A scenario was loaded from a local file or URL.");
    expect(wrapper.text()).not.toContain("Download Scenario");
  });
});
