import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { defineComponent } from "vue";
import LandingPageScenarios from "@/views/LandingPageScenarios.vue";

const { pushMock, loadScenarioMock, saveImportedScenarioMock, getScenarioInfoMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    loadScenarioMock: vi.fn(),
    saveImportedScenarioMock: vi.fn(() => "token-123"),
    getScenarioInfoMock: vi.fn(),
  }));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: {} }),
}));

vi.mock("@/composables/browserScenarios", () => ({
  DEMO_SCENARIOS: [],
  useBrowserScenarios: () => ({
    storedScenarios: [],
    sortOptions: [],
    onAction: vi.fn(),
    loadScenario: loadScenarioMock,
  }),
}));

vi.mock("@/composables/importScenarioTransfer", () => ({
  saveImportedScenario: saveImportedScenarioMock,
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    getScenarioInfo: getScenarioInfoMock,
  }),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual("@vueuse/core");
  return {
    ...actual,
    useEventListener: vi.fn(),
  };
});

describe("LandingPageScenarios clipboard routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountWithSourceScenario(options: {
    clipboardScenario?: unknown;
    externalScenario?: unknown;
    urlScenario?: unknown;
  }) {
    const wrapper = shallowMount(LandingPageScenarios, {
      global: {
        stubs: {
          RouterLink: true,
          UseDark: true,
          LoadScenarioFromClipboardPanel: defineComponent({
            emits: ["loaded"],
            template:
              '<button data-testid="clipboard-load" @click="$emit(\'loaded\', scenario)">load</button>',
            data() {
              return { scenario: options.clipboardScenario };
            },
          }),
          LoadScenarioPanel: defineComponent({
            emits: ["loaded"],
            template:
              '<button data-testid="file-load" @click="$emit(\'loaded\', scenario)">load</button>',
            data() {
              return { scenario: options.externalScenario };
            },
          }),
          LoadScenarioFromUrlPanel: defineComponent({
            emits: ["loaded"],
            template:
              '<button data-testid="url-load" @click="$emit(\'loaded\', scenario)">load</button>',
            data() {
              return { scenario: options.urlScenario };
            },
          }),
        },
      },
    });
    return wrapper;
  }

  it("routes clipboard-loaded scenario to import preview route when it already exists", async () => {
    getScenarioInfoMock.mockResolvedValue({ id: "s1", name: "Existing" });
    const clipboardScenario = { type: "ORBAT-mapper", id: "s1" };
    const wrapper = mountWithSourceScenario({ clipboardScenario });

    await wrapper.get('[data-testid="clipboard-load"]').trigger("click");

    expect(saveImportedScenarioMock).toHaveBeenCalledWith(clipboardScenario);
    expect(pushMock).toHaveBeenCalledWith({
      name: "ImportScenarioRoute",
      query: { token: "token-123", source: "clipboard" },
    });
    expect(loadScenarioMock).not.toHaveBeenCalled();
  });

  it("loads clipboard scenario directly when it does not exist", async () => {
    getScenarioInfoMock.mockResolvedValue(null);
    const clipboardScenario = { type: "ORBAT-mapper", id: "s2" };
    const wrapper = mountWithSourceScenario({ clipboardScenario });

    await wrapper.get('[data-testid="clipboard-load"]').trigger("click");

    expect(loadScenarioMock).toHaveBeenCalledWith(clipboardScenario);
    expect(pushMock).not.toHaveBeenCalled();
    expect(saveImportedScenarioMock).not.toHaveBeenCalled();
  });

  it("routes file-loaded scenario to import preview route when it already exists", async () => {
    getScenarioInfoMock.mockResolvedValue({ id: "s3", name: "Existing" });
    const externalScenario = { type: "ORBAT-mapper", id: "s3" };
    const wrapper = mountWithSourceScenario({ externalScenario });

    await wrapper.get('[data-testid="file-load"]').trigger("click");

    expect(saveImportedScenarioMock).toHaveBeenCalledWith(externalScenario);
    expect(pushMock).toHaveBeenCalledWith({
      name: "ImportScenarioRoute",
      query: { token: "token-123", source: "external" },
    });
    expect(loadScenarioMock).not.toHaveBeenCalled();
  });

  it("routes url-loaded scenario to import preview route when it already exists", async () => {
    getScenarioInfoMock.mockResolvedValue({ id: "s4", name: "Existing" });
    const urlScenario = { type: "ORBAT-mapper", id: "s4" };
    const wrapper = mountWithSourceScenario({ urlScenario });

    await wrapper.get('[data-testid="url-load"]').trigger("click");

    expect(saveImportedScenarioMock).toHaveBeenCalledWith(urlScenario);
    expect(pushMock).toHaveBeenCalledWith({
      name: "ImportScenarioRoute",
      query: { token: "token-123", source: "external" },
    });
    expect(loadScenarioMock).not.toHaveBeenCalled();
  });
});
