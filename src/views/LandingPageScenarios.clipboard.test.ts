import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import LandingPageScenarios from "@/views/LandingPageScenarios.vue";

const { pushMock, loadScenarioMock, saveImportedScenarioMock, getScenarioInfoMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    loadScenarioMock: vi.fn(),
    saveImportedScenarioMock: vi.fn(() => "token-123"),
    getScenarioInfoMock: vi.fn(),
  }));

const { storedScenariosMock, openFilePickerMock } = vi.hoisted(() => ({
  storedScenariosMock: [] as Array<{ id: string; name: string }>,
  openFilePickerMock: vi.fn(),
}));
const { onBulkActionMock } = vi.hoisted(() => ({
  onBulkActionMock: vi.fn(),
}));

const StoredScenarioBrowserStub = defineComponent({
  name: "StoredScenarioBrowser",
  props: {
    scenarios: { type: Array, default: () => [] },
    sortOptions: { type: Array, default: () => [] },
    searchInputId: { type: String, default: "" },
    autofocus: { type: Boolean, default: false },
    enableBatchActions: { type: Boolean, default: false },
  },
  emits: ["bulk-action"],
  template: '<div><slot name="actions" /><slot /></div>',
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: {} }),
}));

vi.mock("@/composables/browserScenarios", () => ({
  DEMO_SCENARIOS: [],
  useBrowserScenarios: () => ({
    storedScenarios: storedScenariosMock,
    sortOptions: [],
    onAction: vi.fn(),
    onBulkAction: onBulkActionMock,
    loadScenario: loadScenarioMock,
  }),
}));

vi.mock("@/composables/useScenarioFileLoader", () => ({
  useScenarioFileLoader: (onLoaded: (scenario: unknown) => unknown) => ({
    fileInputRef: ref(null),
    isError: { value: false },
    loadFile: vi.fn(),
    onFileChange: vi.fn(),
    openFilePicker: (...args: unknown[]) => {
      openFilePickerMock(...args);
      return onLoaded({ type: "ORBAT-mapper", id: "from-header" });
    },
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
    storedScenariosMock.length = 0;
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
          StoredScenarioBrowser: StoredScenarioBrowserStub,
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

  it("routes header file-button scenario through the external import flow", async () => {
    storedScenariosMock.push({ id: "recent-1", name: "Recent" });
    getScenarioInfoMock.mockResolvedValue({ id: "from-header", name: "Existing" });
    const wrapper = mountWithSourceScenario({});

    await wrapper.get('[data-testid="header-load-file"]').trigger("click");

    expect(openFilePickerMock).toHaveBeenCalledOnce();
    expect(saveImportedScenarioMock).toHaveBeenCalledWith({
      type: "ORBAT-mapper",
      id: "from-header",
    });
    expect(pushMock).toHaveBeenCalledWith({
      name: "ImportScenarioRoute",
      query: { token: "token-123", source: "external" },
    });
    expect(loadScenarioMock).not.toHaveBeenCalled();
  });

  it("enables batch actions on the stored scenario browser", () => {
    storedScenariosMock.push({ id: "recent-1", name: "Recent" });
    const wrapper = mountWithSourceScenario({});

    expect(
      wrapper.findComponent(StoredScenarioBrowserStub).props("enableBatchActions"),
    ).toBe(true);
  });

  it("forwards bulk actions to the browser-scenarios composable", () => {
    storedScenariosMock.push({ id: "recent-1", name: "Recent" });
    const wrapper = mountWithSourceScenario({});
    const scenarios = [{ id: "scenario-1", name: "Scenario 1" }];

    wrapper
      .findComponent(StoredScenarioBrowserStub)
      .vm.$emit("bulk-action", "delete", scenarios);

    expect(onBulkActionMock).toHaveBeenCalledWith("delete", scenarios);
  });
});
