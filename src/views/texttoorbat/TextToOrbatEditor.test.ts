import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EditorView } from "@codemirror/view";
import TextToOrbatEditor from "@/views/texttoorbat/TextToOrbatEditor.vue";
import { INDENT_SIZE } from "@/views/texttoorbat/textToOrbat";

const mountedWrappers: VueWrapper[] = [];

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

function trackWrapper(wrapper: VueWrapper) {
  mountedWrappers.push(wrapper);
  return wrapper;
}

function getLastEmission(wrapper: VueWrapper) {
  const events = wrapper.emitted("update:modelValue");
  return events ? events[events.length - 1] : undefined;
}

function getEditorView(wrapper: VueWrapper) {
  return (
    wrapper.vm as unknown as { getEditorView: () => EditorView | null }
  ).getEditorView();
}

async function pressKey(
  view: EditorView,
  key: string,
  options: Partial<KeyboardEventInit> = {},
) {
  view.focus();
  view.contentDOM.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    }),
  );
  await nextTick();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

afterEach(() => {
  while (mountedWrappers.length > 0) {
    mountedWrappers.pop()?.unmount();
  }
});

describe("TextToOrbatEditor", () => {
  it("renders the initial value", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "1st Infantry Division",
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    expect(view?.state.doc.toString()).toBe("1st Infantry Division");
  });

  it("emits v-model updates when the document changes", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "Alpha",
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    view?.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: "Bravo" },
    });
    await nextTick();

    expect(getLastEmission(wrapper)).toEqual(["Bravo"]);
  });

  it("inserts one indent level on Tab", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "Alpha",
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    if (!view) {
      throw new Error("Expected editor view to exist");
    }

    view.dispatch({ selection: { anchor: 0 } });
    await pressKey(view, "Tab");

    expect(getLastEmission(wrapper)).toEqual([`${" ".repeat(INDENT_SIZE)}Alpha`]);
  });

  it("removes one indent level on Shift-Tab", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "  Alpha\n    Bravo",
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    if (!view) {
      throw new Error("Expected editor view to exist");
    }

    view.dispatch({
      selection: { anchor: 0, head: view.state.doc.length },
    });
    await pressKey(view, "Tab", { shiftKey: true });

    expect(getLastEmission(wrapper)).toEqual(["Alpha\n  Bravo"]);
  });

  it("preserves indentation on Enter", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "  Alpha",
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    if (!view) {
      throw new Error("Expected editor view to exist");
    }

    view.dispatch({ selection: { anchor: view.state.doc.length } });
    await pressKey(view, "Enter");

    expect(getLastEmission(wrapper)).toEqual(["  Alpha\n  "]);
  });

  it("does not open autocomplete when disabled", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "frig",
          enableAutocomplete: false,
        },
      }),
    );
    await nextTick();

    const view = getEditorView(wrapper);
    if (!view) {
      throw new Error("Expected editor view to exist");
    }

    view.dispatch({ selection: { anchor: view.state.doc.length } });
    await pressKey(view, " ", { ctrlKey: true });

    expect(document.querySelector(".cm-tooltip-autocomplete")).toBeNull();
  });

  it("renders metadata with distinct syntax highlighting", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue: "Alpha [brigade] |mechanized infantry|\nBravo |artillery",
        },
      }),
    );
    await nextTick();

    const metadataNodes = wrapper.findAll(".cm-text-to-orbat-metadata");
    expect(metadataNodes).toHaveLength(3);
    expect(metadataNodes.map((node) => node.text())).toEqual([
      "[brigade]",
      "|mechanized infantry|",
      "|artillery",
    ]);
  });

  it("renders comments with distinct syntax highlighting", async () => {
    const wrapper = trackWrapper(
      mount(TextToOrbatEditor, {
        attachTo: document.body,
        props: {
          modelValue:
            "Alpha [brigade] |mechanized infantry| # note\n# whole-line comment",
        },
      }),
    );
    await nextTick();

    const commentNodes = wrapper.findAll(".cm-text-to-orbat-comment");
    expect(commentNodes).toHaveLength(2);
    expect(commentNodes.map((node) => node.text())).toEqual([
      "# note",
      "# whole-line comment",
    ]);
  });
});
