// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import ScenarioFeatureLineStringMgrsEditor from "@/modules/scenarioeditor/ScenarioFeatureLineStringMgrsEditor.vue";
import { activeScenarioKey } from "@/components/injects";
import { useRecordingStore } from "@/stores/recordingStore";

const updateScenarioFeatureGeometry = vi.fn();

vi.mock("@/modules/scenarioeditor/scenarioDrawHelpers", () => ({
  updateScenarioFeatureGeometry: (...args: unknown[]) =>
    updateScenarioFeatureGeometry(...args),
}));

function makeLineFeature(
  coordinates: [number, number][] = [
    [14.50004, 48.81669],
    [14.51004, 48.82669],
  ],
) {
  return {
    id: "line-1",
    kind: "geometry" as const,
    _pid: "layer-1",
    geometry: {
      type: "LineString" as const,
      coordinates,
    },
    geometryMeta: {
      geometryKind: "LineString" as const,
    },
    name: "Route",
    style: {},
  };
}

describe("ScenarioFeatureLineStringMgrsEditor", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    updateScenarioFeatureGeometry.mockReset();
  });

  function mountEditor(feature = makeLineFeature()) {
    const scenario = { geo: { getGeometryLayerItemById: vi.fn() } };
    return mount(ScenarioFeatureLineStringMgrsEditor, {
      props: { feature },
      global: {
        provide: {
          [activeScenarioKey as symbol]: scenario,
        },
      },
    });
  }

  it("renders one MGRS input per line vertex", () => {
    const wrapper = mountEditor();
    expect(wrapper.findAll("input")).toHaveLength(2);
  });

  it("adds and removes coordinate rows", async () => {
    const wrapper = mountEditor();
    expect(wrapper.findAll("input")).toHaveLength(2);

    await wrapper.get('[title="Remove coordinate"]').trigger("click");
    expect(wrapper.findAll("input")).toHaveLength(1);

    await wrapper.get("button", { text: "Add coordinate" }).trigger("click");
    expect(wrapper.findAll("input")).toHaveLength(2);
  });

  it("applies valid MGRS coordinates to the line geometry", async () => {
    const wrapper = mountEditor();
    const inputs = wrapper.findAll("input");

    await inputs[0]!.setValue("33U PU 1234 5678");
    await inputs[1]!.setValue("33U PU 1244 5688");
    await wrapper.get("button", { text: "Apply" }).trigger("click");

    expect(updateScenarioFeatureGeometry).toHaveBeenCalledTimes(1);
    const [, featureId, geometry, geometryMeta, , updateState] =
      updateScenarioFeatureGeometry.mock.calls[0]!;
    expect(featureId).toBe("line-1");
    expect(geometry.type).toBe("LineString");
    expect(geometry.coordinates).toHaveLength(2);
    expect(geometryMeta).toEqual({ geometryKind: "LineString" });
    expect(updateState).toBe(false);
  });

  it("records geometry at the current time when feature geometry recording is on", async () => {
    useRecordingStore().isRecordingGeometry = true;
    const wrapper = mountEditor();
    const inputs = wrapper.findAll("input");

    await inputs[0]!.setValue("33U PU 1234 5678");
    await inputs[1]!.setValue("33U PU 1244 5688");
    await wrapper.get("button", { text: "Apply" }).trigger("click");

    expect(updateScenarioFeatureGeometry.mock.calls[0]![5]).toBe(true);
  });

  it("shows a validation error for invalid MGRS input", async () => {
    const wrapper = mountEditor();
    const inputs = wrapper.findAll("input");

    await inputs[0]!.setValue("not-a-grid");
    await wrapper.get("button", { text: "Apply" }).trigger("click");

    expect(updateScenarioFeatureGeometry).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Invalid MGRS coordinate");
  });
});
