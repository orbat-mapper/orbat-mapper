// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import MapEditorMobilePanel from "@/modules/scenarioeditor/MapEditorMobilePanel.vue";
import { useUiStore } from "@/stores/uiStore";

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useSwipe: () => ({
      isSwiping: ref(false),
      direction: ref<"up" | "down" | "left" | "right" | null>(null),
    }),
    useWindowSize: () => ({ width: ref(1024), height: ref(900) }),
    useThrottleFn: (fn: (...args: any[]) => any) => fn,
  };
});

const ScrollTabsStub = defineComponent({
  name: "ScrollTabs",
  template: "<div><slot /><slot name='right' /></div>",
});

function mountPanel() {
  const wrapper = mount(MapEditorMobilePanel, {
    global: {
      stubs: {
        ScrollTabs: ScrollTabsStub,
        TabsContent: true,
        ScenarioEventsPanel: true,
        ScenarioInfoPanel: true,
        ScenarioFeatureDetails: true,
        OrbatPanel: true,
        CloseButton: true,
        MapTimeController: true,
        ScenarioLayersTabPanel: true,
        ScenarioMapLayerDetails: true,
        ScenarioEventDetails: true,
        UnitDetails: true,
        ScenarioSettingsPanel: true,
        GripHorizontal: true,
        IconChevronDoubleUp: true,
      },
    },
  });
  const uiStore = useUiStore();
  return { wrapper, uiStore };
}

async function pointerGesture(
  target: ReturnType<typeof mountPanel>["wrapper"],
  {
    downY,
    upY,
    moveY,
    pointerId = 1,
  }: { downY: number; upY: number; moveY?: number; pointerId?: number },
) {
  const handle = target.get("[data-testid='mobile-panel-resize-strip']");
  handle.element.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, clientY: downY, pointerId }),
  );
  if (moveY !== undefined) {
    handle.element.dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true, clientY: moveY, pointerId }),
    );
  }
  handle.element.dispatchEvent(
    new PointerEvent("pointerup", { bubbles: true, clientY: upY, pointerId }),
  );
  await nextTick();
  return handle;
}

beforeEach(() => {
  setActivePinia(createPinia());
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: vi.fn(() => true),
  });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("MapEditorMobilePanel", () => {
  it("toggles the panel from the dedicated toggle button", async () => {
    const { wrapper, uiStore } = mountPanel();
    uiStore.mobilePanelOpen = true;
    await nextTick();

    await wrapper.get("[data-testid='mobile-panel-toggle']").trigger("click");
    await nextTick();
    expect(uiStore.mobilePanelOpen).toBe(false);

    await wrapper.get("[data-testid='mobile-panel-toggle']").trigger("click");
    await nextTick();
    expect(uiStore.mobilePanelOpen).toBe(true);
  });

  it("resizes from the separator drag and keeps the panel open", async () => {
    const { wrapper, uiStore } = mountPanel();
    uiStore.mobilePanelOpen = true;
    uiStore.mobilePanelHeight = 360;
    await nextTick();

    await pointerGesture(wrapper, { downY: 500, moveY: 460, upY: 460 });

    expect(uiStore.mobilePanelOpen).toBe(true);
    expect(uiStore.mobilePanelHeight).toBe(400);
  });

  it("does not toggle panel state on pointerup without resize movement", async () => {
    const { wrapper, uiStore } = mountPanel();
    uiStore.mobilePanelOpen = true;
    await nextTick();

    await pointerGesture(wrapper, { downY: 500, upY: 498 });

    expect(uiStore.mobilePanelOpen).toBe(true);
  });

  it("hides the resize strip when the panel is closed", async () => {
    const { wrapper, uiStore } = mountPanel();
    uiStore.mobilePanelOpen = false;
    await nextTick();

    expect(wrapper.find("[data-testid='mobile-panel-toggle']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='mobile-panel-resize-strip']").exists()).toBe(
      false,
    );
  });
});
