/**
 * CodeMirror 6 support for the text format: indentation keys, metadata and
 * comment highlighting, and autocompletion of icon and echelon words with
 * symbol previews.
 *
 * ```ts
 * new EditorView({
 *   extensions: [history(), textToOrbatEditing(engine, { renderSymbol }), ...],
 * });
 * ```
 *
 * Styling is left to the app: target {@link TEXT_TO_ORBAT_CLASSES}.
 */

import { autocompletion, startCompletion } from "@codemirror/autocomplete";
import { Prec, type EditorState, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  ViewPlugin,
  type Command,
  type ViewUpdate,
} from "@codemirror/view";
import type { TextToOrbat } from "../engine";
import { analyzeLine } from "../lineSyntax";
import { INDENT_SIZE } from "../parser";
import {
  applyIndentedNewline,
  applyShiftTabOutdent,
  applyTabIndent,
  type TextEditorCommandResult,
} from "./commands";
import { completeUnitTypes, type TextToOrbatCompletion } from "./completion";

export const TEXT_TO_ORBAT_CLASSES = {
  /** Mark on `[...]`, `// ...` and `|...|` metadata. */
  metadata: "cm-text-to-orbat-metadata",
  /** Mark on `# ...` comments. */
  comment: "cm-text-to-orbat-comment",
  /** Wrapper around a completion's symbol preview. */
  completionPreview: "text-to-orbat-completion-preview",
} as const;

export interface TextToOrbatEditingOptions {
  /** Offer icon and echelon words while typing. Default true. */
  autocomplete?: boolean;
  /** Match completions to the typed casing ("Air" → "Air Assault"). Default true. */
  matchInputCase?: boolean;
  /** Draw the symbol shown next to a completion. Without it, none is shown. */
  renderSymbol?: (sidc: string) => Node | null;
  /** Extra CodeMirror autocompletion config, merged over the defaults. */
  autocompleteConfig?: Parameters<typeof autocompletion>[0];
}

const metadataMark = Decoration.mark({ class: TEXT_TO_ORBAT_CLASSES.metadata });
const commentMark = Decoration.mark({ class: TEXT_TO_ORBAT_CLASSES.comment });

function buildDecorations(state: EditorState) {
  const ranges = [];
  for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber += 1) {
    const line = state.doc.line(lineNumber);
    for (const range of analyzeLine(line.text)) {
      const mark = range.kind === "comment" ? commentMark : metadataMark;
      ranges.push(mark.range(line.from + range.from, line.from + range.to));
    }
  }
  return Decoration.set(ranges, true);
}

const highlighting = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildDecorations(update.state);
      }
    }
  },
  { decorations: (value) => value.decorations },
);

function wholeDocumentCommand(
  handler: (value: string, from: number, to: number) => TextEditorCommandResult,
): Command {
  return ({ state, dispatch }) => {
    const selection = state.selection.main;
    const result = handler(state.doc.toString(), selection.from, selection.to);
    dispatch(
      state.update({
        changes: { from: 0, to: state.doc.length, insert: result.value },
        selection: {
          anchor: Math.max(0, Math.min(result.selectionStart, result.value.length)),
          head: Math.max(0, Math.min(result.selectionEnd, result.value.length)),
        },
        scrollIntoView: true,
      }),
    );
    return true;
  };
}

const indentKeymap = keymap.of([
  {
    key: "Tab",
    run: wholeDocumentCommand((v, from, to) => applyTabIndent(v, from, to, INDENT_SIZE)),
  },
  {
    key: "Shift-Tab",
    run: wholeDocumentCommand((v, from, to) =>
      applyShiftTabOutdent(v, from, to, INDENT_SIZE),
    ),
  },
  { key: "Enter", run: wholeDocumentCommand(applyIndentedNewline) },
  { key: "Ctrl-Space", run: startCompletion },
]);

function completionExtension(
  engine: TextToOrbat,
  options: TextToOrbatEditingOptions,
): Extension {
  const { renderSymbol, matchInputCase = true } = options;
  return autocompletion({
    override: [(context) => completeUnitTypes(context, engine, matchInputCase)],
    activateOnTyping: true,
    defaultKeymap: true,
    ...(renderSymbol && {
      addToOptions: [
        {
          position: 15,
          render: (completion) => {
            const sidc = (completion as TextToOrbatCompletion).previewSidc;
            const symbol = sidc ? renderSymbol(sidc) : null;
            if (!symbol) return null;
            const wrapper = document.createElement("span");
            wrapper.className = TEXT_TO_ORBAT_CLASSES.completionPreview;
            wrapper.setAttribute("aria-hidden", "true");
            wrapper.appendChild(symbol);
            return wrapper;
          },
        },
      ],
    }),
    ...options.autocompleteConfig,
  });
}

/**
 * Everything the text format needs in a CodeMirror editor. Completions follow
 * changes to `engine.mappings` without reconfiguring; reconfigure (for
 * instance in a `Compartment`) to change these options.
 */
export function textToOrbatEditing(
  engine: TextToOrbat,
  options: TextToOrbatEditingOptions = {},
): Extension {
  return [
    highlighting,
    Prec.high(indentKeymap),
    options.autocomplete === false ? [] : completionExtension(engine, options),
  ];
}
