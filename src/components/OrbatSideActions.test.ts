// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import OrbatSide from "@/components/OrbatSide.vue";
import OrbatSideGroup from "@/components/OrbatSideGroup.vue";
import { activeScenarioKey } from "@/components/injects";
import { SideActions } from "@/types/constants";

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: vi.fn(() => () => {}),
  dropTargetForElements: vi.fn(() => () => {}),
}));
vi.mock("@atlaskit/pragmatic-drag-and-drop/combine", () => ({
  combine: vi.fn(
    (...cleanups: Array<() => void>) =>
      () =>
        cleanups.forEach((fn) => fn()),
  ),
}));
vi.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item", () => ({
  attachInstruction: vi.fn((data: unknown) => data),
  extractInstruction: vi.fn(() => null),
}));

function makeFixture() {
  const side = {
    id: "s1",
    name: "Blue",
    groups: ["g1"],
    subUnits: ["u1"],
    _isOpen: false,
    isHidden: false,
    locked: false,
    symbolOptions: {},
  };
  const group = {
    id: "g1",
    _pid: "s1",
    name: "Group 1",
    subUnits: ["u3"],
    _isOpen: false,
    isHidden: false,
    locked: false,
    symbolOptions: {},
  };
  const unitMap: Record<string, any> = {
    u1: {
      id: "u1",
      name: "u1",
      sidc: "10031000001211000000",
      subUnits: ["u2"],
      _pid: "s1",
    },
    u2: { id: "u2", name: "u2", sidc: "10031000001211000000", subUnits: [], _pid: "u1" },
    u3: {
      id: "u3",
      name: "u3",
      sidc: "10031000001211000000",
      subUnits: ["u4"],
      _pid: "g1",
    },
    u4: { id: "u4", name: "u4", sidc: "10031000001211000000", subUnits: [], _pid: "u3" },
  };
  unitMap.u1._isOpen = false;
  unitMap.u2._isOpen = false;
  unitMap.u3._isOpen = false;
  unitMap.u4._isOpen = false;

  const state = {
    sideMap: { [side.id]: side },
    sideGroupMap: { [group.id]: group },
    unitMap,
  };

  const walkSubUnits = (
    parentUnitId: string,
    callback: (unit: any) => void,
    options: { includeParent?: boolean } = {},
  ) => {
    const walk = (id: string) => {
      const unit = state.unitMap[id];
      callback(unit);
      unit.subUnits.forEach((childId: string) => walk(childId));
    };
    if (options.includeParent) walk(parentUnitId);
    else state.unitMap[parentUnitId].subUnits.forEach((id: string) => walk(id));
  };

  const walkSide = (sideId: string, callback: (unit: any) => void) => {
    const sideItem = state.sideMap[sideId];
    const walk = (id: string) => {
      const unit = state.unitMap[id];
      callback(unit);
      unit.subUnits.forEach((childId: string) => walk(childId));
    };
    sideItem.subUnits.forEach((id: string) => walk(id));
    sideItem.groups.forEach((groupId: string) => {
      state.sideGroupMap[groupId].subUnits.forEach((id: string) => walk(id));
    });
  };

  const scenario = {
    store: { state },
    unitActions: {
      walkSide,
      walkSubUnits,
      createSubordinateUnit: vi.fn(),
      addSideGroup: vi.fn(),
      deleteSideGroup: vi.fn(),
      reorderSideGroup: vi.fn(),
      updateSideGroup: vi.fn(),
      cloneSideGroup: vi.fn(),
    },
  };

  return { side, group, unitMap, scenario };
}

const SideDropdownMenuStub = defineComponent({
  name: "SideDropdownMenu",
  emits: ["action"],
  template: `
    <div>
      <button data-testid="expand-side" @click="$emit('action', 'Expand')">Expand</button>
      <button data-testid="collapse-side" @click="$emit('action', 'Collapse')">Collapse</button>
    </div>
  `,
});

const SideGroupDropdownMenuStub = defineComponent({
  name: "SideGroupDropdownMenu",
  emits: ["action"],
  template: `
    <div>
      <button data-testid="expand-group" @click="$emit('action', 'Expand')">Expand</button>
      <button data-testid="collapse-group" @click="$emit('action', 'Collapse')">Collapse</button>
    </div>
  `,
});

describe("OrbatSide/OrbatSideGroup expand-collapse actions", () => {
  it("side expand/collapse updates side, groups, and all units", async () => {
    const { side, group, unitMap, scenario } = makeFixture();
    const wrapper = mount(OrbatSide, {
      props: { side },
      global: {
        provide: { [activeScenarioKey as symbol]: scenario },
        stubs: {
          SideDropdownMenu: SideDropdownMenuStub,
          OrbatTree: true,
          OrbatSideGroup: true,
          FilterQueryInput: true,
          EditSideForm: true,
          TreeDropIndicator: true,
          Toggle: true,
          IconDrag: true,
          IconEye: true,
          IconEyeOff: true,
          IconFilterVariant: true,
          IconFilterVariantPlus: true,
          IconLockOutline: true,
          ChevronUpIcon: true,
        },
      },
    });

    await wrapper.find('[data-testid="expand-side"]').trigger("click");
    expect(side._isOpen).toBe(true);
    expect(group._isOpen).toBe(true);
    expect(unitMap.u1._isOpen).toBe(true);
    expect(unitMap.u2._isOpen).toBe(true);
    expect(unitMap.u3._isOpen).toBe(true);
    expect(unitMap.u4._isOpen).toBe(true);

    await wrapper.find('[data-testid="collapse-side"]').trigger("click");
    expect(side._isOpen).toBe(false);
    expect(group._isOpen).toBe(false);
    expect(unitMap.u1._isOpen).toBe(false);
    expect(unitMap.u2._isOpen).toBe(false);
    expect(unitMap.u3._isOpen).toBe(false);
    expect(unitMap.u4._isOpen).toBe(false);
  });

  it("side-group expand/collapse updates group and all group units", async () => {
    const { group, unitMap, scenario } = makeFixture();
    const wrapper = mount(OrbatSideGroup, {
      props: { group },
      global: {
        provide: { [activeScenarioKey as symbol]: scenario },
        stubs: {
          SideGroupDropdownMenu: SideGroupDropdownMenuStub,
          OrbatTree: true,
          EditSideGroupForm: true,
          SecondaryButton: true,
          TreeDropIndicator: true,
          IconDrag: true,
          IconEye: true,
          IconEyeOff: true,
          IconLockOutline: true,
          ChevronUpIcon: true,
        },
      },
    });

    await wrapper.find('[data-testid="expand-group"]').trigger("click");
    expect(group._isOpen).toBe(true);
    expect(unitMap.u3._isOpen).toBe(true);
    expect(unitMap.u4._isOpen).toBe(true);

    await wrapper.find('[data-testid="collapse-group"]').trigger("click");
    expect(group._isOpen).toBe(false);
    expect(unitMap.u3._isOpen).toBe(false);
    expect(unitMap.u4._isOpen).toBe(false);
  });

  it("keeps expand/collapse action identifiers stable", () => {
    expect(SideActions.Expand).toBe("Expand");
    expect(SideActions.Collapse).toBe("Collapse");
  });
});
