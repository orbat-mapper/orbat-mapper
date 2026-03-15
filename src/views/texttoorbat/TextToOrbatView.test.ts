import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import TextToOrbatView from "@/views/texttoorbat/TextToOrbatView.vue";
import TextToOrbatEditor from "@/views/texttoorbat/TextToOrbatEditor.vue";

function installCodeMirrorTestPolyfills() {
  const createClientRectList = () =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }) as DOMRectList;

  const originalCreateRange = document.createRange.bind(document);
  document.createRange = () => {
    const range = originalCreateRange();
    range.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
    range.getClientRects = createClientRectList;
    return range;
  };

  if (!HTMLElement.prototype.getBoundingClientRect) {
    HTMLElement.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
  }
  if (!HTMLElement.prototype.getClientRects) {
    HTMLElement.prototype.getClientRects = createClientRectList;
  }
  if (!vi.isMockFunction(HTMLCanvasElement.prototype.getContext)) {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);
  }
}

installCodeMirrorTestPolyfills();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({
    send: vi.fn(),
  }),
}));

vi.mock("@/scenariostore", () => ({
  useScenario: () => ({
    scenario: {
      value: {
        io: {
          loadFromObject: vi.fn(),
          serializeToObject: vi.fn(() => ({ id: "scenario-1" })),
        },
        store: {
          clearUndoRedoStack: vi.fn(),
        },
      },
    },
  }),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    addScenario: vi.fn(),
  }),
}));

vi.mock("@/components/NewMilitarySymbol.vue", () => ({
  default: {
    template: "<div data-test='mil-symbol' />",
  },
}));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("TextToOrbatView", () => {
  it("updates the generated ORBAT when the editor text changes", async () => {
    const wrapper = mount(TextToOrbatView, {
      attachTo: document.body,
      global: {
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
          },
          UseDark: {
            template: "<div><slot :isDark='false' :toggleDark='() => undefined' /></div>",
          },
        },
      },
    });
    await nextTick();

    wrapper
      .findComponent(TextToOrbatEditor)
      .vm.$emit("update:modelValue", "9th Division\n  1st Brigade");
    await nextTick();

    expect(wrapper.text()).toContain("9th Division");
    expect(wrapper.text()).toContain("1st Brigade");
    expect(wrapper.text()).toContain("1 top-level unit(s)");
    wrapper.unmount();
  });
});
