import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import EchelonSizesDialog from "@/components/EchelonSizesDialog.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const slot = { template: "<div><slot /></div>" };

function mountDialog(props: { sidc?: string } = {}) {
  return mount(EchelonSizesDialog, {
    props: { open: true, ...props },
    global: {
      stubs: {
        Dialog: slot,
        DialogContent: slot,
        DialogHeader: slot,
        DialogTitle: slot,
        DialogDescription: slot,
        DialogFooter: slot,
        ToggleGroup: slot,
        ToggleGroupItem: slot,
        NewMilitarySymbol: true,
        NumberField: {
          props: ["id", "modelValue"],
          emits: ["update:modelValue"],
          template:
            '<input :data-test="id" :value="modelValue" @change="$emit(\'update:modelValue\', Number($event.target.value))" />',
        },
      },
    },
  });
}

function button(wrapper: ReturnType<typeof mountDialog>, text: string) {
  return wrapper.findAll("button").find((b) => b.text() === text)!;
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("EchelonSizesDialog", () => {
  it("shows each echelon's size at the map symbol size", () => {
    const wrapper = mountDialog();
    const brigade = wrapper.find('[data-test="echelon-size-18"]')
      .element as HTMLInputElement;
    expect(brigade.value).toBe("32");
  });

  it("stores a typed size as a ratio of the map symbol size on Apply", async () => {
    const settings = useMapSettingsStore();
    const wrapper = mountDialog();
    await wrapper.find('[data-test="echelon-size-18"]').setValue("40");
    expect(settings.mapEchelonSizeRatios["18"]).toBeUndefined();

    await button(wrapper, "Apply").trigger("click");
    expect(settings.mapEchelonSizeRatios["18"]).toBe(1.6);
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });

  it("leaves the settings alone on Cancel", async () => {
    const settings = useMapSettingsStore();
    const wrapper = mountDialog();
    await wrapper.find('[data-test="echelon-sizes-base"]').setValue("30");
    await button(wrapper, "Cancel").trigger("click");
    expect(settings.mapIconSize).toBe(25);
  });

  it("resets the ratios to the seed", async () => {
    const settings = useMapSettingsStore();
    settings.mapEchelonSizeRatios = { "18": 3 };
    const wrapper = mountDialog();
    await button(wrapper, "Reset sizes").trigger("click");
    await button(wrapper, "Apply").trigger("click");
    expect(settings.mapEchelonSizeRatios).toEqual({});
  });

  it("picks out the unit's own echelon", () => {
    const wrapper = mountDialog({ sidc: "10031000211211000000" });
    expect(wrapper.find('label[for="echelon-size-21"]').classes()).toContain(
      "font-semibold",
    );
  });
});
