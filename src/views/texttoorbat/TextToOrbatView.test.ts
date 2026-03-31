import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextToOrbatView from "@/views/texttoorbat/TextToOrbatView.vue";
import TextToOrbatEditor from "@/views/texttoorbat/TextToOrbatEditor.vue";
import SplitButton from "@/components/SplitButton.vue";

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

type ExternalDragConfig = {
  getInitialDataForExternal: () => Record<string, string>;
};

function getApplicationOrbatPayload(config: ExternalDragConfig) {
  return JSON.parse(config.getInitialDataForExternal()["application/orbat"]);
}

function getExternalDragConfigs(): ExternalDragConfig[] {
  const configs: ExternalDragConfig[] = [];

  for (const call of draggableMock.mock.calls as unknown[]) {
    const candidate = Array.isArray(call) ? call[0] : undefined;
    if (
      candidate &&
      typeof candidate === "object" &&
      "getInitialDataForExternal" in candidate &&
      typeof candidate.getInitialDataForExternal === "function"
    ) {
      configs.push(candidate as ExternalDragConfig);
    }
  }

  return configs;
}

const {
  sendNotificationMock,
  routerPushMock,
  clipboardWriteMock,
  clipboardWriteTextMock,
  draggableMock,
} = vi.hoisted(() => ({
  sendNotificationMock: vi.fn(),
  routerPushMock: vi.fn(),
  clipboardWriteMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
  draggableMock: vi.fn(() => () => {}),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({
    send: sendNotificationMock,
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

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: draggableMock,
  dropTargetForElements: vi.fn(() => () => {}),
  monitorForElements: vi.fn(() => () => {}),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/combine", () => ({
  combine:
    (...fns: (() => void)[]) =>
    () =>
      fns.forEach((fn) => fn()),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge", () => ({
  attachClosestEdge: vi.fn((data: unknown) => data),
  extractClosestEdge: vi.fn(() => null),
}));

afterEach(() => {
  document.body.innerHTML = "";
});

beforeEach(() => {
  setActivePinia(createTestingPinia({ createSpy: vi.fn }));
  sendNotificationMock.mockReset();
  routerPushMock.mockReset();
  clipboardWriteMock.mockReset();
  clipboardWriteTextMock.mockReset();
  draggableMock.mockClear();

  Object.defineProperty(globalThis, "navigator", {
    value: {
      clipboard: {
        write: clipboardWriteMock,
        writeText: clipboardWriteTextMock,
      },
    },
    configurable: true,
  });
});

describe("TextToOrbatView", () => {
  it("generates short names for units that do not already have them", async () => {
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
      .vm.$emit(
        "update:modelValue",
        "5 Inf Bde\n  2nd Bn Scots Guards\n  1st Bn Welsh Guards, 1 BN WEL",
      );
    await nextTick();

    const generateButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Generate short names"));
    expect(generateButton).toBeDefined();

    await generateButton!.trigger("click");
    await nextTick();

    const editorValue = wrapper
      .findComponent(TextToOrbatEditor)
      .props("modelValue") as string;
    expect(editorValue).toContain("5 Inf Bde, 5 INF BDE");
    expect(editorValue).toContain("2nd Bn Scots Guards, 2 BN SCOT");
    expect(editorValue).toContain("1st Bn Welsh Guards, 1 BN WEL");
    expect(wrapper.text()).toContain("5 INF BDE");
    expect(wrapper.text()).toContain("2 BN SCOT");
    expect(sendNotificationMock).toHaveBeenCalledWith({
      message: "Generated 2 short names",
    });

    await generateButton!.trigger("click");
    await nextTick();

    expect(sendNotificationMock).toHaveBeenLastCalledWith({
      message: "All units already have short names",
    });

    wrapper.unmount();
  });

  it("clears all short names while preserving description slots", async () => {
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
      .vm.$emit("update:modelValue", "3rd RA, 3 RA, description");
    await nextTick();

    await (
      wrapper.vm as unknown as { handleClearShortNames: () => void }
    ).handleClearShortNames();
    await nextTick();

    const editorValue = wrapper
      .findComponent(TextToOrbatEditor)
      .props("modelValue") as string;
    expect(editorValue).toBe("3rd RA, , description");
    expect(sendNotificationMock).toHaveBeenCalledWith({
      message: "Cleared 1 short name",
    });

    wrapper.unmount();
  });

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
    wrapper.unmount();
  });

  it("copies ORBAT JSON to text/plain when ClipboardItem is available", async () => {
    let clipboardItemData: Record<string, Blob> | undefined;
    const OriginalBlob = globalThis.Blob;

    class ClipboardItemStub {
      constructor(data: Record<string, Blob>) {
        clipboardItemData = data;
      }
    }

    class BlobStub {
      parts: string[];
      type: string;

      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.parts = parts.map((part) => String(part));
        this.type = options?.type ?? "";
      }

      async text() {
        return this.parts.join("");
      }
    }

    Object.defineProperty(globalThis, "ClipboardItem", {
      value: ClipboardItemStub,
      configurable: true,
    });
    Object.defineProperty(globalThis, "Blob", {
      value: BlobStub,
      configurable: true,
    });

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

    const copyItem = wrapper
      .findComponent(SplitButton)
      .props("items")
      .find((i: { label: string }) => i.label === "Copy to clipboard");
    await copyItem!.onClick();

    expect(clipboardWriteMock).toHaveBeenCalledTimes(1);
    expect(clipboardWriteTextMock).not.toHaveBeenCalled();
    expect(sendNotificationMock).toHaveBeenCalledWith({
      message: "ORBAT copied to clipboard",
    });
    expect(clipboardItemData).toBeDefined();

    const textPlain = await clipboardItemData!["text/plain"].text();
    const parsed = JSON.parse(textPlain);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("1st Infantry Division");
    expect(parsed[0].sidc).toBeDefined();
    expect(parsed[0].subUnits[0].name).toBe("1st Brigade");
    expect(parsed[0].subUnits[0].subUnits[0].name).toBe("1st");
    expect(parsed[0].id).not.toBe(parsed[0].subUnits[0].id);

    Object.defineProperty(globalThis, "Blob", {
      value: OriginalBlob,
      configurable: true,
    });
    wrapper.unmount();
  });

  it("disables copy when there are no parsed units", async () => {
    Object.defineProperty(globalThis, "ClipboardItem", {
      value: undefined,
      configurable: true,
    });

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

    const getCopyItem = () =>
      wrapper
        .findComponent(SplitButton)
        .props("items")
        .find((i: { label: string }) => i.label === "Copy to clipboard");

    expect(getCopyItem()!.disabled).toBeFalsy();

    wrapper.findComponent(TextToOrbatEditor).vm.$emit("update:modelValue", "");
    await nextTick();

    expect(getCopyItem()!.disabled).toBeTruthy();
    wrapper.unmount();
  });

  it("falls back to writeText when ClipboardItem is unavailable", async () => {
    Object.defineProperty(globalThis, "ClipboardItem", {
      value: undefined,
      configurable: true,
    });

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

    const copyItem = wrapper
      .findComponent(SplitButton)
      .props("items")
      .find((i: { label: string }) => i.label === "Copy to clipboard");
    await copyItem!.onClick();

    expect(clipboardWriteMock).not.toHaveBeenCalled();
    expect(clipboardWriteTextMock).toHaveBeenCalledTimes(1);
    const payload = clipboardWriteTextMock.mock.calls[0][0];
    const parsed = JSON.parse(payload);
    expect(parsed[0].name).toBe("1st Infantry Division");
    expect(parsed[0].subUnits[0].name).toBe("1st Brigade");
    expect(sendNotificationMock).toHaveBeenCalledWith({
      message: "ORBAT copied to clipboard",
    });

    wrapper.unmount();
  });

  it("exports ORBAT data during drag start for scenario editor drops", async () => {
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

    const setData = vi.fn();
    const dataTransfer = {
      effectAllowed: "none",
      setData,
    };

    await wrapper.get('button[title="Drag ORBAT into scenario"]').trigger("dragstart", {
      dataTransfer,
    });

    expect(dataTransfer.effectAllowed).toBe("copy");
    expect(setData).toHaveBeenCalledWith("application/orbat", expect.any(String));
    expect(setData).toHaveBeenCalledWith("text/plain", expect.any(String));

    const payload = setData.mock.calls.find(
      ([mime]) => mime === "application/orbat",
    )?.[1];
    const parsed = JSON.parse(payload);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("1st Infantry Division");
    expect(parsed[0].subUnits[0].name).toBe("1st Brigade");

    wrapper.unmount();
  });

  it("registers a drag handle for each generated unit icon", () => {
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

    expect(draggableMock).toHaveBeenCalled();
    expect(draggableMock).toHaveBeenCalledTimes(9);

    wrapper.unmount();
  });

  it("dragging a root unit icon exports only that subtree", () => {
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

    const dragConfigs = getExternalDragConfigs();
    const rootDragConfig = dragConfigs.find(
      (config) => getApplicationOrbatPayload(config)[0]?.name === "1st Infantry Division",
    );
    expect(rootDragConfig?.getInitialDataForExternal).toBeTypeOf("function");

    const parsed = getApplicationOrbatPayload(rootDragConfig!);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("1st Infantry Division");
    expect(parsed[0].subUnits).toHaveLength(4);
    expect(parsed[0].subUnits[0].name).toBe("1st Brigade");
    expect(parsed[0].subUnits[0].subUnits[0].name).toBe("1st");

    wrapper.unmount();
  });

  it("dragging a child unit icon exports only the child subtree", () => {
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

    const dragConfigs = getExternalDragConfigs();
    const childDragConfig = dragConfigs.find(
      (config) => getApplicationOrbatPayload(config)[0]?.name === "1st Brigade",
    );
    expect(childDragConfig?.getInitialDataForExternal).toBeTypeOf("function");

    const parsed = getApplicationOrbatPayload(childDragConfig!);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("1st Brigade");
    expect(parsed[0].subUnits).toHaveLength(2);
    expect(parsed[0].subUnits[0].name).toBe("1st");
    expect(parsed[0].subUnits[1].name).toBe("2nd Art");

    wrapper.unmount();
  });

  it("shows an error notification when clipboard copy fails", async () => {
    Object.defineProperty(globalThis, "ClipboardItem", {
      value: undefined,
      configurable: true,
    });
    clipboardWriteTextMock.mockRejectedValueOnce(new Error("copy failed"));

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

    const copyItem = wrapper
      .findComponent(SplitButton)
      .props("items")
      .find((i: { label: string }) => i.label === "Copy to clipboard");
    await copyItem!.onClick();

    expect(sendNotificationMock).toHaveBeenCalledWith({
      message: "Failed to copy ORBAT to clipboard",
      type: "error",
    });

    wrapper.unmount();
  });
});
