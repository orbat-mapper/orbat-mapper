// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createEventHook } from "@vueuse/core";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, reactive } from "vue";
import GridEditView from "./GridEditView.vue";
import { activeScenarioKey, searchActionsKey, sidcModalKey } from "@/components/injects";
import type { EntityId } from "@/types/base";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels";

const { sendSpy } = vi.hoisted(() => ({
  sendSpy: vi.fn(),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({
    send: sendSpy,
  }),
}));

vi.mock("@tanstack/vue-virtual", async () => {
  const { computed, ref, unref } = await import("vue");
  const viewportRows = 24;
  const startIndex = ref(0);

  return {
    useVirtualizer: (options: any) =>
      computed(() => {
        const resolved = unref(options);
        const count: number = resolved.count ?? 0;
        const overscan: number = resolved.overscan ?? 0;
        const estimateSize: number = resolved.estimateSize?.() ?? 48;

        const start = Math.max(0, startIndex.value - overscan);
        const end = Math.min(count, startIndex.value + viewportRows + overscan);

        const virtualItems: Array<{
          key: number;
          index: number;
          start: number;
          end: number;
        }> = [];
        for (let index = start; index < end; index += 1) {
          virtualItems.push({
            key: index,
            index,
            start: index * estimateSize,
            end: (index + 1) * estimateSize,
          });
        }

        return {
          getVirtualItems: () => virtualItems,
          getTotalSize: () => count * estimateSize,
          scrollToIndex: (index: number) => {
            startIndex.value = Math.max(0, index - Math.floor(viewportRows / 2));
          },
        };
      }),
  };
});

const TEST_SIDC = "10031000001211000000";

const FilterQueryInputStub = defineComponent({
  name: "FilterQueryInput",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  template: `
    <input
      data-testid="filter-query"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
});

const BaseButtonStub = defineComponent({
  name: "BaseButton",
  emits: ["click"],
  template: `<button type="button" @click="$emit('click', $event)"><slot /></button>`,
});

const CheckboxDropdownStub = defineComponent({
  name: "CheckboxDropdown",
  template: `<button type="button"><slot /></button>`,
});

const GridUnitRowStub = defineComponent({
  name: "GridUnitRow",
  props: {
    unit: { type: Object, required: true },
    columns: { type: Array, required: true },
    itemIndex: { type: Number, required: true },
    isActive: { type: Boolean, required: false },
  },
  emits: ["active-item"],
  template: `
    <tr data-testid="grid-row" data-row-type="unit">
      <td />
      <td>
        <button :id="\`cell-\${itemIndex}-0\`" type="button" tabindex="0">unit-label</button>
      </td>
      <td v-for="(column, colIndex) in columns" :key="column.value">
        <button
          class="editable-cell"
          :id="\`cell-\${itemIndex}-\${colIndex + 1}\`"
          type="button"
          tabindex="0"
          @focus="$emit('active-item', column.value)"
        >
          {{ unit[column.value] ?? '' }}
        </button>
      </td>
    </tr>
  `,
});

const GridSideRowStub = defineComponent({
  name: "GridSideRow",
  props: {
    side: { type: Object, required: true },
    itemIndex: { type: Number, required: true },
  },
  emits: ["active-item"],
  template: `
    <tr data-testid="grid-row" data-row-type="side">
      <td />
      <td>
        <button :id="\`cell-\${itemIndex}-0\`" type="button" tabindex="0">side-label</button>
      </td>
      <td>
        <button
          class="editable-cell"
          :id="\`cell-\${itemIndex}-1\`"
          type="button"
          tabindex="0"
          @focus="$emit('active-item', 'name')"
        >
          {{ side.name }}
        </button>
      </td>
    </tr>
  `,
});

const GridSideGroupRowStub = defineComponent({
  name: "GridSideGroupRow",
  props: {
    sideGroup: { type: Object, required: true },
    itemIndex: { type: Number, required: true },
  },
  emits: ["active-item"],
  template: `
    <tr data-testid="grid-row" data-row-type="sidegroup">
      <td />
      <td>
        <button :id="\`cell-\${itemIndex}-0\`" type="button" tabindex="0">group-label</button>
      </td>
      <td>
        <button
          class="editable-cell"
          :id="\`cell-\${itemIndex}-1\`"
          type="button"
          tabindex="0"
          @focus="$emit('active-item', 'name')"
        >
          {{ sideGroup.name }}
        </button>
      </td>
    </tr>
  `,
});

const mountedWrappers: VueWrapper<any>[] = [];

function createSearchActionHooks() {
  return {
    onUnitSelectHook: createEventHook<{
      unitId: EntityId;
      options?: { noZoom?: boolean };
    }>(),
    onLayerSelectHook: createEventHook<{ layerId: string }>(),
    onImageLayerSelectHook: createEventHook<{ layerId: string }>(),
    onFeatureSelectHook: createEventHook<{ featureId: string; layerId: string }>(),
    onEventSelectHook: createEventHook<any>(),
    onPlaceSelectHook: createEventHook<any>(),
    onScenarioActionHook: createEventHook<any>(),
  };
}

function makeScenario(unitCount: number) {
  const side = {
    id: "side-1",
    name: "Blue side",
    shortName: "BLUE",
    standardIdentity: "3",
    groups: ["sg-1"],
    subUnits: [],
  } as NSide;

  const sideGroup = {
    id: "sg-1",
    name: "Main group",
    shortName: "MAIN",
    _pid: side.id,
    subUnits: [],
  } as NSideGroup;

  const unitMap: Record<EntityId, NUnit> = {};
  for (let i = 0; i < unitCount; i += 1) {
    const id = `u-${i}`;
    sideGroup.subUnits.push(id);
    unitMap[id] = {
      id,
      name: `Unit ${i}`,
      shortName: `U${i}`,
      sidc: TEST_SIDC,
      externalUrl: "",
      description: "",
      subUnits: [],
      _pid: sideGroup.id,
      _sid: side.id,
      _isOpen: true,
      symbolOptions: {},
      reinforcedStatus: "None",
    } as NUnit;
  }

  const state = reactive({
    sides: [side.id],
    sideMap: { [side.id]: side },
    sideGroupMap: { [sideGroup.id]: sideGroup },
    unitMap,
  });

  const unitActions = {
    updateUnit: vi.fn(),
    updateSide: vi.fn(),
    updateSideGroup: vi.fn(),
    createSubordinateUnit: vi.fn(),
    cloneUnit: vi.fn(),
    deleteUnit: vi.fn(),
    deleteSide: vi.fn(),
    deleteSideGroup: vi.fn(),
    walkSubUnits: (
      unitId: EntityId,
      callback: (unit: NUnit) => void,
      options: { includeParent?: boolean } = {},
    ) => {
      const stack = [unitId];
      while (stack.length) {
        const currentId = stack.pop()!;
        const unit = state.unitMap[currentId];
        if (!unit) continue;
        if (options.includeParent || currentId !== unitId) callback(unit);
        unit.subUnits.forEach((id) => stack.push(id));
      }
    },
    getUnitHierarchy: () => ({ parents: [], side, sideGroup }),
    getCombinedSymbolOptions: vi.fn(() => ({})),
  };

  return {
    scenario: {
      store: { state },
      unitActions,
    },
    side,
    sideGroup,
  };
}

async function flushTicks(rounds = 3) {
  for (let i = 0; i < rounds; i += 1) {
    await nextTick();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

async function setVirtualViewport(wrapper: VueWrapper<any>) {
  const scrollElement = wrapper.find(".overflow-auto").element as HTMLElement;

  Object.defineProperty(scrollElement, "clientHeight", {
    configurable: true,
    value: 480,
  });
  Object.defineProperty(scrollElement, "clientWidth", {
    configurable: true,
    value: 1024,
  });

  scrollElement.getBoundingClientRect = vi.fn(
    () =>
      ({
        width: 1024,
        height: 480,
        top: 0,
        left: 0,
        right: 1024,
        bottom: 480,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  );

  window.dispatchEvent(new Event("resize"));
  scrollElement.dispatchEvent(new Event("scroll"));
  await flushTicks(5);
}

async function mountGrid(unitCount: number) {
  const { scenario } = makeScenario(unitCount);
  const searchHooks = createSearchActionHooks();

  const wrapper = mount(GridEditView, {
    attachTo: document.body,
    global: {
      provide: {
        [activeScenarioKey as symbol]: scenario,
        [sidcModalKey as symbol]: {
          getModalSidc: vi.fn(async () => undefined),
        },
        [searchActionsKey as symbol]: searchHooks,
      },
      stubs: {
        FilterQueryInput: FilterQueryInputStub,
        BaseButton: BaseButtonStub,
        CheckboxDropdown: CheckboxDropdownStub,
        GridUnitRow: GridUnitRowStub,
        GridSideRow: GridSideRowStub,
        GridSideGroupRow: GridSideGroupRowStub,
      },
    },
  });

  mountedWrappers.push(wrapper);
  await setVirtualViewport(wrapper);

  return { wrapper, searchHooks };
}

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

beforeEach(() => {
  sendSpy.mockReset();
  window.localStorage.clear();
});

afterEach(() => {
  while (mountedWrappers.length) {
    mountedWrappers.pop()?.unmount();
  }
  (document.activeElement as HTMLElement | null)?.blur?.();
  document.body.innerHTML = "";
});

describe("GridEditView virtualization", () => {
  it("renders a bounded number of rows for huge ORBATs", async () => {
    const { wrapper } = await mountGrid(5000);

    const renderedRows = wrapper.findAll('[data-testid="grid-row"]');
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(250);
  });

  it("moves focus down across offscreen rows with arrow navigation", async () => {
    const { wrapper } = await mountGrid(1200);

    const startCell = wrapper.find("#cell-0-1").element as HTMLElement;
    startCell.focus();
    await flushTicks();

    for (let i = 0; i < 90; i += 1) {
      const active = document.activeElement as HTMLElement;
      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          cancelable: true,
        }),
      );
      await flushTicks(2);
    }

    const active = document.activeElement as HTMLElement | null;
    expect(active?.id.startsWith("cell-")).toBe(true);

    const rowIndex = Number(active?.id.split("-")[1]);
    expect(Number.isNaN(rowIndex)).toBe(false);
    expect(rowIndex).toBeGreaterThan(40);
  });

  it("reveals and focuses a searched unit in virtual mode", async () => {
    const { searchHooks } = await mountGrid(600);

    searchHooks.onUnitSelectHook.trigger({ unitId: "u-420" });
    await flushTicks(8);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await flushTicks(2);

    const active = document.activeElement as HTMLElement | null;
    expect(sendSpy).not.toHaveBeenCalled();
    expect(active?.id).toBe("cell-422-1");
  });

  it("notifies when a searched unit is filtered out", async () => {
    const { searchHooks } = await mountGrid(120);

    searchHooks.onUnitSelectHook.trigger({ unitId: "u-missing" });
    await flushTicks(4);

    expect(sendSpy).toHaveBeenCalledWith({ message: "Unit is currently filtered out" });
  });

  it("keeps vertical navigation constrained by row-specific columns", async () => {
    const { wrapper } = await mountGrid(80);

    const firstUnitCol2 = wrapper.find("#cell-2-2").element as HTMLElement;
    firstUnitCol2.focus();
    await flushTicks();

    firstUnitCol2.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flushTicks(3);

    const active = document.activeElement as HTMLElement | null;
    expect(active?.id).toBe("cell-2-2");
  });
});
