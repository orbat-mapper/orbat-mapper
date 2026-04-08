// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, ref, toRef } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import GlobeContextMenu from "@/modules/globeview/GlobeContextMenu.vue";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { GLOBE_VECTOR_BASEMAP_ID } from "@/modules/globeview/globeBasemaps";

const radioGroupKey = Symbol("radio-group");

const ContextMenuStub = defineComponent({
  name: "ContextMenu",
  template: "<div><slot /></div>",
});

const ContextMenuTriggerStub = defineComponent({
  name: "ContextMenuTrigger",
  template: "<div><slot /></div>",
});

const ContextMenuContentStub = defineComponent({
  name: "ContextMenuContent",
  template: "<div><slot /></div>",
});

const ContextMenuSubStub = defineComponent({
  name: "ContextMenuSub",
  template: "<div><slot /></div>",
});

const ContextMenuSubContentStub = defineComponent({
  name: "ContextMenuSubContent",
  template: "<div><slot /></div>",
});

const ContextMenuSubTriggerStub = defineComponent({
  name: "ContextMenuSubTrigger",
  template: "<div><slot /></div>",
});

const ContextMenuRadioGroupStub = defineComponent({
  name: "ContextMenuRadioGroup",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    const group = {
      modelValue: toRef(props, "modelValue"),
      setValue: (value: string) => emit("update:modelValue", value),
    };
    return () => h("div", { "data-testid": "radio-group" }, [slots.default?.()]);
  },
  provide() {
    return {
      [radioGroupKey]: {
        modelValue: toRef(this.$props, "modelValue"),
        setValue: (value: string) => this.$emit("update:modelValue", value),
      },
    };
  },
});

const ContextMenuRadioItemStub = defineComponent({
  name: "ContextMenuRadioItem",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ["select"],
  setup(props, { emit, slots }) {
    const group = inject<{ setValue: (value: string) => void }>(radioGroupKey)!;
    return () =>
      h(
        "button",
        {
          type: "button",
          "data-value": props.value,
          onClick: () => {
            group.setValue(props.value);
            emit("select", new Event("select"));
          },
        },
        slots.default?.(),
      );
  },
});

describe("GlobeContextMenu", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("updates the bound globe basemap when a basemap is selected", async () => {
    const baseLayersStore = useBaseLayersStore();
    const selectedBasemap = ref(GLOBE_VECTOR_BASEMAP_ID);

    baseLayersStore.layers = [
      {
        title: "OSM",
        name: "osm",
        layerSourceType: "osm",
        sourceOptions: { crossOrigin: "anonymous" },
        layerType: "baselayer",
        opacity: 1,
      },
      {
        title: "Imagery",
        name: "imagery",
        layerSourceType: "xyz",
        sourceOptions: { url: "https://tiles.example.com/{z}/{x}/{y}.png" },
        layerType: "baselayer",
        opacity: 1,
      },
    ] as any;

    const wrapper = mount(GlobeContextMenu, {
      props: {
        baseMapId: selectedBasemap.value,
        "onUpdate:baseMapId": async (value: string) => {
          selectedBasemap.value = value;
          await wrapper.setProps({ baseMapId: value });
        },
      },
      slots: {
        default: "<div data-testid='trigger'>Trigger</div>",
      },
      global: {
        stubs: {
          ContextMenu: ContextMenuStub,
          ContextMenuTrigger: ContextMenuTriggerStub,
          ContextMenuContent: ContextMenuContentStub,
          ContextMenuSub: ContextMenuSubStub,
          ContextMenuSubContent: ContextMenuSubContentStub,
          ContextMenuSubTrigger: ContextMenuSubTriggerStub,
          ContextMenuRadioGroup: ContextMenuRadioGroupStub,
          ContextMenuRadioItem: ContextMenuRadioItemStub,
        },
      },
    });

    await wrapper.get("[data-value='imagery']").trigger("click");

    expect(selectedBasemap.value).toBe("imagery");
  });

  it("re-dispatches captured contextmenu events through the trigger", async () => {
    const wrapper = mount(GlobeContextMenu, {
      slots: {
        default: "<div data-testid='trigger'>Trigger</div>",
      },
      global: {
        stubs: {
          ContextMenu: ContextMenuStub,
          ContextMenuTrigger: ContextMenuTriggerStub,
          ContextMenuContent: ContextMenuContentStub,
          ContextMenuSub: ContextMenuSubStub,
          ContextMenuSubContent: ContextMenuSubContentStub,
          ContextMenuSubTrigger: ContextMenuSubTriggerStub,
          ContextMenuRadioGroup: ContextMenuRadioGroupStub,
          ContextMenuRadioItem: ContextMenuRadioItemStub,
        },
      },
    });

    const triggerWrapper = wrapper.get(".h-full.w-full");
    const dispatchSpy = vi.spyOn(triggerWrapper.element, "dispatchEvent");

    await triggerWrapper.trigger("contextmenu", {
      button: 2,
      buttons: 2,
      clientX: 10,
      clientY: 20,
    });

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("defaults to the vector globe basemap", () => {
    const wrapper = mount(GlobeContextMenu, {
      slots: {
        default: "<div data-testid='trigger'>Trigger</div>",
      },
      global: {
        stubs: {
          ContextMenu: ContextMenuStub,
          ContextMenuTrigger: ContextMenuTriggerStub,
          ContextMenuContent: ContextMenuContentStub,
          ContextMenuSub: ContextMenuSubStub,
          ContextMenuSubContent: ContextMenuSubContentStub,
          ContextMenuSubTrigger: ContextMenuSubTriggerStub,
          ContextMenuRadioGroup: ContextMenuRadioGroupStub,
          ContextMenuRadioItem: ContextMenuRadioItemStub,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(
      (wrapper.props("baseMapId") as string | undefined) ?? GLOBE_VECTOR_BASEMAP_ID,
    ).toBe(GLOBE_VECTOR_BASEMAP_ID);
  });
});
