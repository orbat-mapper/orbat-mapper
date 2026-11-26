// @vitest-environment jsdom
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { FlexRender } from "@tanstack/vue-table";
import ImportOrbatMapperStep from "./ImportOrbatMapperStep.vue";
import FieldSelect from "./FieldSelect.vue";
import { RadioGroup } from "@/components/ui/radio-group";
import { activeScenarioKey } from "./injects";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useScenarioTime } from "@/scenariostore/time";
import { useScenarioSettings } from "@/scenariostore/settingsManipulations";
import DataGrid from "@/modules/grid/DataGrid.vue";
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

type State = ReturnType<typeof useNewScenarioStore>["state"];

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

async function setup(data = incomingFile(), mode: "layers" | "customSymbols" = "layers") {
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
          settings: useScenarioSettings(store),
        },
      },
      stubs: { ScenarioImportContribution: true },
    },
  });
  wrapper.findComponent(RadioGroup).vm.$emit("update:modelValue", mode);
  await flushPromises();
  const layerSelect = (label: string) =>
    wrapper.findAllComponents(FieldSelect).find((c) => c.props("label") === label);
  const importButton = () =>
    wrapper.findAll("button").find((b) => b.text() === "Import")!;
  return { wrapper, store, layerSelect, importButton };
}

function layerItems(state: State, id: string) {
  const layer = state.layerStackMap[id];
  return isScenarioOverlayLayer(layer) ? layer.items : [];
}

function layerNames(state: State) {
  return state.layerStack.map((id) => state.layerStackMap[id]?.name);
}

enableAutoUnmount(afterEach);

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

  it("warns when the file was made from an older export of its layers", async () => {
    const data = incomingFile();
    data.id = "export-1";
    const exportOf = (id: string, exportedDate: string) => ({
      id,
      exportedDate,
      sideGroupIds: [],
      snapshotGroupIds: [],
      layerIds: [MATCHED],
      snapshotTime: exportedDate,
    });
    const { wrapper, store } = await setup(data);
    store.state.exportRecords.push(
      exportOf("export-1", "2026-10-12T14:05:00.000Z"),
      exportOf("export-2", "2026-10-14T09:30:00.000Z"),
    );
    await flushPromises();

    expect(wrapper.get('[aria-label="File origin"]').text()).toContain(
      "A newer export of these layers was made on",
    );
  });

  it("updates matched layers in place and adds unmatched ones with the defaults", async () => {
    const { store, importButton } = await setup();
    const before = layerNames(store.state);

    await importButton().trigger("click");

    expect(layerNames(store.state)).toEqual([...before, "Unmatched"]);
    expect(layerItems(store.state, MATCHED)).toContain("cm-new-boundary");

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

describe("ImportOrbatMapperStep custom symbol import", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.body.innerHTML = "";
  });

  it("shows live existence in the table column after import and undo", async () => {
    const data = master();
    data.settings!.customSymbols = [
      { id: "sym-new", name: "New symbol", src: "data:x", sidc: "10031000001100000000" },
    ];
    const { wrapper, store, importButton } = await setup(data, "customSymbols");
    const grid = wrapper.getComponent(DataGrid);
    const column = grid.props("columns").find((c) => c && c.id === "exists");
    if (!column) throw new Error("Exists column missing");
    const symbol = grid.props("data")[0];
    const cell = mount(FlexRender, {
      props: { render: column.cell, props: { row: { original: symbol } } },
    });

    expect(cell.text()).toBe("No");
    grid.vm.$emit("update:selected", [symbol]);
    await flushPromises();
    await importButton().trigger("click");
    await flushPromises();
    expect(store.state.customSymbolMap["sym-new"]).toBeDefined();
    expect(cell.text()).toBe("Yes");

    store.undo();
    await flushPromises();
    expect(cell.text()).toBe("No");
  });
});
