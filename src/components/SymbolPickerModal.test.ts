import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import SymbolPickerModal from "@/components/SymbolPickerModal.vue";
import { useSymbolSettingsStore } from "@/stores/settingsStore";

function mountPicker(initialSidc: string) {
  return shallowMount(SymbolPickerModal, {
    props: {
      initialSidc,
    },
    global: {
      stubs: {
        NewSimpleModal: { template: "<section><slot /></section>" },
        ScrollTabs: { template: "<div><slot /></div>" },
        TabsContent: { template: "<div><slot /></div>" },
        ComboboxRoot: { template: "<div><slot /></div>" },
        ComboboxContent: { template: "<div><slot /></div>" },
        ComboboxGroup: { template: "<div><slot /></div>" },
        ComboboxInput: { template: "<input />" },
        ComboboxItem: { template: "<div><slot /></div>" },
        ComboboxLabel: { template: "<div><slot /></div>" },
        NativeSelect: {
          props: ["modelValue"],
          emits: ["update:modelValue"],
          template:
            '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
        },
        NativeSelectOption: {
          props: ["value"],
          template: '<option :value="value"><slot /></option>',
        },
        SymbolCodeViewer: {
          props: ["sidc"],
          template: '<div data-test="sidc-widget">{{ sidc }}</div>',
        },
      },
    },
  });
}

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("SymbolPickerModal", () => {
  it.skip("warns when the symbol SIDC layout differs from the scenario default", () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";

    const wrapper = mountPicker("10031000000000000000");

    expect(wrapper.text()).toContain("20-position legacy");
    expect(wrapper.text()).toContain("MIL-STD-2525E");
  });

  it("does not warn when the symbol SIDC layout matches the scenario default", () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";

    const wrapper = mountPicker("150310000000000000000000000000");

    expect(wrapper.text()).not.toContain("scenario default");
  });

  it.skip("allows changing the active symbology standard", async () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525d";
    const wrapper = mountPicker("10031000000000000000");

    expect(wrapper.text()).toContain("Symbology standard");
    expect(wrapper.get('[data-test="sidc-widget"]').text()).toHaveLength(20);
    await wrapper.find("select").setValue("2525e");

    expect(settingsStore.symbologyStandard).toBe("2525d");
    expect(wrapper.get('[data-test="sidc-widget"]').text()).toHaveLength(30);
    expect(wrapper.get('[data-test="sidc-widget"]').text().startsWith("15")).toBe(true);
  });

  it.skip("sets the active standard dropdown from the loaded SIDC", () => {
    const settingsStore = useSymbolSettingsStore();
    settingsStore.symbologyStandard = "2525e";

    const legacyWrapper = mountPicker("10031000000000000000");
    expect((legacyWrapper.find("select").element as HTMLSelectElement).value).toBe(
      "2525d",
    );

    const editionEWrapper = mountPicker("150310000000000000000000000000");
    expect((editionEWrapper.find("select").element as HTMLSelectElement).value).toBe(
      "2525e",
    );
  });
});
