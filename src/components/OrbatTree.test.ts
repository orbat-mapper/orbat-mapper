// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import OrbatTree from "@/components/OrbatTree.vue";
import type { EntityId } from "@/types/base";
import type { NUnit } from "@/types/internalModels";
import { useSelectedItems } from "@/stores/selectedStore";
import * as orbatNav from "@/modules/scenarioeditor/orbatNav";
vi.mock("@/stores/settingsStore", () => ({
  useSettingsStore: () => ({
    orbatIconSize: ref(20),
    orbatShortName: ref(false),
  }),
}));

const TEST_SIDC = "10031000001211000000";

function makeUnit(id: EntityId): NUnit {
  return {
    id,
    name: id,
    sidc: TEST_SIDC,
    subUnits: [],
    _pid: "side-root",
    _sid: "side-root",
  };
}

function makeFlatTree(count: number): {
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
} {
  const units: EntityId[] = [];
  const unitMap: Record<EntityId, NUnit> = {};

  for (let i = 0; i < count; i += 1) {
    const id = `u-${i}`;
    units.push(id);
    unitMap[id] = makeUnit(id);
  }

  return { units, unitMap };
}

const OrbatTreeItemStub = defineComponent({
  name: "OrbatTreeItem",
  props: {
    item: { type: Object, required: true },
  },
  template: `<div class="orbat-tree-item-stub">{{ item.unit.name }}</div>`,
});

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
});

beforeEach(() => {
  const selected = useSelectedItems();
  selected.clear();
  vi.clearAllMocks();
});

describe("OrbatTree virtualization", () => {
  it("renders all flattened items when virtualization is disabled", async () => {
    const { units, unitMap } = makeFlatTree(5);
    const wrapper = mount(OrbatTree, {
      props: {
        units,
        unitMap,
        virtualizationThreshold: 999,
      },
      global: {
        stubs: {
          OrbatTreeItem: OrbatTreeItemStub,
        },
      },
    });

    await nextTick();

    expect(wrapper.find("[data-reka-virtualizer]").exists()).toBe(false);
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(5);
  });

  it("renders virtualized tree branch when threshold is met", async () => {
    const { units, unitMap } = makeFlatTree(250);
    const wrapper = mount(OrbatTree, {
      props: {
        units,
        unitMap,
        virtualizationThreshold: 1,
      },
      global: {
        stubs: {
          OrbatTreeItem: OrbatTreeItemStub,
        },
      },
    });

    await nextTick();
    await nextTick();

    const virtualizer = wrapper.find("[data-reka-virtualizer]");
    expect(virtualizer.exists()).toBe(true);
    expect(virtualizer.attributes("style")).toContain("height:");
    expect(virtualizer.attributes("style")).not.toContain("height: 0px");

    const renderedTreeItems = wrapper.findAll('[role="treeitem"]');
    expect(renderedTreeItems.length).toBeLessThan(250);
  });

  it("moves focus only when ArrowDown is pressed on the true last item", async () => {
    const moveSpy = vi
      .spyOn(orbatNav, "moveFocusToNearestOrbatNavTarget")
      .mockReturnValue(true);
    const { units, unitMap } = makeFlatTree(3);
    const wrapper = mount(OrbatTree, {
      props: {
        units,
        unitMap,
        virtualizationThreshold: 999,
      },
      global: {
        stubs: {
          OrbatTreeItem: OrbatTreeItemStub,
        },
      },
    });

    await nextTick();

    const items = wrapper.findAll('[role="treeitem"]');
    const firstEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    items[0].element.dispatchEvent(firstEvent);
    expect(moveSpy).not.toHaveBeenCalled();

    const lastEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    items[2].element.dispatchEvent(lastEvent);
    expect(moveSpy).toHaveBeenCalledTimes(1);
    expect(lastEvent.defaultPrevented).toBe(true);
  });

  it("reveals unit by scrolling it into view in virtual mode", async () => {
    const { units, unitMap } = makeFlatTree(220);
    const wrapper = mount(OrbatTree, {
      props: {
        units,
        unitMap,
        virtualizationThreshold: 1,
      },
      global: {
        stubs: {
          OrbatTreeItem: OrbatTreeItemStub,
        },
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find("[data-reka-virtualizer]").exists()).toBe(true);
    const revealTarget = document.createElement("div");
    revealTarget.id = "ou-u-180";
    document.body.appendChild(revealTarget);
    const revealSpy = vi.spyOn(revealTarget, "scrollIntoView");

    const selected = useSelectedItems();
    selected.orbatRevealUnitId.value = "u-180";
    await nextTick();
    await nextTick();

    expect(selected.orbatRevealUnitId.value).toBeNull();
    expect(revealSpy).toHaveBeenCalledWith({ block: "center" });
    revealTarget.remove();
  });

  it("preserves keyboard focus when switching between virtual and non-virtual branches", async () => {
    const { units, unitMap } = makeFlatTree(10);
    const wrapper = mount(OrbatTree, {
      props: {
        units,
        unitMap,
        virtualizationThreshold: 1,
      },
      global: {
        stubs: {
          OrbatTreeItem: OrbatTreeItemStub,
        },
      },
    });

    await nextTick();
    await nextTick();

    const focusedId = "ou-u-3";
    const tempFocusedEl = document.createElement("button");
    tempFocusedEl.id = focusedId;
    document.body.appendChild(tempFocusedEl);
    tempFocusedEl.focus();
    expect(document.activeElement?.id).toBe(focusedId);

    const restoreEl = document.createElement("div");
    const restoreFocusSpy = vi.fn();
    restoreEl.focus = restoreFocusSpy;
    const getByIdSpy = vi
      .spyOn(document, "getElementById")
      .mockImplementation((id: string) => {
        if (id === focusedId) return restoreEl;
        return null;
      });

    await wrapper.setProps({ virtualizationThreshold: 999 });
    await nextTick();
    await nextTick();

    expect(wrapper.find("[data-reka-virtualizer]").exists()).toBe(false);
    expect(getByIdSpy).toHaveBeenCalledWith(focusedId);
    expect(restoreFocusSpy).toHaveBeenCalledTimes(1);
    getByIdSpy.mockRestore();
    tempFocusedEl.remove();
  });
});
