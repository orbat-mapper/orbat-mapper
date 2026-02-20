// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import { activeParentKey, activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";

const TEST_SIDC = "10031000001211000000";

type UnitLike = {
  id: string;
  name: string;
  sidc: string;
  subUnits: UnitLike[];
};

const { addUnitHierarchySpy, serializeUnitSpy, monitorForElementsSpy, onUnitActionSpy } =
  vi.hoisted(() => ({
    addUnitHierarchySpy: vi.fn(),
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
          currentTime: 0,
        },
        groupUpdate: (fn: () => void) => fn(),
      },
      unitActions: {
        changeUnitParent: vi.fn(),
        addSide: vi.fn(),
        cloneUnit: vi.fn(),
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

beforeEach(() => {
  const selected = useSelectedItems();
  selected.clear();
  addUnitHierarchySpy.mockReset();
  serializeUnitSpy.mockClear();
  monitorForElementsSpy.mockClear();
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
