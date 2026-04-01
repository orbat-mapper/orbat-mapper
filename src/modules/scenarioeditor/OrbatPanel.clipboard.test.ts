// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import { activeParentKey, activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useRecordingStore } from "@/stores/recordingStore";
import { getSideDragItem, getUnitDragItem } from "@/types/draggables";
import type { NUnit } from "@/types/internalModels";

const TEST_SIDC = "10031000001211000000";

type UnitLike = {
  id: string;
  name: string;
  sidc: string;
  subUnits: UnitLike[];
};

const {
  addUnitHierarchySpy,
  extractInstructionSpy,
  monitorForExternalSpy,
  serializeUnitSpy,
  monitorForElementsSpy,
  onUnitActionSpy,
} = vi.hoisted(() => ({
  addUnitHierarchySpy: vi.fn((unit: { id: string }) => unit.id),
  extractInstructionSpy: vi.fn(),
  monitorForExternalSpy: vi.fn(() => () => {}),
  serializeUnitSpy: vi.fn((id: string) => ({
    id,
    name: `Unit ${id}`,
    sidc: TEST_SIDC,
    subUnits: [],
  })),
  monitorForElementsSpy: vi.fn(() => () => {}),
  onUnitActionSpy: vi.fn(),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: monitorForElementsSpy,
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/external/adapter", () => ({
  monitorForExternal: monitorForExternalSpy,
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item", () => ({
  extractInstruction: extractInstructionSpy,
}));

vi.mock("@/composables/scenarioActions", () => ({
  useUnitActions: () => ({
    onUnitAction: onUnitActionSpy,
  }),
}));

vi.mock("@/scenariostore/io", () => ({
  serializeUnit: serializeUnitSpy,
}));

vi.mock("@/importexport/convertUtils", async () => {
  return {
    addUnitHierarchy: addUnitHierarchySpy,
    orbatToText: (root: UnitLike) => [`${root.name}\n`],
    parseApplicationOrbat: (text: string) => {
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
  };
});

const OrbatSideStub = defineComponent({
  name: "OrbatSide",
  template: "<div />",
});

const OrbatPanelAddSideStub = defineComponent({
  name: "OrbatPanelAddSide",
  template: "<div />",
});

function makeScenario() {
  const parentUnit = {
    id: "u-1",
    name: "Parent",
    sidc: TEST_SIDC,
    subUnits: [],
    _isOpen: false,
  };

  return {
    scenario: {
      store: {
        state: {
          sides: [],
          sideMap: {},
          unitMap: {},
          currentTime: 0,
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      unitActions: {
        changeUnitParent: vi.fn(),
        recordUnitHierarchyMove: vi.fn(),
        addSide: vi.fn(),
        cloneUnit: vi.fn((id: string) => `${id}-clone`),
        getUnitById: vi.fn((id: string) => {
          if (id === "u-1") return parentUnit;
          return { id, _isOpen: false };
        }),
      },
      io: {
        stringifyObject: (obj: unknown) => JSON.stringify(obj),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    },
    parentUnit,
  };
}

function createClipboardEvent(
  type: "copy" | "paste",
  options: { applicationOrbat?: string; textPlain?: string } = {},
) {
  const setData = vi.fn();
  const getData = vi.fn((mime: string) => {
    if (mime === "application/orbat") return options.applicationOrbat ?? "";
    if (mime === "text/plain") return options.textPlain ?? "";
    return "";
  });

  const event = new Event(type, { bubbles: true, cancelable: true }) as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", {
    value: {
      setData,
      getData,
      types: ["application/orbat", "text/plain"],
    },
    configurable: true,
  });

  return { event, setData, getData };
}

function focusNonOrbatElement() {
  const el = document.createElement("button");
  el.id = "not-orbat-focus";
  document.body.appendChild(el);
  el.focus();
  return el;
}

function focusOrbatLikeElementWithIndent(unitId = "u-1") {
  const el = document.createElement("div");
  el.id = `ou-${unitId}`;
  el.dataset.indent = "1";
  el.tabIndex = -1;
  document.body.appendChild(el);
  el.focus();
  return el;
}

const wrappers: VueWrapper[] = [];

function makeDropTargetUnit(id: string, parentId: string): NUnit {
  return {
    id,
    _pid: parentId,
    _sid: "side-1",
    name: `Unit ${id}`,
    sidc: TEST_SIDC,
    subUnits: [],
  } as NUnit;
}

function mountPanel() {
  const { scenario, parentUnit } = makeScenario();
  const wrapper = mount(OrbatPanel, {
    attachTo: document.body,
    global: {
      provide: {
        [activeScenarioKey as symbol]: scenario,
        [activeParentKey as symbol]: ref(null),
      },
      stubs: {
        OrbatSide: OrbatSideStub,
        OrbatPanelAddSide: OrbatPanelAddSideStub,
      },
    },
  });

  wrappers.push(wrapper);
  return { wrapper, scenario, parentUnit };
}

function triggerUnitDrop(
  sourceUnit: NUnit,
  destinationUnit: NUnit,
  instruction: { type: "reorder-above" | "reorder-below" | "make-child" },
  input: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean } = {},
) {
  extractInstructionSpy.mockReturnValueOnce(instruction);
  const monitorArgs = (monitorForElementsSpy as any).mock.calls[0]?.[0] as
    | { onDrop: (args: unknown) => void }
    | undefined;
  expect(monitorArgs?.onDrop).toBeTypeOf("function");
  if (!monitorArgs) throw new Error("monitorForElements was not registered");
  monitorArgs.onDrop({
    source: { data: getUnitDragItem({ unit: sourceUnit }) },
    location: {
      initial: {
        input: {
          ctrlKey: input.ctrlKey ?? false,
          metaKey: input.metaKey ?? false,
          altKey: input.altKey ?? false,
        },
      },
      current: {
        dropTargets: [{ data: getUnitDragItem({ unit: destinationUnit }) }],
      },
    },
  });
}

function triggerDragStart(
  sourceData: ReturnType<typeof getUnitDragItem> | ReturnType<typeof getSideDragItem>,
  input: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean } = {},
) {
  const monitorArgs = (monitorForElementsSpy as any).mock.calls[0]?.[0] as
    | { onDragStart: (args: unknown) => void }
    | undefined;
  expect(monitorArgs?.onDragStart).toBeTypeOf("function");
  if (!monitorArgs) throw new Error("monitorForElements was not registered");
  monitorArgs.onDragStart({
    source: { data: sourceData },
    location: {
      initial: {
        input: {
          ctrlKey: input.ctrlKey ?? false,
          metaKey: input.metaKey ?? false,
          altKey: input.altKey ?? false,
        },
      },
    },
  });
}

function triggerExternalDrop(
  destinationData:
    | ReturnType<typeof getUnitDragItem>
    | ReturnType<typeof getSideDragItem>,
  instruction: { type: "reorder-above" | "reorder-below" | "make-child" },
  applicationOrbat: string,
) {
  extractInstructionSpy.mockReturnValueOnce(instruction);
  const monitorArgs = (monitorForExternalSpy as any).mock.calls[0]?.[0] as
    | { onDrop: (args: unknown) => void }
    | undefined;
  expect(monitorArgs?.onDrop).toBeTypeOf("function");
  if (!monitorArgs) throw new Error("monitorForExternal was not registered");
  monitorArgs.onDrop({
    source: {
      types: ["application/orbat"],
      getStringData: (mime: string) =>
        mime === "application/orbat" ? applicationOrbat : "",
    },
    location: {
      current: {
        dropTargets: [{ data: destinationData }],
      },
    },
  });
}

beforeEach(() => {
  setActivePinia(createPinia());
  const selected = useSelectedItems();
  selected.clear();
  addUnitHierarchySpy.mockReset();
  extractInstructionSpy.mockReset();
  monitorForExternalSpy.mockClear();
  serializeUnitSpy.mockClear();
  monitorForElementsSpy.mockClear();
  onUnitActionSpy.mockClear();
});

afterEach(() => {
  while (wrappers.length) {
    wrappers.pop()?.unmount();
  }
  document.body.innerHTML = "";
});

describe("OrbatPanel clipboard handling", () => {
  it("copy_uses_active_unit_when_focus_not_on_ou_node", () => {
    mountPanel();
    const selected = useSelectedItems();
    selected.activeUnitId.value = "u-1";
    focusNonOrbatElement();

    const { event, setData } = createClipboardEvent("copy");
    document.dispatchEvent(event);

    expect(serializeUnitSpy).toHaveBeenCalledWith("u-1", expect.any(Object), {
      newId: true,
    });
    expect(setData).toHaveBeenCalledWith("application/orbat", expect.any(String));
    expect(setData).toHaveBeenCalledWith("text/plain", expect.any(String));
    expect(event.defaultPrevented).toBe(true);
  });

  it("copy_falls_back_to_single_selected_unit", () => {
    mountPanel();
    const selected = useSelectedItems();
    selected.clear();
    selected.selectedUnitIds.value.add("u-1");
    focusNonOrbatElement();

    const { event, setData } = createClipboardEvent("copy");
    document.dispatchEvent(event);

    expect(serializeUnitSpy).toHaveBeenCalledWith("u-1", expect.any(Object), {
      newId: true,
    });
    expect(setData).toHaveBeenCalledWith("application/orbat", expect.any(String));
    expect(setData).toHaveBeenCalledWith("text/plain", expect.any(String));
    expect(event.defaultPrevented).toBe(true);
  });

  it("copy_works_when_event_target_has_data_indent", () => {
    mountPanel();
    const selected = useSelectedItems();
    selected.activeUnitId.value = "u-1";
    const target = focusOrbatLikeElementWithIndent("u-1");

    const { event, setData } = createClipboardEvent("copy");
    target.dispatchEvent(event);

    expect(serializeUnitSpy).toHaveBeenCalledWith("u-1", expect.any(Object), {
      newId: true,
    });
    expect(setData).toHaveBeenCalledWith("application/orbat", expect.any(String));
    expect(setData).toHaveBeenCalledWith("text/plain", expect.any(String));
    expect(event.defaultPrevented).toBe(true);
  });

  it("paste_works_with_application_orbat_when_focus_missing_but_active_unit_exists", () => {
    const { scenario, parentUnit } = mountPanel();
    const selected = useSelectedItems();
    selected.activeUnitId.value = "u-1";
    focusNonOrbatElement();

    const payload = JSON.stringify([
      { id: "u-new", name: "Pasted", sidc: TEST_SIDC, subUnits: [] },
    ]);
    const { event } = createClipboardEvent("paste", { applicationOrbat: payload });
    document.dispatchEvent(event);

    expect(addUnitHierarchySpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u-new" }),
      "u-1",
      scenario,
    );
    expect(parentUnit._isOpen).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("paste_falls_back_to_text_plain_json_unit_array", () => {
    const { scenario } = mountPanel();
    const selected = useSelectedItems();
    selected.activeUnitId.value = "u-1";
    focusNonOrbatElement();

    const payload = JSON.stringify([
      { id: "u-plain", name: "Pasted", sidc: TEST_SIDC, subUnits: [] },
    ]);
    const { event } = createClipboardEvent("paste", {
      applicationOrbat: "",
      textPlain: payload,
    });
    document.dispatchEvent(event);

    expect(addUnitHierarchySpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u-plain" }),
      "u-1",
      scenario,
    );
    expect(event.defaultPrevented).toBe(true);
  });

  it("paste_ignores_invalid_text_plain_json", () => {
    mountPanel();
    const selected = useSelectedItems();
    selected.activeUnitId.value = "u-1";
    focusNonOrbatElement();

    const { event } = createClipboardEvent("paste", {
      applicationOrbat: "",
      textPlain: '{"bad":true}',
    });
    document.dispatchEvent(event);

    expect(addUnitHierarchySpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("paste_no_parent_target_does_nothing", () => {
    mountPanel();
    const selected = useSelectedItems();
    selected.clear();
    focusNonOrbatElement();

    const payload = JSON.stringify([
      { id: "u-new", name: "Pasted", sidc: TEST_SIDC, subUnits: [] },
    ]);
    const { event } = createClipboardEvent("paste", { applicationOrbat: payload });
    document.dispatchEvent(event);

    expect(addUnitHierarchySpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("OrbatPanel unit drag-and-drop hierarchy recording", () => {
  it("external_drop_below_preserves_incoming_order_at_drop_indicator", () => {
    const { scenario } = mountPanel();
    scenario.store.state.unitMap = {
      "u-1": makeDropTargetUnit("u-1", "group-1"),
    };

    const payload = JSON.stringify([
      { id: "u-new-1", name: "First", sidc: TEST_SIDC, subUnits: [] },
      { id: "u-new-2", name: "Second", sidc: TEST_SIDC, subUnits: [] },
    ]);

    triggerExternalDrop(
      getUnitDragItem({ unit: makeDropTargetUnit("u-1", "group-1") }),
      { type: "reorder-below" },
      payload,
    );

    expect(addUnitHierarchySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: "u-new-1" }),
      "group-1",
      scenario,
      { newIds: false },
    );
    expect(addUnitHierarchySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: "u-new-2" }),
      "group-1",
      scenario,
      { newIds: false },
    );
    expect(scenario.unitActions.changeUnitParent).toHaveBeenNthCalledWith(
      1,
      "u-new-1",
      "u-1",
      "below",
    );
    expect(scenario.unitActions.changeUnitParent).toHaveBeenNthCalledWith(
      2,
      "u-new-2",
      "u-new-1",
      "below",
    );
  });

  it("external_drop_uses_inserted_ids_when_import_collides", () => {
    const { scenario } = mountPanel();
    scenario.store.state.unitMap = {
      "u-1": makeDropTargetUnit("u-1", "group-1"),
      "u-new-1": makeDropTargetUnit("u-new-1", "group-1"),
    };
    addUnitHierarchySpy
      .mockImplementationOnce(() => "u-new-1-imported")
      .mockImplementationOnce(() => "u-new-2");

    const payload = JSON.stringify([
      { id: "u-new-1", name: "First", sidc: TEST_SIDC, subUnits: [] },
      { id: "u-new-2", name: "Second", sidc: TEST_SIDC, subUnits: [] },
    ]);

    triggerExternalDrop(
      getUnitDragItem({ unit: makeDropTargetUnit("u-1", "group-1") }),
      { type: "reorder-below" },
      payload,
    );

    expect(scenario.unitActions.changeUnitParent).toHaveBeenNthCalledWith(
      1,
      "u-new-1-imported",
      "u-1",
      "below",
    );
    expect(scenario.unitActions.changeUnitParent).toHaveBeenNthCalledWith(
      2,
      "u-new-2",
      "u-new-1-imported",
      "below",
    );
  });

  it("records timed hierarchy move when isRecordingHierarchy is enabled", () => {
    const { scenario } = mountPanel();
    useRecordingStore().isRecordingHierarchy = true;

    const sourceUnit = {
      id: "u-1",
      name: "Source",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;
    const destinationUnit = {
      id: "u-2",
      name: "Target",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    triggerUnitDrop(sourceUnit, destinationUnit, { type: "reorder-above" });

    expect(scenario.unitActions.recordUnitHierarchyMove).toHaveBeenCalledWith(
      "u-1",
      "u-2",
      "above",
    );
    expect(scenario.unitActions.changeUnitParent).not.toHaveBeenCalled();
  });

  it("keeps base parent change when isRecordingHierarchy is disabled", () => {
    const { scenario } = mountPanel();
    useRecordingStore().isRecordingHierarchy = false;

    const sourceUnit = {
      id: "u-1",
      name: "Source",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;
    const destinationUnit = {
      id: "u-2",
      name: "Target",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    triggerUnitDrop(sourceUnit, destinationUnit, { type: "reorder-below" });

    expect(scenario.unitActions.changeUnitParent).toHaveBeenCalledWith(
      "u-1",
      "u-2",
      "below",
    );
    expect(scenario.unitActions.recordUnitHierarchyMove).not.toHaveBeenCalled();
  });

  it("records timed hierarchy move on the cloned unit for duplicate-with-state drops", () => {
    const { scenario } = mountPanel();
    useRecordingStore().isRecordingHierarchy = true;

    const sourceUnit = {
      id: "u-1",
      name: "Source",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;
    const destinationUnit = {
      id: "u-2",
      name: "Target",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    triggerUnitDrop(
      sourceUnit,
      destinationUnit,
      { type: "make-child" },
      {
        ctrlKey: true,
        altKey: true,
      },
    );

    expect(scenario.unitActions.cloneUnit).toHaveBeenCalledWith("u-1", {
      includeSubordinates: true,
      includeState: true,
    });
    expect(scenario.unitActions.recordUnitHierarchyMove).toHaveBeenCalledWith(
      "u-1-clone",
      "u-2",
      "on",
    );
    expect(scenario.time.setCurrentTime).toHaveBeenCalledWith(0);
  });

  it("shows hierarchy recording banner during unit drag when enabled", async () => {
    const { wrapper } = mountPanel();
    useRecordingStore().isRecordingHierarchy = true;

    const sourceUnit = {
      id: "u-1",
      name: "Source",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    triggerDragStart(getUnitDragItem({ unit: sourceUnit }));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Recording hierarchy changes during drag and drop");
    expect(wrapper.find('[data-testid="orbat-hierarchy-overlay"]').exists()).toBe(true);
  });

  it("shows copy mode banner while hierarchy recording remains in the panel overlay", async () => {
    const { wrapper } = mountPanel();
    useRecordingStore().isRecordingHierarchy = true;

    const sourceUnit = {
      id: "u-1",
      name: "Source",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    triggerDragStart(getUnitDragItem({ unit: sourceUnit }), {
      ctrlKey: true,
      altKey: true,
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Dragging copy mode");
    expect(wrapper.text()).toContain("(including state)");
    expect(wrapper.text()).toContain("Recording hierarchy changes during drag and drop");
    expect(wrapper.find('[data-testid="orbat-hierarchy-overlay"]').exists()).toBe(true);
  });

  it("dragging an unselected unit does not move previously selected units", () => {
    const { scenario } = mountPanel();
    const selected = useSelectedItems();
    // Select unit A
    selected.selectedUnitIds.value.add("u-A");

    const sourceUnit = {
      id: "u-B",
      name: "Source B",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;
    const destinationUnit = {
      id: "u-2",
      name: "Target",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    // Drag unit B (which is NOT selected) onto unit 2
    triggerUnitDrop(sourceUnit, destinationUnit, { type: "make-child" });

    // Only the dragged unit (u-B) should be moved, not the selected unit (u-A)
    expect(scenario.unitActions.changeUnitParent).toHaveBeenCalledTimes(1);
    expect(scenario.unitActions.changeUnitParent).toHaveBeenCalledWith(
      "u-B",
      "u-2",
      "on",
    );
  });

  it("dragging a selected unit also moves other selected units", () => {
    const { scenario } = mountPanel();
    const selected = useSelectedItems();
    // Select both unit A and unit B
    selected.selectedUnitIds.value.add("u-A");
    selected.selectedUnitIds.value.add("u-B");

    const sourceUnit = {
      id: "u-B",
      name: "Source B",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;
    const destinationUnit = {
      id: "u-2",
      name: "Target",
      sidc: TEST_SIDC,
      subUnits: [],
      _pid: "group-1",
      _sid: "side-1",
    } as NUnit;

    // Drag unit B (which IS selected) onto unit 2
    triggerUnitDrop(sourceUnit, destinationUnit, { type: "make-child" });

    // Both selected units should be moved
    expect(scenario.unitActions.changeUnitParent).toHaveBeenCalledTimes(2);
  });

  it("does not show hierarchy recording banner for non-unit drags", async () => {
    const { wrapper } = mountPanel();
    useRecordingStore().isRecordingHierarchy = true;

    triggerDragStart(
      getSideDragItem({
        side: { id: "side-1", name: "Blue", groups: [], subUnits: [] } as any,
      }),
    );
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain(
      "Recording hierarchy changes during drag and drop",
    );
    expect(wrapper.find('[data-testid="orbat-hierarchy-overlay"]').exists()).toBe(false);
  });
});
