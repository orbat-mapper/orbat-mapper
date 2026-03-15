<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { EditorState, type Extension } from "@codemirror/state";
import {
  type KeyBinding,
  EditorView,
  keymap,
  placeholder as placeholderExtension,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  applyIndentedNewline,
  applyShiftTabOutdent,
  applyTabIndent,
} from "@/views/texttoorbat/textEditorCommands";
import { INDENT_SIZE } from "@/views/texttoorbat/textToOrbat";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  {
    placeholder: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editorRoot = ref<HTMLDivElement | null>(null);
const editorView = shallowRef<EditorView | null>(null);

function dispatchDocumentChange(
  view: EditorView,
  nextValue: string,
  selectionStart: number,
  selectionEnd: number,
) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: nextValue },
    selection: {
      anchor: Math.max(0, Math.min(selectionStart, nextValue.length)),
      head: Math.max(0, Math.min(selectionEnd, nextValue.length)),
    },
    scrollIntoView: true,
  });
}

function createWholeDocumentCommand(
  handler: (
    value: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  },
): NonNullable<KeyBinding["run"]> {
  return ({ state, dispatch }) => {
    const selection = state.selection.main;
    const result = handler(state.doc.toString(), selection.from, selection.to);
    dispatch({
      changes: { from: 0, to: state.doc.length, insert: result.value },
      selection: {
        anchor: Math.max(0, Math.min(result.selectionStart, result.value.length)),
        head: Math.max(0, Math.min(result.selectionEnd, result.value.length)),
      },
      scrollIntoView: true,
    });
    return true;
  };
}

const indentCommand = createWholeDocumentCommand((value, selectionStart, selectionEnd) =>
  applyTabIndent(value, selectionStart, selectionEnd, INDENT_SIZE),
);
const outdentCommand = createWholeDocumentCommand((value, selectionStart, selectionEnd) =>
  applyShiftTabOutdent(value, selectionStart, selectionEnd, INDENT_SIZE),
);
const newlineCommand = createWholeDocumentCommand((value, selectionStart, selectionEnd) =>
  applyIndentedNewline(value, selectionStart, selectionEnd),
);

onMounted(() => {
  if (!editorRoot.value) {
    return;
  }

  const extensions: Extension[] = [
    history(),
    EditorView.lineWrapping,
    keymap.of([
      { key: "Tab", run: indentCommand },
      { key: "Shift-Tab", run: outdentCommand },
      { key: "Enter", run: newlineCommand },
      ...historyKeymap,
      ...defaultKeymap,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit("update:modelValue", update.state.doc.toString());
      }
    }),
    EditorView.contentAttributes.of({
      "aria-label": "Text to ORBAT input",
      spellcheck: "false",
    }),
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "0.875rem",
      },
      ".cm-scroller": {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        overflow: "auto",
      },
      ".cm-content, .cm-gutter": {
        minHeight: "100%",
      },
      ".cm-content": {
        padding: "0.75rem",
        caretColor: "var(--foreground)",
      },
      ".cm-line": {
        padding: 0,
      },
      "&.cm-focused": {
        outline: "none",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--foreground)",
      },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "color-mix(in srgb, var(--primary) 18%, transparent)",
      },
      ".cm-placeholder": {
        color: "var(--muted-foreground)",
      },
    }),
  ];

  if (props.placeholder) {
    extensions.push(placeholderExtension(props.placeholder));
  }

  editorView.value = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions,
    }),
    parent: editorRoot.value,
  });
});

watch(
  () => props.modelValue,
  (nextValue) => {
    const view = editorView.value;
    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    if (currentValue === nextValue) {
      return;
    }

    const { from, to } = view.state.selection.main;
    dispatchDocumentChange(view, nextValue, from, to);
  },
);

onBeforeUnmount(() => {
  editorView.value?.destroy();
  editorView.value = null;
});

defineExpose({
  getEditorView: () => editorView.value,
});
</script>

<template>
  <div ref="editorRoot" class="text-to-orbat-editor h-full min-h-0 w-full" />
</template>
