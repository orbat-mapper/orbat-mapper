// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import RecordingState from "@/components/RecordingState.vue";
import { useRecordingStore } from "@/stores/recordingStore";

vi.mock("@/components/ui/button", () => ({
  Button: defineComponent({
    name: "Button",
    emits: ["click"],
    template:
      '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
  }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: defineComponent({
    name: "DropdownMenu",
    template: "<div><slot /></div>",
  }),
  DropdownMenuContent: defineComponent({
    name: "DropdownMenuContent",
    template: "<div><slot /></div>",
  }),
  DropdownMenuLabel: defineComponent({
    name: "DropdownMenuLabel",
    template: "<div><slot /></div>",
  }),
  DropdownMenuSeparator: defineComponent({
    name: "DropdownMenuSeparator",
    template: "<hr />",
  }),
  DropdownMenuTrigger: defineComponent({
    name: "DropdownMenuTrigger",
    template: "<div><slot /></div>",
  }),
  DropdownMenuCheckboxItem: defineComponent({
    name: "DropdownMenuCheckboxItem",
    props: ["modelValue"],
    emits: ["update:modelValue", "select"],
    template: `
      <label>
        <input
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <slot />
      </label>
    `,
  }),
}));

vi.mock("lucide-vue-next", () => {
  const icon = (name: string) =>
    defineComponent({
      name,
      template: "<span />",
    });

  return {
    ChevronDown: icon("ChevronDown"),
    MapPinned: icon("MapPinned"),
    Settings2: icon("Settings2"),
    SplinePointer: icon("SplinePointer"),
    Workflow: icon("Workflow"),
  };
});

function mountRecordingState() {
  return mount(RecordingState);
}

describe("RecordingState", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows the active recording summary in the primary button", () => {
    const wrapper = mountRecordingState();

    expect(wrapper.get("button").text()).toContain("Rec");
    expect(wrapper.get("button").text()).not.toContain("Location");
    expect(wrapper.get("button").attributes("title")).toContain("Unit position");
  });

  it("stops all recording and resumes the last non-empty selection", async () => {
    const wrapper = mountRecordingState();
    const store = useRecordingStore();
    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    await checkboxes[0].setValue(true);
    await checkboxes[2].setValue(true);

    const primaryButton = wrapper.findAll("button")[0];

    await primaryButton.trigger("click");

    expect(store.isRecordingHierarchy).toBe(false);
    expect(store.isRecordingLocation).toBe(false);
    expect(store.isRecordingGeometry).toBe(false);

    await primaryButton.trigger("click");

    expect(store.isRecordingHierarchy).toBe(true);
    expect(store.isRecordingLocation).toBe(true);
    expect(store.isRecordingGeometry).toBe(true);
  });

  it("updates the resumed mix when the dropdown selection changes", async () => {
    const wrapper = mountRecordingState();
    const store = useRecordingStore();
    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    await checkboxes[2].setValue(true);
    await checkboxes[1].setValue(false);

    const primaryButton = wrapper.findAll("button")[0];

    await primaryButton.trigger("click");
    await primaryButton.trigger("click");

    expect(store.isRecordingHierarchy).toBe(false);
    expect(store.isRecordingLocation).toBe(false);
    expect(store.isRecordingGeometry).toBe(true);
    expect(primaryButton.attributes("title")).toContain("Feature geometry");
  });
});
