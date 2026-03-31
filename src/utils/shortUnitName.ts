export interface CreateShortUnitNameOptions {
  maxLength?: number;
  otherNames?: string[];
  existingShortNames?: string[];
  uppercase?: boolean;
  forceLength?: boolean;
  allowWhitespace?: boolean;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "de",
  "del",
  "der",
  "di",
  "do",
  "dos",
  "du",
  "el",
  "la",
  "las",
  "le",
  "les",
  "los",
  "of",
  "the",
  "van",
  "von",
  "y",
]);

const ECHELON_ABBREVIATIONS = new Map<string, string>([
  ["army group", "AG"],
  ["army", "Army"],
  ["corps", "Corps"],
  ["division", "Div"],
  ["divn", "Div"],
  ["brigade", "Bde"],
  ["brig", "Bde"],
  ["bgde", "Bde"],
  ["bde", "Bde"],
  ["combat team", "BCT"],
  ["bct", "BCT"],
  ["rct", "RCT"],
  ["regiment", "Rgt"],
  ["regt", "Rgt"],
  ["rgmt", "Rgt"],
  ["rgt", "Rgt"],
  ["group", "Grp"],
  ["grp", "Grp"],
  ["gp", "Gp"],
  ["battalion", "Bn"],
  ["btn", "Bn"],
  ["btln", "Bn"],
  ["bn", "Bn"],
  ["squadron", "Sqn"],
  ["sqdn", "Sqn"],
  ["sqn", "Sqn"],
  ["sq", "Sq"],
  ["company", "Coy"],
  ["coy", "Coy"],
  ["co", "Co"],
  ["battery", "Bty"],
  ["btry", "Bty"],
  ["bty", "Bty"],
  ["troop", "Trp"],
  ["trp", "Trp"],
  ["flight", "Flt"],
  ["flt", "Flt"],
  ["platoon", "Plt"],
  ["plt", "Plt"],
  ["pl", "Pl"],
  ["ptn", "Plt"],
  ["detachment", "Det"],
  ["det", "Det"],
  ["element", "Elem"],
  ["elem", "Elem"],
  ["section", "Sec"],
  ["sect", "Sec"],
  ["sec", "Sec"],
  ["sctn", "Sec"],
  ["squad", "Sqd"],
  ["sqd", "Sqd"],
  ["team", "Tm"],
  ["tm", "Tm"],
]);

const PREFERRED_ABBREVIATIONS = new Map<string, string>([
  ["ad", "AD"],
  ["armored", "Armd"],
  ["engineer", "Engr"],
  ["engineers", "Engr"],
  ["field", "Fd"],
  ["flank", "Flk"],
  ["guards", "Gds"],
  ["gurkha", "Gkha"],
  ["inf", "Inf"],
  ["infantry", "Inf"],
  ["left", "L"],
  ["recon", "Rec"],
  ["right", "R"],
  ["rifles", "Rif"],
  ["scots", "Scot"],
  ["welsh", "Wel"],
]);

const TOKEN_PATTERN = /[\p{L}\p{N}\p{M}/-]+/gu;
const NON_ALPHANUMERIC_PATTERN = /[^\p{L}\p{N}]/gu;
const DIACRITIC_PATTERN = /\p{M}+/gu;

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function shouldPreserveCompoundToken(token: string) {
  const parts = token.split(/[/-]+/).filter(Boolean);
  if (parts.length <= 1) return true;
  return parts.every((part) => part.length <= 3);
}

function tokenizeName(name: string) {
  const normalized = normalizeWhitespace(name);
  const rawTokens = normalized.match(TOKEN_PATTERN) ?? [];
  return rawTokens.flatMap((token) => {
    if (shouldPreserveCompoundToken(token)) return [token];
    return token.split(/[/-]+/).filter(Boolean);
  });
}

function normalizeTokenForCompare(token: string) {
  return token.normalize("NFD").replace(DIACRITIC_PATTERN, "").toLowerCase();
}

function compactToken(token: string) {
  return token.replace(NON_ALPHANUMERIC_PATTERN, "");
}

function isStopword(token: string) {
  return STOPWORDS.has(normalizeTokenForCompare(token));
}

function getEchelonAbbreviation(token: string) {
  return ECHELON_ABBREVIATIONS.get(normalizeTokenForCompare(token));
}

function getPreferredAbbreviation(token: string) {
  return PREFERRED_ABBREVIATIONS.get(normalizeTokenForCompare(token));
}

function getPrimaryContribution(
  token: string,
  options: { allowWhitespace?: boolean } = {},
) {
  const allowWhitespace = options.allowWhitespace ?? false;
  const compact = compactToken(token);
  if (!compact) return "";
  const leadingDigits = compact.match(/^\d+/)?.[0];
  if (leadingDigits) return leadingDigits;
  if (/^[A-Z0-9]+$/.test(compact) && compact.length <= 4) return compact;
  if (allowWhitespace) {
    const echelonAbbreviation = getEchelonAbbreviation(token);
    if (echelonAbbreviation) return echelonAbbreviation;

    const preferredAbbreviation = getPreferredAbbreviation(token);
    if (preferredAbbreviation) return preferredAbbreviation;
  }
  return compact[0]!.toUpperCase();
}

function getExpandedContribution(token: string) {
  const echelonAbbreviation = getEchelonAbbreviation(token);
  if (echelonAbbreviation) return echelonAbbreviation;

  const preferredAbbreviation = getPreferredAbbreviation(token);
  if (preferredAbbreviation) return preferredAbbreviation;

  const compact = compactToken(token);
  if (!compact) return "";
  const primary = getPrimaryContribution(token);
  if (compact.length <= primary.length) return primary;
  if (/^\d/.test(compact)) return primary;
  const firstChar = compact[0]!.toUpperCase();
  return (firstChar + compact.slice(1)).slice(0, 3);
}

function findSharedPrefixLength(tokenSets: string[][]) {
  if (tokenSets.length === 0) return 0;
  const minLength = Math.min(...tokenSets.map((tokens) => tokens.length));
  let prefixLength = 0;
  for (let index = 0; index < minLength; index += 1) {
    const candidate = normalizeTokenForCompare(tokenSets[0][index]!);
    if (
      tokenSets.every((tokens) => normalizeTokenForCompare(tokens[index]!) === candidate)
    ) {
      prefixLength += 1;
      continue;
    }
    break;
  }
  return prefixLength;
}

function findSupportedSharedPrefixLength(
  currentTokens: string[],
  siblingTokens: string[][],
) {
  let bestPrefixLength = 0;
  let bestSupport = 0;

  for (let prefixLength = 1; prefixLength < currentTokens.length; prefixLength += 1) {
    const prefix = currentTokens
      .slice(0, prefixLength)
      .map((token) => normalizeTokenForCompare(token));

    let support = 0;
    for (const tokens of siblingTokens) {
      if (tokens.length < prefixLength) continue;
      const matches = prefix.every(
        (token, index) => normalizeTokenForCompare(tokens[index] ?? "") === token,
      );
      if (matches) support += 1;
    }

    if (support < 2) continue;
    if (
      prefixLength > bestPrefixLength ||
      (prefixLength === bestPrefixLength && support > bestSupport)
    ) {
      bestPrefixLength = prefixLength;
      bestSupport = support;
    }
  }

  return bestPrefixLength;
}

function buildAbbreviationCandidate(
  contributions: string[],
  limit: number,
  allowWhitespace: boolean,
) {
  if (!allowWhitespace) return contributions.join("").slice(0, limit);

  let result = "";
  let visibleLength = 0;
  for (const contribution of contributions) {
    if (!contribution) continue;
    const nextVisibleLength = visibleLength + contribution.length;
    if (nextVisibleLength > limit) break;
    result += (result ? " " : "") + contribution;
    visibleLength = nextVisibleLength;
  }

  return result;
}

function getCandidateBudgetLength(candidate: string, allowWhitespace: boolean) {
  return allowWhitespace ? candidate.replace(/\s+/g, "").length : candidate.length;
}

function collectAbbreviationCandidates(
  primaryContributions: string[],
  expandedContributions: string[],
  limit: number,
  shouldExpand: boolean,
  allowWhitespace: boolean,
) {
  const baseContributions = [...primaryContributions];
  const candidates: string[] = [];
  const seenCandidates = new Set<string>();
  const visitedStates = new Set<string>();

  const pushCandidate = (parts: string[]) => {
    const candidate = buildAbbreviationCandidate(parts, limit, allowWhitespace);
    if (!candidate || seenCandidates.has(candidate)) return;
    seenCandidates.add(candidate);
    candidates.push(candidate);
  };

  let preferredContributions = [...baseContributions];
  if (shouldExpand) {
    let remaining =
      limit -
      getCandidateBudgetLength(
        buildAbbreviationCandidate(preferredContributions, limit, allowWhitespace),
        allowWhitespace,
      );
    for (
      let index = preferredContributions.length - 1;
      index >= 0 && remaining > 0;
      index -= 1
    ) {
      const current = preferredContributions[index] ?? "";
      const expanded = expandedContributions[index] ?? current;
      if (expanded.length <= current.length) continue;
      const additionalLength = allowWhitespace
        ? expanded.length - current.length <= remaining
          ? expanded.length - current.length
          : 0
        : Math.min(remaining, expanded.length - current.length);
      if (additionalLength <= 0) continue;
      preferredContributions[index] = expanded.slice(
        0,
        current.length + additionalLength,
      );
      remaining -= additionalLength;
    }
  }

  pushCandidate(preferredContributions);
  pushCandidate(baseContributions);
  if (!shouldExpand) return candidates;

  const queue: string[][] = [baseContributions];
  visitedStates.add(baseContributions.join("\u0000"));
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (let index = current.length - 1; index >= 0; index -= 1) {
      const currentPart = current[index] ?? "";
      const expandedPart = expandedContributions[index] ?? currentPart;
      if (expandedPart.length <= currentPart.length) continue;

      const next = [...current];
      next[index] = expandedPart.slice(0, currentPart.length + 1);
      const candidate = buildAbbreviationCandidate(next, limit, allowWhitespace);
      if (!candidate) continue;
      const expectedCandidate = allowWhitespace
        ? next.join(" ")
        : next.join("").slice(0, limit);
      if (candidate !== expectedCandidate) {
        continue;
      }

      const key = next.join("\u0000");
      if (visitedStates.has(key)) continue;
      visitedStates.add(key);
      queue.push(next);
      pushCandidate(next);
    }
  }

  return candidates;
}

export function createShortUnitName(
  name: string,
  options: CreateShortUnitNameOptions = {},
) {
  const maxLength = options.maxLength ?? 4;
  const otherNames = options.otherNames ?? [];
  const existingShortNames = options.existingShortNames ?? [];
  const allowWhitespace = options.allowWhitespace ?? false;
  const limit = Math.max(0, Math.floor(maxLength));
  if (limit === 0) return "";

  const normalizedName = normalizeWhitespace(name);
  if (!normalizedName) return "";

  const originalTokens = tokenizeName(normalizedName);
  if (originalTokens.length === 0) return "";
  const uppercase = options.uppercase ?? false;
  const forceLength = options.forceLength ?? false;
  const reservedShortNames = new Set(
    existingShortNames
      .map((shortName) => normalizeWhitespace(shortName))
      .filter((shortName) => shortName.length > 0)
      .map((shortName) => normalizeTokenForCompare(shortName)),
  );

  const siblingTokens = otherNames
    .map((otherName) => normalizeWhitespace(otherName))
    .filter((otherName) => otherName.length > 0)
    .filter((otherName) => otherName.toLowerCase() !== normalizedName.toLowerCase())
    .map((otherName) => tokenizeName(otherName))
    .filter((tokens) => tokens.length > 0);

  let workingTokens = originalTokens;
  if (siblingTokens.length > 0) {
    const sharedPrefixLength = findSharedPrefixLength([originalTokens, ...siblingTokens]);
    const supportedPrefixLength = findSupportedSharedPrefixLength(
      originalTokens,
      siblingTokens,
    );
    const prefixLength = Math.max(sharedPrefixLength, supportedPrefixLength);
    if (prefixLength > 0 && prefixLength < originalTokens.length) {
      workingTokens = originalTokens.slice(prefixLength);
    }
  }

  const finalizeAbbreviation = (value: string) =>
    uppercase ? value.toUpperCase() : value;

  const selectCandidate = (candidates: string[]) => {
    for (const candidate of candidates) {
      const finalized = finalizeAbbreviation(candidate);
      if (!reservedShortNames.has(normalizeTokenForCompare(finalized))) return finalized;
    }
    return finalizeAbbreviation(candidates[0] ?? "");
  };

  if (workingTokens.length === 1) {
    const compact = compactToken(workingTokens[0]);
    const candidates: string[] = [];
    for (let length = Math.min(limit, compact.length); length >= 1; length -= 1) {
      candidates.push(compact.slice(0, length));
    }
    return selectCandidate(candidates);
  }

  const contentTokens = workingTokens.filter((token) => !isStopword(token));
  const abbreviationTokens = contentTokens.length > 0 ? contentTokens : workingTokens;

  const primaryContributions = abbreviationTokens
    .map((token) => getPrimaryContribution(token, { allowWhitespace }))
    .filter((token) => token.length > 0);

  if (primaryContributions.length === 0) return "";

  const shouldExpandForContext = siblingTokens.length > 0 || forceLength;
  const expandedContributions = abbreviationTokens.map((token) =>
    getExpandedContribution(token),
  );
  const candidates = collectAbbreviationCandidates(
    primaryContributions,
    expandedContributions,
    limit,
    shouldExpandForContext,
    allowWhitespace,
  );

  if (candidates.length === 0) {
    const fallback = getExpandedContribution(abbreviationTokens[0]).slice(0, limit);
    return selectCandidate([fallback]);
  }

  return selectCandidate(candidates);
}
