import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { type EchelonDefinition } from "@/views/texttoorbat/echelonRegistry";
import { type IconDefinition } from "@/views/texttoorbat/iconRegistry";
import {
  defaultRegistry,
  type MappingRegistry,
} from "@/views/texttoorbat/mappingRegistry";

const FRIENDLY_SI = "3";
const DEFAULT_SYMBOL_SET = "10";
const DEFAULT_ICON_CODE = "1211000000";

export interface TextToOrbatCompletion extends Completion {
  previewSidc?: string;
}

function normalizeSuggestionKey(value: string) {
  return value.trim().toLowerCase();
}

function buildIconPreviewSidc(entityCode: string, symbolSet = DEFAULT_SYMBOL_SET) {
  return `100${FRIENDLY_SI}${symbolSet}0000${entityCode}`;
}

function buildEchelonPreviewSidc(echelonCode: string) {
  return `10031000${echelonCode}${DEFAULT_ICON_CODE}`;
}

function normalizeAliasForCompletion(alias: string) {
  const normalized = alias.replace(/[().]/g, "").replace(/\s+/g, " ").trim();

  return normalized || null;
}

function extractLabelAbbreviations(label: string) {
  const parts = [...label.matchAll(/\(([^)]+)\)/g)].flatMap((match) =>
    match[1]
      .split("/")
      .map((part) => part.trim().toLowerCase())
      .filter((part) => /^[a-z][a-z0-9-]{1,}$/.test(part)),
  );

  return parts;
}

function extractLiteralPatternSuggestions(patterns?: RegExp[]) {
  if (!patterns) {
    return [];
  }

  return patterns.flatMap((pattern) => {
    const source = pattern.source;
    const caseInsensitive = pattern.flags.includes("i");
    const exactWordMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\\b$/);
    if (exactWordMatch) {
      return [caseInsensitive ? exactWordMatch[1].toLowerCase() : exactWordMatch[1]];
    }

    const lookaheadMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\(\?=/);
    if (lookaheadMatch) {
      return [caseInsensitive ? lookaheadMatch[1].toLowerCase() : lookaheadMatch[1]];
    }

    return [];
  });
}

function buildCompletionsFromDefinitions(
  definitions: (IconDefinition | EchelonDefinition)[],
  detail: string,
  getPreviewSidc: (definition: IconDefinition | EchelonDefinition) => string,
) {
  const seen = new Set<string>();

  return definitions.flatMap((definition) => {
    const previewSidc = getPreviewSidc(definition);
    const defLabel = definition.label.trim();
    const values = [
      defLabel,
      ...extractLabelAbbreviations(definition.label),
      ...(definition.aliases ?? [])
        .map((alias) => normalizeAliasForCompletion(alias))
        .filter((alias): alias is string => Boolean(alias)),
      ...extractLiteralPatternSuggestions(definition.patterns),
    ];

    return values.flatMap((value) => {
      const key = normalizeSuggestionKey(value);
      if (!value || seen.has(key)) {
        return [];
      }

      seen.add(key);

      return [
        {
          label: value,
          type: "keyword",
          detail: value === defLabel ? undefined : defLabel,
          apply: value,
          previewSidc,
        } satisfies TextToOrbatCompletion,
      ];
    });
  });
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

export function getUnitTypeCompletions(
  registry: MappingRegistry = defaultRegistry,
): Completion[] {
  return buildCompletionsFromDefinitions(
    [...registry.iconDefinitions],
    "unit type",
    (definition) => {
      const sidc = (definition as IconDefinition).sidc;
      return sidc.substring(0, 3) + FRIENDLY_SI + sidc.substring(4);
    },
  );
}

export function getEchelonCompletions(
  registry: MappingRegistry = defaultRegistry,
): Completion[] {
  return buildCompletionsFromDefinitions(
    [...registry.echelonDefinitions],
    "echelon",
    (definition) => buildEchelonPreviewSidc((definition as EchelonDefinition).code),
  );
}

export function getTextToOrbatCompletions(
  registry: MappingRegistry = defaultRegistry,
): Completion[] {
  return [...getUnitTypeCompletions(registry), ...getEchelonCompletions(registry)];
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

export function completeUnitTypes(
  context: CompletionContext,
  registry: MappingRegistry = defaultRegistry,
  matchInputCase = true,
): CompletionResult | null {
  const word = getActiveCompletionText(context);

  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  const allOptions = getTextToOrbatCompletions(registry);
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

export function textToOrbatAutocompletion(
  options?: Parameters<typeof autocompletion>[0],
  registry: MappingRegistry = defaultRegistry,
  matchInputCase = true,
) {
  return autocompletion({
    override: [(context) => completeUnitTypes(context, registry, matchInputCase)],
    activateOnTyping: true,
    defaultKeymap: true,
    ...options,
  });
}
