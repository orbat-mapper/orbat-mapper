// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

import DeleteStoredScenariosModal from "@/components/DeleteStoredScenariosModal.vue";

const NewSimpleModalStub = defineComponent({
  name: "NewSimpleModal",
  props: ["modelValue", "dialogTitle"],
  emits: ["cancel", "update:modelValue"],
  template: `<div data-testid="modal"><slot /></div>`,
});

const ButtonStub = defineComponent({
  name: "Button",
  props: ["type", "variant"],
  emits: ["click"],
  template: `<button :type="type ?? 'submit'" @click="$emit('click', $event)"><slot /></button>`,
});

function mountModal() {
  return mount(DeleteStoredScenariosModal, {
    props: {
      modelValue: true,
      scenarios: [
        {
          id: "scenario-1",
          name: "Scenario 1",
          description: "",
          image: "",
          modified: new Date(),
          created: new Date(),
        },
      ],
    },
    global: {
      stubs: {
        NewSimpleModal: NewSimpleModalStub,
        Button: ButtonStub,
      },
    },
  });
}

describe("DeleteStoredScenariosModal", () => {
  it("renders footer buttons with type button", () => {
    const wrapper = mountModal();
    const buttons = wrapper.findAll("button");

    expect(buttons.map((button) => button.attributes("type"))).toEqual([
      "button",
      "button",
    ]);
  });

  it("emits cancel and closes when the footer Cancel button is clicked", async () => {
    const wrapper = mountModal();
    const cancelButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Cancel")!;

    await cancelButton.trigger("click");

    expect(wrapper.emitted("cancel")).toEqual([[]]);
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });
});
