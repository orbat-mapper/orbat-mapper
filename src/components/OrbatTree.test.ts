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

function makeNestedTree(): {
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
} {
  const parent = makeUnit("u-parent");
  parent._isOpen = true;
  parent.subUnits = ["u-child-a"];

  const childA = makeUnit("u-child-a");
  childA._pid = "u-parent";

  return {
    units: [parent.id],
    unitMap: {
      [parent.id]: parent,
      [childA.id]: childA,
    },
  };
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

describe("OrbatTree reactivity", () => {
  it("updates when a unit is added to the reactive unitMap (clone)", async () => {
    const { units, unitMap } = makeFlatTree(3);
    const WrapperComponent = defineComponent({
      components: { OrbatTree },
      setup() {
        const reactiveUnits = ref(units);
        const reactiveUnitMap = ref(unitMap);
        return { reactiveUnits, reactiveUnitMap };
      },
      template: `<OrbatTree :units="reactiveUnits" :unit-map="reactiveUnitMap" :virtualization-threshold="999" />`,
    });

    const wrapper = mount(WrapperComponent, {
      global: { stubs: { OrbatTreeItem: OrbatTreeItemStub } },
    });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);

    // Simulate clone: add a new unit to the reactive data in-place
    const newUnit = makeUnit("u-clone");
    wrapper.vm.reactiveUnitMap["u-clone"] = newUnit;
    wrapper.vm.reactiveUnits.push("u-clone");
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4);
    expect(wrapper.text()).toContain("u-clone");
  });

  it("updates when a unit is removed from the reactive unitMap (delete)", async () => {
    const { units, unitMap } = makeFlatTree(3);
    const WrapperComponent = defineComponent({
      components: { OrbatTree },
      setup() {
        const reactiveUnits = ref(units);
        const reactiveUnitMap = ref(unitMap);
        return { reactiveUnits, reactiveUnitMap };
      },
      template: `<OrbatTree :units="reactiveUnits" :unit-map="reactiveUnitMap" :virtualization-threshold="999" />`,
    });

    const wrapper = mount(WrapperComponent, {
      global: { stubs: { OrbatTreeItem: OrbatTreeItemStub } },
    });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);

    // Simulate delete: remove a unit from the reactive data in-place
    delete wrapper.vm.reactiveUnitMap["u-1"];
    wrapper.vm.reactiveUnits.splice(1, 1);
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    expect(wrapper.text()).not.toContain("u-1");
  });

  it("updates when nested subUnits are mutated in place", async () => {
    const { units, unitMap } = makeNestedTree();
    const WrapperComponent = defineComponent({
      components: { OrbatTree },
      setup() {
        const reactiveUnits = ref(units);
        const reactiveUnitMap = ref(unitMap);
        return { reactiveUnits, reactiveUnitMap };
      },
      template: `<OrbatTree :units="reactiveUnits" :unit-map="reactiveUnitMap" :virtualization-threshold="999" />`,
    });

    const wrapper = mount(WrapperComponent, {
      global: { stubs: { OrbatTreeItem: OrbatTreeItemStub } },
    });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);

    const childB = makeUnit("u-child-b");
    childB._pid = "u-parent";
    wrapper.vm.reactiveUnitMap["u-child-b"] = childB;
    wrapper.vm.reactiveUnitMap["u-parent"].subUnits.push("u-child-b");
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
    expect(wrapper.text()).toContain("u-child-b");

    delete wrapper.vm.reactiveUnitMap["u-child-a"];
    const childAIndex =
      wrapper.vm.reactiveUnitMap["u-parent"].subUnits.indexOf("u-child-a");
    wrapper.vm.reactiveUnitMap["u-parent"].subUnits.splice(childAIndex, 1);
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    expect(wrapper.text()).not.toContain("u-child-a");
  });

  it("updates filtered results when unit names are mutated in place", async () => {
    const { units, unitMap } = makeFlatTree(2);
    unitMap["u-0"].name = "alpha";
    unitMap["u-1"].name = "bravo";
    const WrapperComponent = defineComponent({
      components: { OrbatTree },
      setup() {
        const reactiveUnits = ref(units);
        const reactiveUnitMap = ref(unitMap);
        const filterQuery = ref("match");
        return { reactiveUnits, reactiveUnitMap, filterQuery };
      },
      template: `<OrbatTree :units="reactiveUnits" :unit-map="reactiveUnitMap" :filter-query="filterQuery" :virtualization-threshold="999" />`,
    });

    const wrapper = mount(WrapperComponent, {
      global: { stubs: { OrbatTreeItem: OrbatTreeItemStub } },
    });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0);

    wrapper.vm.reactiveUnitMap["u-1"].name = "beta match";
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    expect(wrapper.text()).toContain("beta match");
  });

  it("updates location-filtered results when unit location state is mutated in place", async () => {
    const { units, unitMap } = makeFlatTree(1);
    unitMap["u-0"].name = "alpha";
    unitMap["u-0"]._state = null;
    const WrapperComponent = defineComponent({
      components: { OrbatTree },
      setup() {
        const reactiveUnits = ref(units);
        const reactiveUnitMap = ref(unitMap);
        return { reactiveUnits, reactiveUnitMap };
      },
      template: `<OrbatTree :units="reactiveUnits" :unit-map="reactiveUnitMap" :location-filter="true" :virtualization-threshold="999" />`,
    });

    const wrapper = mount(WrapperComponent, {
      global: { stubs: { OrbatTreeItem: OrbatTreeItemStub } },
    });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0);

    wrapper.vm.reactiveUnitMap["u-0"]._state = { location: [12, 34] } as NUnit["_state"];
    await nextTick();

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    expect(wrapper.text()).toContain("alpha");
  });
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
