<script setup lang="ts">
import { startCompletion } from "@codemirror/autocomplete";
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  Decoration,
  type KeyBinding,
  EditorView,
  keymap,
  placeholder as placeholderExtension,
  ViewPlugin,
  type ViewUpdate,
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
import {
  INDENT_SIZE,
  serializeUnitsToIndentedText,
} from "@/views/texttoorbat/textToOrbat";
import {
  defaultRegistry,
  type MappingRegistry,
} from "@/views/texttoorbat/mappingRegistry";
import type { Unit } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    enableAutocomplete?: boolean;
    matchInputCase?: boolean;
    registry?: MappingRegistry;
    registryVersion?: number;
  }>(),
  {
    placeholder: "",
    enableAutocomplete: true,
    matchInputCase: true,
    registry: () => defaultRegistry,
    registryVersion: 0,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editorRoot = ref<HTMLDivElement | null>(null);
const editorView = shallowRef<EditorView | null>(null);
const autocompleteCompartment = new Compartment();
const metadataMark = Decoration.mark({ class: "cm-text-to-orbat-metadata" });
const commentMark = Decoration.mark({ class: "cm-text-to-orbat-comment" });

function getMetadataRanges(line: string): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = [];
  const commentStart = line.indexOf("#");
  const content = commentStart === -1 ? line : line.slice(0, commentStart);
  const bracketPattern = /\[[^[\]]*\]/g;
  let match: RegExpExecArray | null;

  while ((match = bracketPattern.exec(content)) !== null) {
    ranges.push({ from: match.index, to: match.index + match[0].length });
  }

  const slashSlashIndex = content.indexOf("//");
  if (slashSlashIndex !== -1) {
    ranges.push({ from: slashSlashIndex, to: content.length });
    return ranges.sort((a, b) => a.from - b.from);
  }

  const pipeIndexes = [...content.matchAll(/\|/g)]
    .map((item) => item.index ?? -1)
    .filter((i) => i >= 0);
  if (pipeIndexes.length === 1) {
    const start = pipeIndexes[0];
    if (start < content.length - 1) {
      ranges.push({ from: start, to: content.length });
    }
  } else if (pipeIndexes.length >= 2) {
    for (let i = 0; i + 1 < pipeIndexes.length; i += 2) {
      const start = pipeIndexes[i];
      const end = pipeIndexes[i + 1] + 1;
      if (end > start + 1) {
        ranges.push({ from: start, to: end });
      }
    }
  }

  return ranges.sort((a, b) => a.from - b.from);
}

function getCommentRange(line: string): { from: number; to: number } | null {
  const commentStart = line.indexOf("#");
  if (commentStart === -1) {
    return null;
  }
  return { from: commentStart, to: line.length };
}

function buildMetadataDecorations(state: EditorState) {
  const ranges = [];

  for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber += 1) {
    const line = state.doc.line(lineNumber);
    const commentRange = getCommentRange(line.text);
    for (const range of getMetadataRanges(line.text)) {
      ranges.push(metadataMark.range(line.from + range.from, line.from + range.to));
    }
    if (commentRange) {
      ranges.push(
        commentMark.range(line.from + commentRange.from, line.from + commentRange.to),
      );
    }
  }

  return Decoration.set(ranges, true);
}

const metadataHighlightExtension = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view: EditorView) {
      this.decorations = buildMetadataDecorations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildMetadataDecorations(update.state);
      }
    }
  },
  {
    decorations: (value) => value.decorations,
  },
);

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

  return textToOrbatAutocompletion(
    {
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
    },
    props.registry,
    props.matchInputCase,
  );
}

onMounted(() => {
  if (!editorRoot.value) {
    return;
  }

  const extensions: Extension[] = [
    history(),
    EditorView.lineWrapping,
    metadataHighlightExtension,
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
    EditorView.domEventHandlers({
      drop(event, view) {
        const orbatData = event.dataTransfer?.getData("application/orbat");
        if (!orbatData) return false;
        try {
          const units: Unit[] = JSON.parse(orbatData);
          const text = serializeUnitsToIndentedText(units);
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

watch(
  [
    () => props.enableAutocomplete,
    () => props.registryVersion,
    () => props.matchInputCase,
  ],
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
