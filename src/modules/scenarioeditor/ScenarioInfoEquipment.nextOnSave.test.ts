// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import ScenarioInfoEquipment from "@/modules/scenarioeditor/ScenarioInfoEquipment.vue";
import { activeScenarioKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";

const ToeGridStub = defineComponent({
  name: "ToeGrid",
  props: {
    editedId: { type: String, default: null },
  },
  template: `
    <div data-testid="toe-grid" :data-edited-id="editedId">
      <slot name="inline-form" :row="{ id: 'b', name: 'Bravo', description: '' }" :nextEditedId="'c'" />
    </div>
  `,
});

const AddNameDescriptionFormStub = defineComponent({
  name: "AddNameDescriptionForm",
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["submit", "cancel"],
  template: `
    <button
      data-testid="submit-inline"
      @click="$emit('submit', modelValue)"
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
        equipmentMap: {
          b: { id: "b", name: "Bravo", description: "" },
          a: { id: "a", name: "Alpha", description: "" },
          c: { id: "c", name: "Charlie", description: "" },
        },
      },
      groupUpdate: (fn: () => void) => fn(),
    },
    unitActions: {
      updateEquipment: () => {},
      addEquipment: () => {},
      deleteEquipment: () => true,
    },
  };
}

describe("ScenarioInfoEquipment goToNextOnSubmit", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("uses nextEditedId from the table slot when enabled", async () => {
    const wrapper = mount(ScenarioInfoEquipment, {
      global: {
        provide: {
          [activeScenarioKey as symbol]: makeScenario(),
        },
        stubs: {
          TableHeader: true,
          ToeGridHeader: true,
          InlineFormWrapper: InlineFormWrapperStub,
          ToeGrid: ToeGridStub,
          AddNameDescriptionForm: AddNameDescriptionFormStub,
        },
      },
    });
    const uiStore = useUiStore();
    uiStore.goToNextOnSubmit = true;

    await wrapper.get("[data-testid='submit-inline']").trigger("click");

    expect(wrapper.get("[data-testid='toe-grid']").attributes("data-edited-id")).toBe(
      "c",
    );
  });

  it("closes editor when toggle is disabled", async () => {
    const wrapper = mount(ScenarioInfoEquipment, {
      global: {
        provide: {
          [activeScenarioKey as symbol]: makeScenario(),
        },
        stubs: {
          TableHeader: true,
          ToeGridHeader: true,
          InlineFormWrapper: InlineFormWrapperStub,
          ToeGrid: ToeGridStub,
          AddNameDescriptionForm: AddNameDescriptionFormStub,
        },
      },
    });
    const uiStore = useUiStore();
    uiStore.goToNextOnSubmit = false;

    await wrapper.get("[data-testid='submit-inline']").trigger("click");

    expect(wrapper.get("[data-testid='toe-grid']").attributes("data-edited-id")).toBe(
      undefined,
    );
  });
});
