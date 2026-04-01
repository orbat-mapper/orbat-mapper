// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import LoadScenarioDialog from "@/modules/scenarioeditor/LoadScenarioDialog.vue";
import { ORBAT_CHART_ROUTE } from "@/router/names";
import StoredScenarioBrowser from "@/components/StoredScenarioBrowser.vue";

const { loadScenarioMock, onActionMock } = vi.hoisted(() => ({
  loadScenarioMock: vi.fn(),
  onActionMock: vi.fn(),
}));

vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: (options?: { routeName?: string }) => ({
    storedScenarios: [],
    sortOptions: [],
    sortDirection: "desc",
    toggleSortDirection: vi.fn(),
    onAction: onActionMock,
    loadScenario: loadScenarioMock,
    options,
  }),
}));

const StoredScenarioBrowserStub = defineComponent({
  name: "StoredScenarioBrowser",
  props: [
    "scenarios",
    "sortOptions",
    "sortDirection",
    "searchInputId",
    "autofocus",
    "gridClass",
    "routeName",
  ],
  emits: ["action", "toggle-sort-direction"],
  template: "<div><slot name='actions' /></div>",
});

const LoadScenarioPanelStub = defineComponent({
  name: "LoadScenarioPanel",
  emits: ["loaded"],
  template:
    "<button data-testid='file-load' @click=\"$emit('loaded', { type: 'ORBAT-mapper', id: 'file-1' })\">load</button>",
});

const LoadScenarioUrlFormStub = defineComponent({
  name: "LoadScenarioUrlForm",
  emits: ["loaded"],
  template:
    "<button data-testid='url-load' @click=\"$emit('loaded', { type: 'ORBAT-mapper', id: 'url-1' })\">load</button>",
});

const DecryptScenarioModalStub = defineComponent({
  name: "DecryptScenarioModal",
  props: ["modelValue", "encryptedScenario"],
  emits: ["decrypted", "update:modelValue"],
  template:
    "<button data-testid='decrypt' @click=\"$emit('decrypted', { type: 'ORBAT-mapper', id: 'dec-1' })\">decrypt</button>",
});

describe("LoadScenarioDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountDialog() {
    return mount(LoadScenarioDialog, {
      props: {
        modelValue: true,
        routeName: ORBAT_CHART_ROUTE,
      },
      global: {
        stubs: {
          NewSimpleModal: {
            template: "<div><slot /></div>",
          },
          Tabs: {
            template: "<div><slot /></div>",
          },
          TabsList: {
            template: "<div><slot /></div>",
          },
          TabsTrigger: {
            template: "<button><slot /></button>",
          },
          TabsContent: {
            template: "<div><slot /></div>",
          },
          Button: true,
          RouterLink: true,
          StoredScenarioBrowser: StoredScenarioBrowserStub,
          LoadScenarioPanel: LoadScenarioPanelStub,
          LoadScenarioUrlForm: LoadScenarioUrlFormStub,
          DecryptScenarioModal: DecryptScenarioModalStub,
        },
      },
    });
  }

  it("routes file and url loads through the supplied route", async () => {
    const wrapper = mountDialog();

    await wrapper.get("[data-testid='file-load']").trigger("click");
    await wrapper.get("[data-testid='url-load']").trigger("click");

    expect(loadScenarioMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: "file-1" }),
      ORBAT_CHART_ROUTE,
    );
    expect(loadScenarioMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: "url-1" }),
      ORBAT_CHART_ROUTE,
    );
  });

  it("routes decrypted scenarios through the supplied route", async () => {
    const wrapper = mountDialog();

    wrapper.findComponent(LoadScenarioPanelStub).vm.$emit("loaded", {
      type: "ORBAT-mapper-encrypted",
      id: "enc-1",
    });
    await wrapper.vm.$nextTick();
    await wrapper.get("[data-testid='decrypt']").trigger("click");

    expect(loadScenarioMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dec-1" }),
      ORBAT_CHART_ROUTE,
    );
  });

  it("passes the supplied route to the stored scenario browser", () => {
    const wrapper = mountDialog();

    expect(wrapper.findComponent(StoredScenarioBrowser).props("routeName")).toBe(
      ORBAT_CHART_ROUTE,
    );
  });
});
