import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import {
  BUILTIN_ECHELON_DEFINITIONS,
  type EchelonDefinition,
} from "@/views/texttoorbat/echelonRegistry";
import {
  BUILTIN_ICON_DEFINITIONS,
  type IconDefinition,
} from "@/views/texttoorbat/iconRegistry";

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
  const normalized = alias
    .replace(/\\s\*/g, " ")
    .replace(/\\s\+/g, " ")
    .replace(/\\s/g, " ")
    .replace(/\\\./g, "")
    .replace(/\[\- ]\?/g, "-")
    .replace(/\[- ]\?/g, "-")
    .replace(/\(\?:/g, "(")
    .replace(/\(\?[:!=<].*?\)/g, "")
    .replace(/\(\?:|\(|\)|\?|\+|\*|\{.*?\}/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || /[\\^$]/.test(normalized)) {
    return null;
  }

  return normalized;
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
    const exactWordMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\\b$/);
    if (exactWordMatch) {
      return [exactWordMatch[1].toLowerCase()];
    }

    const lookaheadMatch = source.match(/^\\b([A-Za-z][A-Za-z0-9/-]{1,})\(\?=/);
    if (lookaheadMatch) {
      return [lookaheadMatch[1].toLowerCase()];
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
    const values = [
      definition.label.trim(),
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
          detail,
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

export function getUnitTypeCompletions(): Completion[] {
  return buildCompletionsFromDefinitions(
    BUILTIN_ICON_DEFINITIONS,
    "Recognized unit type",
    (definition) =>
      buildIconPreviewSidc(
        (definition as IconDefinition).code,
        (definition as IconDefinition).symbolSet ?? DEFAULT_SYMBOL_SET,
      ),
  );
}

export function getEchelonCompletions(): Completion[] {
  return buildCompletionsFromDefinitions(
    BUILTIN_ECHELON_DEFINITIONS,
    "Recognized echelon",
    (definition) => buildEchelonPreviewSidc((definition as EchelonDefinition).code),
  );
}

export function getTextToOrbatCompletions(): Completion[] {
  return [...getUnitTypeCompletions(), ...getEchelonCompletions()];
}

export function completeUnitTypes(context: CompletionContext): CompletionResult | null {
  const word = getActiveCompletionText(context);

  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  const allOptions = getTextToOrbatCompletions();
  let options = filterCompletionOptions(word.text, allOptions);
  let from = word.from;
  if (options.length === 0 && word.text.includes(" ")) {
    const lastToken = getLastTokenRange(word.text, word.to);
    if (lastToken) {
      options = filterCompletionOptions(lastToken.text, allOptions);
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
) {
  return autocompletion({
    override: [completeUnitTypes],
    activateOnTyping: true,
    defaultKeymap: true,
    ...options,
  });
}
