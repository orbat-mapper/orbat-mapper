// @vitest-environment jsdom
import { defineComponent, reactive } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/dayjs";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import type { OrbatMapperExportSettings } from "@/types/importExport";

const InputCheckboxStub = defineComponent({
  name: "InputCheckbox",
  props: ["label", "description", "value", "modelValue"],
  template: "<div />",
});

const redSide = {
  sides: ["empty", "red"],
  sideMap: {
    empty: { id: "empty", name: "Empty side", groups: [] },
    red: { id: "red", name: "Red", standardIdentity: "6", groups: ["red-detected"] },
  },
  sideGroupMap: {
    "red-detected": { id: "red-detected", name: "Detected by Blue 3", subUnits: ["r7"] },
  },
  unitMap: {
    r7: {
      id: "r7",
      name: "R7",
      sidc: "10061000001211000000",
      subUnits: [],
      _state: { t: 0, location: [1, 1], status: "damaged-id" },
    },
  },
  unitStatusMap: { "damaged-id": { id: "damaged-id", name: "Damaged" } },
  events: [
    { id: "e1", startTime: 0, title: "Red attacks at dawn" },
    {
      id: "e2",
      startTime: Date.parse("1982-05-25T00:00:00Z"),
      title: "Red counterattack planned",
    },
  ],
};

const setCurrentTime = vi.fn();
const getModalTimestamp = vi.fn();

function mountSettings(
  form: OrbatMapperExportSettings,
  scenarioId = "scenario-a",
  withRed = false,
) {
  const state = {
    id: scenarioId,
    info: { name: "Source scenario", timeZone: "UTC" },
    currentTime: Date.parse("1982-05-21T06:00:00Z"),
    sides: ["empty"],
    sideMap: { empty: { id: "empty", name: "Empty side", groups: [] } } as Record<
      string,
      { id: string; name: string; groups: string[] }
    >,
    sideGroupMap: {},
    ...(withRed ? redSide : {}),
    layerStack: ["features", "control-measures"],
    layerStackMap: {
      features: { id: "features", kind: "overlay", name: "Features", items: [] },
      "control-measures": {
        id: "control-measures",
        kind: "overlay",
        name: "Control measures",
        specialization: "controlMeasure",
        items: [],
      },
    },
  };

  return mount(ExportSettingsOrbatMapper, {
    props: {
      modelValue: form,
      "onUpdate:modelValue": (value) => Object.assign(form, value),
    },
    global: {
      provide: {
        [timeModalKey as symbol]: { getModalTimestamp },
        [activeScenarioKey as symbol]: {
          store: { state },
          time: { setCurrentTime },
          unitActions: {
            walkItem(groupId: string, callback: (unit: unknown) => void) {
              const walk = (ids: string[]) =>
                ids.forEach((id) => {
                  const unit = redSide.unitMap[id as "r7"];
                  callback(unit);
                  walk(unit.subUnits);
                });
              walk(redSide.sideGroupMap[groupId as "red-detected"]?.subUnits ?? []);
            },
          },
          io: {
            toObject: () => ({
              id: scenarioId,
              name: "Source scenario",
              sides: withRed
                ? [
                    state.sideMap.empty,
                    {
                      ...state.sideMap.red,
                      description: "Red commander's intent",
                      groups: [
                        {
                          id: "red-detected",
                          name: "Detected by Blue 3",
                          subUnits: [
                            {
                              id: "r7",
                              name: "R7",
                              sidc: "10061000001211000000",
                              description: "BDA: 2 of 4 launchers lost",
                            },
                          ],
                        },
                      ],
                    },
                  ]
                : Object.values(state.sideMap),
              layerStack: Object.values(state.layerStackMap),
              description: "Controller briefing",
              events: withRed ? redSide.events : [],
            }),
          },
        },
      },
      stubs: {
        InputCheckbox: InputCheckboxStub,
        FieldSelect: defineComponent({
          props: ["items", "modelValue"],
          emits: ["update:modelValue"],
          template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value || null)">
            <option v-for="item in items" :key="item.value" :value="item.value ?? ''">{{ item.label }}</option>
          </select>`,
        }),
        InputGroupTemplate: { template: "<section><slot /></section>" },
        InputGroup: true,
      },
    },
  });
}

function form(layerIds?: string[]): OrbatMapperExportSettings {
  return reactive({
    sideGroups: [],
    // Saved layers are discarded on mount; tests select layers after mounting.
    layerIds,
    customColors: true,
    fileName: "scenario.json",
  });
}

describe("ExportSettingsOrbatMapper", () => {
  beforeEach(() => localStorage.clear());

  it("keeps a typed name until the selection changes", async () => {
    const settings = form();
    const wrapper = mountSettings(settings);
    settings.layerIds = ["features"];
    await wrapper.vm.$nextTick();
    expect(settings.scenarioName).toBe("Source scenario — Layers");
    expect(settings.fileName).toBe("source-scenario-layers.json");
    const input = (label: string) =>
      wrapper
        .findAllComponents({ name: "InputGroup" })
        .find((c) => c.attributes("label") === label)!;
    input("Scenario name").vm.$emit("update:modelValue", "Custom briefing");
    input("Name of downloaded file").vm.$emit("update:modelValue", "briefing.json");
    settings.scenarioName = "Custom briefing";
    settings.fileName = "briefing.json";
    await wrapper.vm.$nextTick();
    expect(settings.scenarioName).toBe("Custom briefing");
    expect(settings.fileName).toBe("briefing.json");

    settings.emptySideIds = ["empty"];
    await wrapper.vm.$nextTick();
    expect(settings.scenarioName).toBe("Source scenario — Empty side");
    expect(settings.fileName).toBe("source-scenario-empty-side.json");
  });

  it("does not keep names from a previous export", async () => {
    const settings = form();
    settings.emptySideIds = ["empty"];
    settings.scenarioName = "Source scenario — Red";
    settings.fileName = "source-scenario-red.json";
    mountSettings(settings);
    expect(settings.scenarioName).toBe("Source scenario — Empty side");
    expect(settings.fileName).toBe("source-scenario-empty-side.json");
  });

  it("keeps preset names until the selection changes", async () => {
    localStorage.setItem(
      "orbatmapper:export-presets:scenario-a",
      JSON.stringify([
        {
          id: "blue",
          name: "Blue",
          sideGroups: [],
          layerIds: ["features"],
          scenarioName: "Turn 3",
          fileName: "turn-3.json",
        },
      ]),
    );
    const settings = form();
    const wrapper = mountSettings(settings);
    await wrapper.find("select").setValue("blue");
    await wrapper.vm.$nextTick();
    const model = () => wrapper.props("modelValue");
    expect(model().scenarioName).toBe("Turn 3");
    expect(model().fileName).toBe("turn-3.json");

    model().emptySideIds = ["empty"];
    await wrapper.vm.$nextTick();
    expect(model().scenarioName).toBe("Source scenario — Empty side");
    expect(model().fileName).toBe("source-scenario-empty-side.json");
  });

  it("selects an empty side, previews it, and restores it from a preset", async () => {
    const settings = form();
    const wrapper = mountSettings(settings);
    const checkbox = wrapper
      .findAllComponents(InputCheckboxStub)
      .find((c) => c.props("value") === "empty")!;
    expect(checkbox.props("label")).toBe("Include side");
    checkbox.vm.$emit("update:modelValue", ["empty"]);
    await wrapper.vm.$nextTick();
    expect(settings.emptySideIds).toEqual(["empty"]);
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Preview recipient data").trigger("click");
    expect(wrapper.find('[aria-label="Recipient preview"]').text()).toContain(
      "Empty side — no groups",
    );
    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "Empty side preset");
    await wrapper.vm.$nextTick();
    await button("Save as new preset").trigger("click");
    wrapper.unmount();
    const restored = form();
    const reopened = mountSettings(restored);
    await reopened
      .find("select")
      .setValue(reopened.findAll("option")[1]!.attributes("value"));
    expect(restored.emptySideIds).toEqual(["empty"]);
    await reopened
      .findAll("button")
      .find((b) => b.text() === "Empty side")!
      .trigger("click");
    expect(restored.emptySideIds).toEqual([]);
    reopened.unmount();
  });

  it("saves explicit selections and reloads them only for the same scenario", async () => {
    const settings = form();
    const wrapper = mountSettings(settings);
    settings.layerIds = ["features"];
    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "Blue contacts");
    await wrapper.vm.$nextTick();
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Save as new preset").trigger("click");
    expect(wrapper.findAll("option").map((o) => o.text())).toContain("Blue contacts");
    wrapper.unmount();

    const reopened = mountSettings(form());
    const id = reopened.findAll("option")[1]!.attributes("value");
    await reopened.find("select").setValue(id);
    expect(reopened.props("modelValue").layerIds).toEqual(["features"]);
    // The other existing layer remains excluded, as will any newly added layer.
    expect(mountSettings(form(), "scenario-b").findAll("option")).toHaveLength(1);
    await reopened
      .findAll("button")
      .find((b) => b.text() === "Delete preset")!
      .trigger("click");
    expect(reopened.findAll("option")).toHaveLength(1);
    reopened.unmount();
  });

  it("shows selected content and retained scenario information in the preview", async () => {
    const settings = form();
    const wrapper = mountSettings(settings);
    settings.layerIds = ["features"];
    await wrapper
      .findAll("button")
      .find((b) => b.text() === "Preview recipient data")!
      .trigger("click");
    const preview = wrapper.find('[aria-label="Recipient preview"]');
    expect(preview.text()).toContain("Controller briefing");
    expect(preview.text()).toContain("Features");
    expect(preview.text()).not.toContain("Control measures");
  });

  it("warns about missing preset content without selecting other layers", async () => {
    localStorage.setItem(
      "orbatmapper:export-presets:scenario-a",
      JSON.stringify([
        {
          id: "blue",
          name: "Blue",
          sideGroups: ["deleted"],
          layerIds: ["removed"],
          fileName: "blue.json",
        },
      ]),
    );
    const settings = form();
    const wrapper = mountSettings(settings);
    await wrapper.find("select").setValue("blue");
    expect(settings.sideGroups).toEqual([]);
    expect(settings.layerIds).toEqual([]);
    expect(wrapper.find('[role="status"]').text()).toContain("no longer exist");
  });

  it("starts with no layers selected when no layer selection is saved", () => {
    const settings = form();
    const wrapper = mountSettings(settings);

    expect(settings.layerIds).toEqual([]);
    expect(
      wrapper
        .findAllComponents(InputCheckboxStub)
        .filter((checkbox) =>
          ["features", "control-measures"].includes(checkbox.props("value")),
        )
        .map((checkbox) => [checkbox.props("value"), checkbox.props("description")]),
    ).toEqual([
      ["features", undefined],
      ["control-measures", "Control measures"],
    ]);
  });

  it("selects and clears every layer with one click", async () => {
    const settings = form();
    const wrapper = mountSettings(settings);
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text);

    await button("Select all layers")!.trigger("click");
    expect(settings.layerIds).toEqual(["features", "control-measures"]);
    await button("Preview recipient data")!.trigger("click");
    const preview = wrapper.find('[aria-label="Recipient preview"]');
    expect(preview.text()).toContain("Features (overlay)");
    expect(preview.text()).toContain("Control measures (overlay)");

    expect(button("Select all layers")).toBeUndefined();
    await button("Clear layers")!.trigger("click");
    expect(settings.layerIds).toEqual([]);
    expect(preview.text()).toContain("No layers included.");
  });

  it("does not carry layers over from a previous export", () => {
    const settings = form(["features", "control-measures"]);
    mountSettings(settings);

    expect(settings.layerIds).toEqual([]);
  });

  it("exports a selected group as a snapshot and saves the choice in presets", async () => {
    const settings = form();
    const wrapper = mountSettings(settings, "scenario-a", true);
    const checkbox = (label: string) =>
      wrapper
        .findAllComponents(InputCheckboxStub)
        .find((c) => c.props("label") === label);
    expect(checkbox("Snapshot")).toBeUndefined();
    checkbox("Detected by Blue 3")!.vm.$emit("update:modelValue", ["red-detected"]);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("current scenario time, 1982-05-21 06:00,");
    checkbox("Snapshot")!.vm.$emit("update:modelValue", ["red-detected"]);
    await wrapper.vm.$nextTick();
    expect(settings.snapshotGroupIds).toEqual(["red-detected"]);

    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Preview recipient data").trigger("click");
    const preview = wrapper.find('[aria-label="Recipient preview"]').text();
    expect(preview).toMatch(/Red \/ Detected by Blue 3 — 1 units\s*, snapshot/);
    expect(preview).not.toContain("BDA");
    expect(preview).not.toContain("commander's intent");

    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "Blue 3 turn");
    await wrapper.vm.$nextTick();
    await button("Save as new preset").trigger("click");
    wrapper.unmount();
    const restored = form();
    const reopened = mountSettings(restored, "scenario-a", true);
    await reopened
      .find("select")
      .setValue(reopened.findAll("option")[1]!.attributes("value"));
    expect(restored.snapshotGroupIds).toEqual(["red-detected"]);
    reopened.unmount();
  });

  it("includes unit status in snapshots unless left out, and saves it in presets", async () => {
    const settings = form();
    settings.sideGroups = ["red-detected"];
    settings.snapshotGroupIds = ["red-detected"];
    const wrapper = mountSettings(settings, "scenario-a", true);
    expect(settings.includeSnapshotStatus).toBe(true);
    const button = (text: string) =>
      wrapper.findAll("button").find((b) => b.text() === text)!;
    await button("Preview recipient data").trigger("click");
    const preview = () => wrapper.find('[aria-label="Recipient preview"]').text();
    expect(preview()).toContain('"status": "Damaged"');

    wrapper
      .findAllComponents(InputCheckboxStub)
      .find((c) => c.props("label") === "Include unit status")!
      .vm.$emit("update:modelValue", false);
    await wrapper.vm.$nextTick();
    expect(preview()).not.toContain("Damaged");

    wrapper
      .findComponent({ name: "InputGroup" })
      .vm.$emit("update:modelValue", "No status");
    await wrapper.vm.$nextTick();
    await button("Save as new preset").trigger("click");
    wrapper.unmount();
    const restored = form();
    const reopened = mountSettings(restored, "scenario-a", true);
    expect(restored.includeSnapshotStatus).toBe(true);
    await reopened
      .find("select")
      .setValue(reopened.findAll("option")[1]!.attributes("value"));
    expect(restored.includeSnapshotStatus).toBe(false);
    reopened.unmount();
  });

  it("leaves out scenario events unless they are included", async () => {
    const settings = form();
    const wrapper = mountSettings(settings, "scenario-a", true);
    expect(settings.includeEvents).toBe(false);
    await wrapper
      .findAll("button")
      .find((b) => b.text() === "Preview recipient data")!
      .trigger("click");
    const preview = () => wrapper.find('[aria-label="Recipient preview"]').text();
    expect(preview()).not.toContain("Red attacks at dawn");

    const checkbox = (label: string) =>
      wrapper
        .findAllComponents(InputCheckboxStub)
        .find((c) => c.props("label") === label);
    expect(checkbox("Leave out later events")).toBeUndefined();
    checkbox("Include scenario events")!.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();
    expect(preview()).toContain("Red attacks at dawn");
    // Later events are left out by default.
    expect(settings.excludeFutureEvents).toBe(true);
    expect(preview()).not.toContain("Red counterattack planned");

    checkbox("Leave out later events")!.vm.$emit("update:modelValue", false);
    await wrapper.vm.$nextTick();
    expect(preview()).toContain("Red counterattack planned");
  });

  it("takes snapshots at a chosen time and moves the scenario time back", async () => {
    const settings = form();
    settings.snapshotTime = Date.parse("1982-05-01T00:00:00Z");
    const wrapper = mountSettings(settings, "scenario-a", true);
    // A time set for an earlier export is not reused.
    expect(settings.snapshotTime).toBeUndefined();
    const text = () => wrapper.text();
    const button = (label: string) =>
      wrapper.findAll("button").find((b) => b.text() === label);
    expect(button("Use current time")).toBeUndefined();

    const chosen = Date.parse("1982-05-22T12:00:00Z");
    getModalTimestamp.mockResolvedValueOnce(chosen);
    await button("Change snapshot time")!.trigger("click");
    await vi.waitFor(() => expect(settings.snapshotTime).toBe(chosen));
    await wrapper.vm.$nextTick();
    expect(text()).toMatch(/units are at\s+1982-05-22 12:00,/);
    expect(text()).not.toContain("current scenario time");

    settings.sideGroups = ["red-detected"];
    settings.snapshotGroupIds = ["red-detected"];
    await button("Preview recipient data")!.trigger("click");
    expect(setCurrentTime.mock.calls).toEqual([
      [chosen],
      [Date.parse("1982-05-21T06:00:00Z")],
    ]);

    await button("Use current time")!.trigger("click");
    expect(settings.snapshotTime).toBeUndefined();
    expect(text()).toContain("current scenario time, 1982-05-21 06:00,");
  });
});
