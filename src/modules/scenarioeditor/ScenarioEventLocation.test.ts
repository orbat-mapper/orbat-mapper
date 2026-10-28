// @vitest-environment jsdom
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref, type Ref } from "vue";
import { klona } from "klona";
import ScenarioEventLocation from "@/modules/scenarioeditor/ScenarioEventLocation.vue";
import ScenarioEventDetails from "@/modules/scenarioeditor/ScenarioEventDetails.vue";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import { useScenarioTime } from "@/scenariostore/time";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { useStateHelpers } from "@/scenariostore/helpers";
import { useGeoStore } from "@/stores/geoStore";
import type { TScenario } from "@/scenariostore";
import type { EventLocation, GeometryWhere } from "@/types/scenarioModels";
import "@/dayjs";

enableAutoUnmount(afterEach);

function createScenario(where?: unknown): TScenario {
  const store = useNewScenarioStore({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "3.4.0",
    name: "Scenario",
    startTime: "2025-01-01T00:00:00Z",
    sides: [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        groups: [
          {
            id: "group-1",
            name: "Group",
            subUnits: [
              {
                id: "unit-1",
                name: "2nd Mechanized Battalion",
                shortName: "2 MECH",
                sidc: "10031000161211000000",
                subUnits: [],
              },
            ],
          },
        ],
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Crossing",
        startTime: "2025-01-01T06:00:00Z",
        ...(where ? { where } : {}),
      },
    ],
    layerStack: [
      {
        id: "layer-1",
        kind: "overlay",
        name: "Control measures",
        specialization: "controlMeasure",
        items: [
          {
            id: "pl-blue",
            kind: "tacticalGraphic",
            name: "PL BLUE",
            graphicKind: "phase-line",
            controlPoints: [
              [10, 60],
              [11, 61],
            ],
          },
        ],
      },
    ],
  } as unknown as Parameters<typeof useNewScenarioStore>[0]);
  return {
    store,
    geo: useGeo(store),
    time: useScenarioTime(store),
    unitActions: useUnitManipulations(store),
    helpers: useStateHelpers(store),
  } as unknown as TScenario;
}

let draft: Ref<EventLocation | undefined>;

function mountLocation(scenario: TScenario, editable = true) {
  draft = ref(klona(scenario.store.state.eventMap["event-1"].where));
  const Host = defineComponent(
    () => () =>
      h(ScenarioEventLocation, {
        where: draft.value,
        "onUpdate:where": (value: EventLocation | undefined) => (draft.value = value),
        editable,
      }),
  );
  return mount(Host, {
    global: {
      provide: { [activeScenarioKey as symbol]: scenario },
      stubs: {
        // The tree pickers have their own tests; these pick "unit-1" and "pl-blue".
        UnitTreeSelect: {
          props: ["units", "placeholder"],
          emits: ["update:modelValue"],
          template:
            "<button type='button' data-test='unit-tree-select' :data-units='units.join()' @click=\"$emit('update:modelValue', 'unit-1')\">{{ placeholder }}</button>",
        },
        LayerItemTreeSelect: {
          props: ["layers", "placeholder"],
          emits: ["update:modelValue"],
          template:
            "<button type='button' data-test='layer-item-tree-select' :data-items='layers.flatMap((l) => l.items.map((i) => i.id)).join()' @click=\"$emit('update:modelValue', 'pl-blue')\">{{ placeholder }}</button>",
        },
      },
    },
  });
}

const whereOf = (scenario: TScenario) => scenario.store.state.eventMap["event-1"].where;
const draftWhere = () => draft.value;

const UNIT_PICKER = "[data-test='unit-tree-select']";
const FEATURE_PICKER = "[data-test='layer-item-tree-select']";

describe("ScenarioEventLocation", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("says the map stays put when no location is set", () => {
    const wrapper = mountLocation(createScenario());
    expect(wrapper.text()).toContain("Not set.");
  });

  it("adds a control measure and a unit", async () => {
    const scenario = createScenario();
    const wrapper = mountLocation(scenario);

    await wrapper.find(FEATURE_PICKER).trigger("click");
    expect(draftWhere()).toEqual({ type: "items", features: ["pl-blue"] });

    await wrapper.find(UNIT_PICKER).trigger("click");
    expect(draftWhere()).toEqual({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue"],
    });
    expect(wrapper.text()).toContain("PL BLUE");
    expect(wrapper.text()).toContain("2 MECH");
  });

  it("picks units from the ORBAT tree and items from the layer tree", () => {
    const wrapper = mountLocation(createScenario());

    expect(wrapper.find(UNIT_PICKER).attributes("data-units")).toBe("unit-1");
    expect(wrapper.find(UNIT_PICKER).text()).toBe("Add unit…");
    expect(wrapper.find(FEATURE_PICKER).attributes("data-items")).toBe("pl-blue");
    expect(wrapper.find(FEATURE_PICKER).text()).toBe("Add feature or control measure…");
  });

  it("does not add the same unit or item twice", async () => {
    const scenario = createScenario({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue"],
    });
    const wrapper = mountLocation(scenario);

    await wrapper.find(UNIT_PICKER).trigger("click");
    await wrapper.find(FEATURE_PICKER).trigger("click");

    expect(draftWhere()).toEqual({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue"],
    });
  });

  it("saves units alone as a units location so older builds can read it", async () => {
    const scenario = createScenario({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue"],
      maxZoom: 12,
    });
    const wrapper = mountLocation(scenario);

    await wrapper.find("button[aria-label='Remove PL BLUE']").trigger("click");

    expect(draftWhere()).toEqual({ type: "units", units: ["unit-1"], maxZoom: 12 });
  });

  it("shows deleted units as missing so they can be removed", async () => {
    const scenario = createScenario({ type: "units", units: ["deleted-unit"] });
    const wrapper = mountLocation(scenario);

    expect(wrapper.text()).toContain("Missing unit");
    await wrapper.find("button[aria-label='Remove Missing unit']").trigger("click");

    expect(draftWhere()).toBeUndefined();
  });

  it("captures the current map view as an area", async () => {
    const scenario = createScenario();
    vi.spyOn(useGeoStore(), "getUnobstructedMapViewBbox").mockReturnValue([
      10, 60, 11, 61,
    ]);
    const flashOutline = vi
      .spyOn(useGeoStore(), "flashOutline")
      .mockImplementation(() => {});
    const wrapper = mountLocation(scenario);

    const button = wrapper
      .findAll("button")
      .find((b) => b.text() === "Use current map view");
    await button!.trigger("click");

    expect(draftWhere()).toEqual({
      type: "geometry",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10, 60],
            [11, 60],
            [11, 61],
            [10, 61],
            [10, 60],
          ],
        ],
      },
    });
    expect(wrapper.text()).toContain("Map area (Polygon)");
    expect(flashOutline).toHaveBeenCalledTimes(1);
    expect(flashOutline.mock.calls[0][0]).toMatchObject({
      geometry: (draftWhere() as GeometryWhere).geometry,
    });
  });

  it("sets max zoom once the value is committed", async () => {
    const scenario = createScenario({ type: "units", units: ["unit-1"] });
    const wrapper = mountLocation(scenario);
    const input = wrapper.find("input[type='number']");

    await input.setValue("9");
    await input.trigger("change");
    expect(draftWhere()).toEqual({ type: "units", units: ["unit-1"], maxZoom: 9 });

    await input.setValue("");
    await input.trigger("change");
    expect(draftWhere()).toEqual({ type: "units", units: ["unit-1"] });
  });

  it("edits a draft and leaves the scenario alone until it is saved", async () => {
    const scenario = createScenario({ type: "units", units: ["unit-1"] });
    const wrapper = mountLocation(scenario);

    const clear = wrapper.findAll("button").find((b) => b.text() === "Clear");
    await clear!.trigger("click");

    expect(draftWhere()).toBeUndefined();
    expect(whereOf(scenario)).toEqual({ type: "units", units: ["unit-1"] });
  });

  it("shows the location read-only outside edit mode", () => {
    const scenario = createScenario({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue"],
    });
    const wrapper = mountLocation(scenario, false);

    expect(wrapper.text()).toContain("2 MECH");
    expect(wrapper.text()).toContain("PL BLUE");
    expect(wrapper.findAll("button").map((b) => b.text())).toEqual(["Show area"]);
    expect(wrapper.find("input").exists()).toBe(false);
  });

  it("does not edit a location type from a newer version", () => {
    const scenario = createScenario({ type: "somethingNew" });
    const wrapper = mountLocation(scenario);

    expect(wrapper.text()).toContain("Set by a newer version");
    expect(wrapper.find(UNIT_PICKER).exists()).toBe(false);
    expect(wrapper.find(FEATURE_PICKER).exists()).toBe(false);
  });
});

describe("event location in the event details form", () => {
  beforeEach(() => setActivePinia(createPinia()));

  const NEW_TIME = Date.parse("2025-01-02T09:30:00Z");
  const getModalTimestamp = vi.fn(async () => NEW_TIME);

  function mountDetails(scenario: TScenario) {
    return mount(ScenarioEventDetails, {
      props: { eventId: "event-1" },
      global: {
        provide: {
          [activeScenarioKey as symbol]: scenario,
          [timeModalKey as symbol]: { getModalTimestamp },
        },
        stubs: {
          ScenarioEventDropdownMenu: {
            emits: ["action"],
            template:
              "<button data-test='edit' @click=\"$emit('action', 'editMeta')\" />",
          },
          SimpleMarkdownInput: true,
        },
      },
    });
  }

  async function startEditing(wrapper: ReturnType<typeof mountDetails>) {
    await wrapper.find("[data-test='edit']").trigger("click");
    await flushPromises();
  }

  const clickButton = (wrapper: ReturnType<typeof mountDetails>, text: string) =>
    wrapper
      .findAll("button")
      .find((b) => b.text() === text)!
      .trigger("click");

  it("only offers location editing in edit mode", async () => {
    const wrapper = mountDetails(createScenario({ type: "units", units: ["unit-1"] }));
    expect(wrapper.text()).toContain("2 MECH");
    expect(wrapper.text().includes("Features and control measures")).toBe(false);

    await startEditing(wrapper);
    expect(wrapper.text().includes("Features and control measures")).toBe(true);
  });

  it("discards location changes on Cancel", async () => {
    const scenario = createScenario({ type: "units", units: ["unit-1"] });
    const wrapper = mountDetails(scenario);
    await startEditing(wrapper);

    await clickButton(wrapper, "Clear");
    await clickButton(wrapper, "Cancel");

    expect(whereOf(scenario)).toEqual({ type: "units", units: ["unit-1"] });
    await startEditing(wrapper);
    expect(wrapper.text()).toContain("2 MECH");
  });

  it("saves the location with the rest of the form in one undo step", async () => {
    const scenario = createScenario({ type: "units", units: ["unit-1"] });
    const wrapper = mountDetails(scenario);
    await startEditing(wrapper);

    await wrapper.find("#title-input").setValue("River crossing");
    await clickButton(wrapper, "Clear");
    await wrapper.find("form").trigger("submit");

    const event = () => scenario.store.state.eventMap["event-1"];
    expect(event().title).toBe("River crossing");
    expect(event().where).toBeUndefined();

    scenario.store.undo();
    expect(event().title).toBe("Crossing");
    expect(event().where).toEqual({ type: "units", units: ["unit-1"] });
  });

  it("changes the event time only when the form is saved", async () => {
    const scenario = createScenario();
    const wrapper = mountDetails(scenario);
    const event = () => scenario.store.state.eventMap["event-1"];
    const originalTime = event().startTime;
    await startEditing(wrapper);

    await wrapper.find("button[aria-label='Change event time']").trigger("click");
    await flushPromises();
    expect(getModalTimestamp).toHaveBeenCalledWith(originalTime, expect.anything());
    expect(event().startTime).toBe(originalTime);

    await clickButton(wrapper, "Cancel");
    expect(event().startTime).toBe(originalTime);

    await startEditing(wrapper);
    await wrapper.find("button[aria-label='Change event time']").trigger("click");
    await flushPromises();
    await wrapper.find("form").trigger("submit");
    expect(event().startTime).toBe(NEW_TIME);

    scenario.store.undo();
    expect(event().startTime).toBe(originalTime);
  });
});
