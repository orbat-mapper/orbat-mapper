import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import type { TextToOrbat } from "../engine";
import { normalizeSuggestionKey, type Suggestion } from "../suggestions";

export interface TextToOrbatCompletion extends Completion {
  previewSidc?: string;
}

// The engine returns the same suggestions array until its mappings change
const completionCache = new WeakMap<readonly Suggestion[], TextToOrbatCompletion[]>();

function getCompletions(engine: TextToOrbat): TextToOrbatCompletion[] {
  const suggestions = engine.suggestions();
  let completions = completionCache.get(suggestions);
  if (!completions) {
    completions = suggestions.map((suggestion) => ({
      label: suggestion.label,
      type: "keyword",
      detail: suggestion.detail,
      apply: suggestion.label,
      previewSidc: suggestion.previewSidc,
    }));
    completionCache.set(suggestions, completions);
  }
  return completions;
}

function getActiveCompletionText(context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos);
  const linePrefix = line.text.slice(0, context.pos - line.from);

  const phraseMatch = linePrefix.match(
    /(?:^|[^A-Za-z0-9-])([A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z][A-Za-z0-9-]*)*)$/,
  );

  if (phraseMatch) {
    return {
      from: context.pos - phraseMatch[1].length,
      to: context.pos,
      text: phraseMatch[1],
    };
  }

  const wordMatch = linePrefix.match(/([A-Za-z][A-Za-z0-9-]*)$/);
  if (!wordMatch) {
    return null;
  }

  return {
    from: context.pos - wordMatch[1].length,
    to: context.pos,
    text: wordMatch[1],
  };
}

function getLastTokenRange(text: string, to: number) {
  const match = text.match(/([A-Za-z][A-Za-z0-9-]*)$/);
  if (!match) {
    return null;
  }

  return {
    from: to - match[1].length,
    to,
    text: match[1],
  };
}

function filterCompletionOptions(text: string, options: Completion[]) {
  const normalizedText = normalizeSuggestionKey(text);
  const compactText = normalizedText.replace(/\s+/g, "");

  return options.filter((option) => {
    const normalizedLabel = normalizeSuggestionKey(option.label);
    const compactLabel = normalizedLabel.replace(/\s+/g, "");

    return (
      normalizedLabel.startsWith(normalizedText) ||
      compactLabel.startsWith(compactText) ||
      normalizedLabel.includes(normalizedText)
    );
  });
}

/**
 * Match the casing of the completion to the user's typed text.
 * If the user typed uppercase (e.g. "Air"), the completion "air assault"
 * becomes "Air Assault". If typed all-caps, the completion is all-caps too.
 */
function matchCase(typed: string, completion: string): string {
  if (!typed) return completion;
  const isAllCaps = typed === typed.toUpperCase() && typed !== typed.toLowerCase();
  if (isAllCaps) return completion.toUpperCase();
  const isCapitalized =
    typed[0] === typed[0].toUpperCase() && typed[0] !== typed[0].toLowerCase();
  if (isCapitalized) {
    return completion.replace(/\b[a-z]/g, (ch, index) =>
      index < typed.length || completion[index - 1] === " " ? ch.toUpperCase() : ch,
    );
  }
  return completion;
}

function applyWithMatchedCase(option: Completion, typed: string): Completion {
  const label = typeof option.apply === "string" ? option.apply : option.label;
  const matched = matchCase(typed, label);
  if (matched === label) return option;
  return { ...option, apply: matched };
}

/** Completion source: icon and echelon words for the phrase at the cursor. */
export function completeUnitTypes(
  context: CompletionContext,
  engine: TextToOrbat,
  matchInputCase = true,
): CompletionResult | null {
  const word = getActiveCompletionText(context);

  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  const allOptions = getCompletions(engine);
  const maybeMatchCase = (opt: Completion, typed: string) =>
    matchInputCase ? applyWithMatchedCase(opt, typed) : opt;
  let options = filterCompletionOptions(word.text, allOptions).map((opt) =>
    maybeMatchCase(opt, word.text),
  );
  let from = word.from;
  if (options.length === 0 && word.text.includes(" ")) {
    const lastToken = getLastTokenRange(word.text, word.to);
    if (lastToken) {
      options = filterCompletionOptions(lastToken.text, allOptions).map((opt) =>
        maybeMatchCase(opt, lastToken.text),
      );
      from = lastToken.from;
    }
  }
  if (options.length === 0 && !context.explicit) {
    return null;
  }

  return {
    from,
    options,
  };
}
