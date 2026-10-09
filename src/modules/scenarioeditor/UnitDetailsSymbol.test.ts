// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { klona } from "klona";
import { reactive } from "vue";
import UnitDetailsSymbol from "./UnitDetailsSymbol.vue";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import type { NUnit } from "@/types/internalModels";

function makeUnit(id: string, extra: Partial<NUnit> = {}): NUnit {
  return {
    id,
    name: id,
    sidc: "10031000001211000000",
    subUnits: [],
    _pid: "group-1",
    _sid: "side-1",
    ...extra,
  } as NUnit;
}

function mountSymbol(units: NUnit[]) {
  const unitMap = reactive<Record<string, NUnit>>(
    Object.fromEntries(units.map((u) => [u.id, u])),
  );
  // Like the real store, updating a unit replaces it with a deep copy.
  const updateUnit = vi.fn((id: string, data: Partial<NUnit>) => {
    unitMap[id] = { ...klona(unitMap[id]!), ...data };
  });
  const wrapper = mount(UnitDetailsSymbol, {
    props: { unit: unitMap[units[0]!.id]! },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          store: {
            state: { currentTime: 0, customSymbolMap: {} },
            groupUpdate: (fn: () => void) => fn(),
          },
          unitActions: {
            updateUnit,
            getCombinedSymbolOptions: () => ({}),
            addUnitStateEntry: vi.fn(),
            isUnitLocked: () => false,
          },
          helpers: { getUnitById: (id: string) => unitMap[id] },
        },
      },
      stubs: {
        UnitSymbol: true,
        NewMilitarySymbol: true,
        Slider: true,
        NumberInputGroup: true,
      },
    },
  });
  return { wrapper, unitMap, updateUnit };
}

describe("UnitDetailsSymbol", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSelectedItems().selectedUnitIds.value.clear();
  });

  it("does not write symbol sizes when the selection changes", async () => {
    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.add("a");
    selectedUnitIds.value.add("c");
    const { updateUnit } = mountSymbol([
      makeUnit("a"),
      makeUnit("c"),
      makeUnit("b", { style: { mapSymbolSize: 60 } }),
    ]);
    await flushPromises();

    selectedUnitIds.value.add("b");
    await flushPromises();

    expect(updateUnit).not.toHaveBeenCalled();
  });

  it("keeps unsaved text amplifier edits when the unit is updated", async () => {
    const { wrapper, unitMap } = mountSymbol([
      makeUnit("a", { textAmplifiers: { higherFormation: "X" } }),
    ]);
    await flushPromises();

    const input = wrapper.get('input[title="Higher Formation"]');
    await input.setValue("Y");

    // An unrelated change replaces the unit object, with equal text amplifiers
    unitMap.a = { ...klona(unitMap.a!), style: { mapSymbolSize: 40 } };
    await flushPromises();

    expect((input.element as HTMLInputElement).value).toBe("Y");
  });
});
