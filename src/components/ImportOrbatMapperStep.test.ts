// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import ImportOrbatMapperStep from "./ImportOrbatMapperStep.vue";
import FieldSelect from "./FieldSelect.vue";
import { RadioGroup } from "@/components/ui/radio-group";
import { activeScenarioKey } from "./injects";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useScenarioTime } from "@/scenariostore/time";
import { loadControlMeasureScenarioFixture } from "@/testdata/controlMeasureScenario";
import { isScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import "@/dayjs";

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));
vi.mock("@/composables/browserScenarios", () => ({
  useBrowserScenarios: () => ({ loadScenario: vi.fn() }),
}));
vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

const MATCHED = "layer-control-measures";

/** The master scenario, with stable state ids as a saved scenario has them. */
function master() {
  const data = loadControlMeasureScenarioFixture();
  for (const layer of data.layerStack) {
    if (!isScenarioOverlayLayer(layer)) continue;
    for (const item of layer.items)
      item.state?.forEach((s, i) => (s.id ??= `${item.id}-state-${i}`));
  }
  return data;
}

/** A returned file: the matched layer gains an item, and a new layer is added. */
function incomingFile() {
  const data = master();
  const matched = data.layerStack.find((l) => l.id === MATCHED);
  if (!matched || !isScenarioOverlayLayer(matched)) throw new Error("fixture changed");
  matched.items.push({
    id: "cm-new-boundary",
    kind: "tacticalGraphic",
    graphicKind: "boundary",
    name: "New boundary",
    standardIdentity: "3",
    controlPoints: [
      [10, 60],
      [11, 60],
    ],
  } as (typeof matched.items)[number]);
  data.layerStack.push({
    id: "layer-unmatched",
    kind: "overlay",
    name: "Unmatched",
    items: [],
  });
  return data;
}

async function setup(data = incomingFile()) {
  const store = useNewScenarioStore(master());
  const geo = useGeo(store);
  const wrapper = mount(ImportOrbatMapperStep, {
    props: { data },
    attachTo: document.body,
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store,
          geo,
          time: useScenarioTime(store),
          unitActions: {},
          settings: {},
        },
      },
      stubs: { ScenarioImportContribution: true },
    },
  });
  wrapper.findComponent(RadioGroup).vm.$emit("update:modelValue", "layers");
  await flushPromises();
  const layerSelect = (label: string) =>
    wrapper.findAllComponents(FieldSelect).find((c) => c.props("label") === label);
  const importButton = () =>
    wrapper.findAll("button").find((b) => b.text() === "Import")!;
  return { wrapper, store, layerSelect, importButton };
}

function layerItems(state: ReturnType<typeof useNewScenarioStore>["state"], id: string) {
  const layer = state.layerStackMap[id];
  return isScenarioOverlayLayer(layer) ? layer.items : [];
}

function layerNames(state: ReturnType<typeof useNewScenarioStore>["state"]) {
  return state.layerStack.map((id) => state.layerStackMap[id]?.name);
}

describe("ImportOrbatMapperStep layer import", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.body.innerHTML = "";
  });

  it("defaults a layer matched by ID to replace and shows its preview", async () => {
    const { wrapper, layerSelect } = await setup();

    expect(layerSelect("Control measures")?.props("modelValue")).toBe("replace");
    const preview = wrapper.find('[aria-label="Layer replacement preview"]');
    expect(preview.exists()).toBe(true);
    expect(preview.text()).toContain("1 added, 0 changed, 0 removed");
  });

  it("updates matched layers in place and adds unmatched ones with the defaults", async () => {
    const { store, importButton } = await setup();
    const before = layerNames(store.state);

    await importButton().trigger("click");

    expect(layerNames(store.state)).toEqual([...before, "Unmatched"]);
    expect(layerItems(store.state, MATCHED)).toContain("cm-new-boundary");
    expect(store.state.layerStackMap["layer-unmatched"]).toBeDefined();

    store.undo();
    expect(layerNames(store.state)).toEqual(before);
    expect(store.state.layerItemMap["cm-new-boundary"]).toBeUndefined();
  });

  it("still imports a separate copy with a new ID when chosen", async () => {
    const { store, layerSelect, importButton } = await setup();
    layerSelect("Control measures")!.vm.$emit("update:modelValue", "copy");
    await flushPromises();

    await importButton().trigger("click");

    const copies = store.state.layerStack.filter(
      (id) => store.state.layerStackMap[id]?.name === "Control measures",
    );
    expect(copies).toHaveLength(2);
    expect(copies).toContain(MATCHED);
    expect(layerItems(store.state, MATCHED)).not.toContain("cm-new-boundary");
  });

  it("warns when a copy would duplicate an existing layer name", async () => {
    const { layerSelect } = await setup();
    const select = layerSelect("Control measures")!;
    expect(select.props("description")).not.toMatch(/already exists/);

    select.vm.$emit("update:modelValue", "copy");
    await flushPromises();

    expect(layerSelect("Control measures")!.props("description")).toMatch(
      /layer named "Control measures" already exists/,
    );
  });
});
