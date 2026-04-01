// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

import StoredScenarioBrowser from "@/components/StoredScenarioBrowser.vue";

const scenarios = [
  {
    id: "alpha",
    name: "Alpha Scenario",
    description: "First",
    image: "",
    modified: new Date("2024-01-02T00:00:00.000Z"),
    created: new Date("2024-01-01T00:00:00.000Z"),
  },
  {
    id: "bravo",
    name: "Bravo Scenario",
    description: "Second",
    image: "",
    modified: new Date("2024-01-04T00:00:00.000Z"),
    created: new Date("2024-01-03T00:00:00.000Z"),
  },
];

const ScenarioLinkCardStub = defineComponent({
  name: "ScenarioLinkCard",
  props: ["data", "selectionMode", "selected"],
  emits: ["action", "toggle-select"],
  template: `
    <button
      :data-testid="'scenario-card-' + data.id"
      :data-selection-mode="selectionMode"
      :data-selected="selected"
      @click="$emit('toggle-select')"
    >
      {{ data.name }}
    </button>
  `,
});

const DeleteStoredScenariosModalStub = defineComponent({
  name: "DeleteStoredScenariosModal",
  props: ["modelValue", "scenarios"],
  emits: ["confirm", "cancel", "update:modelValue"],
  template: `
    <div v-if="modelValue" data-testid="delete-modal">
      <span data-testid="modal-count">{{ scenarios.length }}</span>
      <button data-testid="confirm-delete" @click="$emit('confirm')">confirm</button>
    </div>
  `,
});

const InputGroupStub = defineComponent({
  name: "InputGroup",
  template: `<div><slot /></div>`,
});

const InputGroupAddonStub = defineComponent({
  name: "InputGroupAddon",
  template: `<div><slot /></div>`,
});

const InputGroupButtonStub = defineComponent({
  name: "InputGroupButton",
  props: ["disabled", "type"],
  emits: ["click"],
  template: `<button :disabled="disabled" :type="type" @click="$emit('click', $event)"><slot /></button>`,
});

const InputGroupInputStub = defineComponent({
  name: "InputGroupInput",
  props: ["id", "modelValue", "placeholder", "autocomplete", "autofocus", "class"],
  emits: ["update:modelValue", "keydown"],
  template: `
    <input
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :class="$props.class"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown="$emit('keydown', $event)"
    />
  `,
});

const SortDropdownStub = defineComponent({
  name: "SortDropdown",
  props: ["options", "sortDirection"],
  emits: ["toggle-direction"],
  template: `<div data-testid="sort-dropdown" />`,
});

const ButtonStub = defineComponent({
  name: "Button",
  props: ["disabled", "type"],
  emits: ["click"],
  template: `<button :disabled="disabled" :type="type ?? 'button'" @click="$emit('click', $event)"><slot /></button>`,
});

function mountBrowser(props: Record<string, unknown> = {}) {
  return mount(StoredScenarioBrowser, {
    props: {
      scenarios,
      sortOptions: [],
      searchInputId: "scenario-search",
      ...props,
    },
    global: {
      stubs: {
        ScenarioLinkCard: ScenarioLinkCardStub,
        DeleteStoredScenariosModal: DeleteStoredScenariosModalStub,
        InputGroup: InputGroupStub,
        InputGroupAddon: InputGroupAddonStub,
        InputGroupButton: InputGroupButtonStub,
        InputGroupInput: InputGroupInputStub,
        SortDropdown: SortDropdownStub,
        Button: ButtonStub,
      },
    },
  });
}

describe("StoredScenarioBrowser", () => {
  it("wraps the results list in a scrollable container", () => {
    const wrapper = mountBrowser();
    const resultsContainer = wrapper.get('[data-testid="scenario-card-alpha"]').element
      .parentElement;

    expect(resultsContainer).not.toBeNull();
    expect(resultsContainer?.className).toContain("mt-4");
    expect(resultsContainer?.parentElement?.className).toContain("min-h-0");
    expect(resultsContainer?.parentElement?.className).toContain("max-h-[60vh]");
    expect(resultsContainer?.parentElement?.className).toContain("overflow-y-auto");
  });

  it("renders the empty state inside the scrollable container", () => {
    const wrapper = mountBrowser({ scenarios: [] });
    const emptyState = wrapper.get(".border-dashed");

    expect(emptyState.text()).toContain('No scenarios match "".');
    expect(emptyState.element.parentElement?.className).toContain("min-h-0");
    expect(emptyState.element.parentElement?.className).toContain("max-h-[60vh]");
    expect(emptyState.element.parentElement?.className).toContain("overflow-y-auto");
  });

  it("renders a Select button only when batch actions are enabled", () => {
    const disabledWrapper = mountBrowser();
    const enabledWrapper = mountBrowser({ enableBatchActions: true });

    expect(disabledWrapper.text()).not.toContain("Select");
    expect(enabledWrapper.text()).toContain("Select");
  });

  it("enters selection mode and toggles card selection", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("button").trigger("click");

    expect(wrapper.text()).toContain("0 selected");
    expect(
      wrapper
        .get('[data-testid="scenario-card-alpha"]')
        .attributes("data-selection-mode"),
    ).toBe("true");

    await wrapper.get('[data-testid="scenario-card-alpha"]').trigger("click");

    expect(wrapper.text()).toContain("1 selected");
    expect(
      wrapper.get('[data-testid="scenario-card-alpha"]').attributes("data-selected"),
    ).toBe("true");
  });

  it("selects only the filtered scenarios when Select all is used", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("input").setValue("Bravo");
    await wrapper.get("button").trigger("click");

    const buttons = wrapper.findAll("button");
    const selectAllButton = buttons.find(
      (candidate) => candidate.text() === "Select all",
    );
    expect(selectAllButton).toBeDefined();

    await selectAllButton!.trigger("click");

    expect(wrapper.text()).toContain("1 selected");
    expect(wrapper.find('[data-testid="scenario-card-alpha"]').exists()).toBe(false);
    expect(
      wrapper.get('[data-testid="scenario-card-bravo"]').attributes("data-selected"),
    ).toBe("true");
  });

  it("preserves selected scenarios when the search query changes", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("button").trigger("click");
    await wrapper.get('[data-testid="scenario-card-alpha"]').trigger("click");
    await wrapper.get("input").setValue("Bravo");

    expect(wrapper.text()).toContain("1 selected");
  });

  it("clears the search on Escape without cancelling selection mode", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("input").setValue("Bravo");
    await wrapper.get("button").trigger("click");
    await wrapper.get("input").trigger("keydown", { key: "Escape" });

    expect((wrapper.get("input").element as HTMLInputElement).value).toBe("");
    expect(wrapper.text()).toContain("0 selected");
    expect(wrapper.text()).toContain("Cancel");
    expect(wrapper.find('[data-testid="scenario-card-alpha"]').exists()).toBe(true);
  });

  it("disables Delete selected when nothing is selected", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("button").trigger("click");

    const deleteButton = wrapper
      .findAll("button")
      .find((candidate) => candidate.text() === "Delete selected");

    expect(deleteButton?.attributes("disabled")).toBeDefined();
  });

  it("emits a bulk delete action after confirmation", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("button").trigger("click");
    await wrapper.get('[data-testid="scenario-card-alpha"]').trigger("click");
    await wrapper
      .findAll("button")
      .find((candidate) => candidate.text() === "Delete selected")!
      .trigger("click");

    expect(wrapper.get('[data-testid="modal-count"]').text()).toBe("1");

    await wrapper.get('[data-testid="confirm-delete"]').trigger("click");

    expect(wrapper.emitted("bulk-action")).toEqual([["delete", [scenarios[0]]]]);
  });

  it("prunes deleted selections and exits select mode when nothing remains selected", async () => {
    const wrapper = mountBrowser({ enableBatchActions: true });

    await wrapper.get("button").trigger("click");
    await wrapper.get('[data-testid="scenario-card-alpha"]').trigger("click");
    await wrapper.setProps({ scenarios: [scenarios[1]] });

    expect(wrapper.text()).not.toContain("Delete selected");
    expect(wrapper.text()).toContain("Select");
  });
});
