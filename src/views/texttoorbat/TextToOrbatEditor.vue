<script setup lang="ts">
import { startCompletion } from "@codemirror/autocomplete";
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
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
import {
  textToOrbatAutocompletion,
  type TextToOrbatCompletion,
} from "@/views/texttoorbat/textEditorSuggestions";
import { INDENT_SIZE } from "@/views/texttoorbat/textToOrbat";
import { symbolGenerator } from "@/symbology/milsymbwrapper";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    enableAutocomplete?: boolean;
  }>(),
  {
    placeholder: "",
    enableAutocomplete: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editorRoot = ref<HTMLDivElement | null>(null);
const editorView = shallowRef<EditorView | null>(null);
const autocompleteCompartment = new Compartment();

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

function renderCompletionPreview(completion: TextToOrbatCompletion) {
  if (!completion.previewSidc) {
    return null;
  }

  const wrapper = document.createElement("span");
  wrapper.className = "text-to-orbat-completion-preview";
  wrapper.setAttribute("aria-hidden", "true");

  const symbolNode = symbolGenerator(completion.previewSidc, {
    size: 18,
    simpleStatusModifier: false,
    outlineColor: "white",
    outlineWidth: 6,
  }).asDOM();
  wrapper.innerHTML = symbolNode.outerHTML;

  return wrapper;
}

function createAutocompleteExtension() {
  if (!props.enableAutocomplete) {
    return [];
  }

  return textToOrbatAutocompletion({
    icons: false,
    tooltipClass: () => "text-to-orbat-completion-tooltip",
    optionClass: () => "text-to-orbat-completion-option",
    addToOptions: [
      {
        position: 15,
        render: (completion) =>
          renderCompletionPreview(completion as TextToOrbatCompletion),
      },
    ],
  });
}

onMounted(() => {
  if (!editorRoot.value) {
    return;
  }

  const extensions: Extension[] = [
    history(),
    EditorView.lineWrapping,
    autocompleteCompartment.of(createAutocompleteExtension()),
    keymap.of([
      { key: "Tab", run: indentCommand },
      { key: "Shift-Tab", run: outdentCommand },
      { key: "Enter", run: newlineCommand },
      { key: "Ctrl-Space", run: startCompletion },
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
      ".text-to-orbat-completion-preview": {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.75rem",
        marginRight: "0.25rem",
        flexShrink: "0",
      },
      ".text-to-orbat-completion-preview svg": {
        display: "block",
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
      ".cm-tooltip": {
        border: "1px solid var(--border)",
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        borderRadius: "calc(var(--radius) + 2px)",
        boxShadow:
          "0 10px 30px -12px color-mix(in srgb, var(--foreground) 18%, transparent), 0 8px 12px -8px color-mix(in srgb, var(--foreground) 14%, transparent)",
        padding: "0.25rem",
        backdropFilter: "blur(8px)",
      },
      ".cm-tooltip-autocomplete ul": {
        padding: 0,
        margin: 0,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
      ".cm-tooltip-autocomplete ul li": {
        color: "var(--popover-foreground)",
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        borderRadius: "calc(var(--radius) - 4px)",
        padding: "0.5rem 0.625rem",
        margin: "0.125rem 0",
        lineHeight: "1.2",
      },
      ".cm-tooltip-autocomplete ul li[aria-selected]": {
        backgroundColor: "color-mix(in srgb, var(--accent) 88%, transparent)",
        color: "var(--accent-foreground)",
      },
      ".cm-tooltip-autocomplete ul li:hover": {
        backgroundColor: "color-mix(in srgb, var(--accent) 72%, transparent)",
      },
      ".cm-completionLabel": {
        color: "inherit",
        fontWeight: "500",
      },
      ".cm-completionDetail": {
        color: "var(--muted-foreground)",
        marginLeft: "auto",
        fontSize: "0.75rem",
        letterSpacing: "0.01em",
      },
      ".text-to-orbat-completion-tooltip": {
        fontSize: "0.875rem",
      },
      ".text-to-orbat-completion-option": {
        listStyle: "none",
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

watch(
  () => props.enableAutocomplete,
  () => {
    const view = editorView.value;
    if (!view) {
      return;
    }

    view.dispatch({
      effects: autocompleteCompartment.reconfigure(createAutocompleteExtension()),
    });
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
