// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, ref } from "vue";
import UnitDetailsSupplies from "@/modules/scenarioeditor/UnitDetailsSupplies.vue";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useEquipmentEditStore } from "@/stores/toeStore";
import { useUiStore } from "@/stores/uiStore";

const ToeGridStub = defineComponent({
  name: "ToeGrid",
  props: {
    editedId: { type: String, default: null },
  },
  template: `
    <div data-testid="toe-grid" :data-edited-id="editedId">
      <slot
        name="inline-form"
        :row="{ id: 's2', name: 'Bravo Supply', count: 1, onHand: 1 }"
        :nextEditedId="'s3'"
      />
    </div>
  `,
});

const ModifyUnitSupplyFormStub = defineComponent({
  name: "ModifyUnitSupplyForm",
  props: {
    itemData: { type: Object, required: true },
  },
  emits: ["diffOnHand", "updateCount", "updateOnHand", "cancel"],
  template: `
    <button
      data-testid="submit-inline"
      @click="$emit('updateCount', { id: itemData.id, count: 9 })"
    >
      Save
    </button>
  `,
});

const InlineFormWrapperStub = defineComponent({
  name: "InlineFormWrapper",
  template: "<div><slot /></div>",
});

function makeScenario() {
  return {
    store: {
      state: {
        settingsStateCounter: 0,
        unitMap: {
          u1: {
            id: "u1",
            supplies: [
              { id: "s2", count: 1, onHand: 1 },
              { id: "s1", count: 1, onHand: 1 },
              { id: "s3", count: 1, onHand: 1 },
            ],
          },
        },
        supplyCategoryMap: {
          s1: { id: "s1", name: "Alpha Supply", supplyClass: "", uom: "" },
          s2: { id: "s2", name: "Bravo Supply", supplyClass: "", uom: "" },
          s3: { id: "s3", name: "Charlie Supply", supplyClass: "", uom: "" },
        },
        supplyClassMap: {},
        supplyUomMap: {},
      },
      onUndoRedo: () => {},
      groupUpdate: (fn: () => void) => fn(),
    },
    unitActions: {
      walkSubUnits: (id: string, cb: (unit: { id: string }) => void) => cb({ id }),
      updateUnitSupply: () => {},
      updateUnitState: () => {},
      addUnitStateEntry: () => {},
    },
    time: {
      scenarioTime: ref(0),
    },
  };
}

describe("UnitDetailsSupplies goToNextOnSubmit", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const selected = useSelectedItems();
    selected.clear();
    selected.selectedUnitIds.value.add("u1");
    useEquipmentEditStore().isEditMode = true;
  });

  it("uses nextEditedId from ToeGrid slot when enabled", async () => {
    const wrapper = mount(UnitDetailsSupplies, {
      props: {
        unit: { id: "u1" } as any,
      },
      global: {
        provide: {
          [activeScenarioKey as symbol]: makeScenario(),
        },
        stubs: {
          ToeGridHeader: true,
          AddUnitSupplyForm: true,
          InlineFormWrapper: InlineFormWrapperStub,
          ToeGrid: ToeGridStub,
          ModifyUnitSupplyForm: ModifyUnitSupplyFormStub,
        },
      },
    });
    useUiStore().goToNextOnSubmit = true;

    await wrapper.get("[data-testid='submit-inline']").trigger("click");

    expect(wrapper.get("[data-testid='toe-grid']").attributes("data-edited-id")).toBe(
      "s3",
    );
  });
});
