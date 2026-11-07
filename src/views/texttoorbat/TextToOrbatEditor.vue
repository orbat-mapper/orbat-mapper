<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  placeholder as placeholderExtension,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { unitsToText, type TextToOrbat } from "@/lib/textToOrbat";
import { textToOrbatEditing } from "@/lib/textToOrbat/codemirror";
import type { Unit } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    engine: TextToOrbat;
    placeholder?: string;
    enableAutocomplete?: boolean;
    matchInputCase?: boolean;
  }>(),
  {
    placeholder: "",
    enableAutocomplete: true,
    matchInputCase: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editorRoot = ref<HTMLDivElement | null>(null);
const editorView = shallowRef<EditorView | null>(null);
const editingCompartment = new Compartment();

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

function renderSymbol(sidc: string) {
  return symbolGenerator(sidc, {
    size: 18,
    simpleStatusModifier: false,
    outlineColor: "white",
    outlineWidth: 6,
  }).asDOM();
}

function createEditingExtension() {
  return textToOrbatEditing(props.engine, {
    autocomplete: props.enableAutocomplete,
    matchInputCase: props.matchInputCase,
    renderSymbol,
    autocompleteConfig: {
      icons: false,
      tooltipClass: () => "text-to-orbat-completion-tooltip",
      optionClass: () => "text-to-orbat-completion-option",
    },
  });
}

onMounted(() => {
  if (!editorRoot.value) {
    return;
  }

  const extensions: Extension[] = [
    history(),
    EditorView.lineWrapping,
    editingCompartment.of(createEditingExtension()),
    keymap.of([...historyKeymap, ...defaultKeymap]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit("update:modelValue", update.state.doc.toString());
      }
    }),
    EditorView.domEventHandlers({
      drop(event, view) {
        const orbatData = event.dataTransfer?.getData("application/orbat");
        if (!orbatData) return false;
        try {
          const units: Unit[] = JSON.parse(orbatData);
          const text = unitsToText(units);
          const pos =
            view.posAtCoords({ x: event.clientX, y: event.clientY }) ??
            view.state.doc.length;
          view.dispatch({ changes: { from: pos, insert: text } });
          event.preventDefault();
          return true;
        } catch {
          return false;
        }
      },
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
      ".cm-text-to-orbat-metadata": {
        color: "color-mix(in srgb, var(--chart-2) 78%, var(--foreground) 22%)",
        backgroundColor: "color-mix(in srgb, var(--chart-2) 18%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--chart-2) 24%, transparent)",
        borderRadius: "0.2rem",
        padding: "0 0.14rem",
        fontWeight: "500",
      },
      ".cm-text-to-orbat-comment": {
        color: "color-mix(in srgb, var(--muted-foreground) 88%, var(--foreground) 12%)",
        fontStyle: "italic",
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

watch([() => props.enableAutocomplete, () => props.matchInputCase], () => {
  const view = editorView.value;
  if (!view) {
    return;
  }

  view.dispatch({
    effects: editingCompartment.reconfigure(createEditingExtension()),
  });
});

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
