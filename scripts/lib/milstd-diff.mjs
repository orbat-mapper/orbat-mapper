/**
 * Core diff computation between the MIL-STD-2525 D and E symbology data.
 * Shared by the text reporter (scripts/diff-milstd.mjs) and the HTML report
 * generator (scripts/diff-milstd-report.mjs).
 */

import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const jiti = createJiti(import.meta.url);
const standardsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/symbology/standards",
);

/** Human-readable label for a main-icon entry (entity hierarchy + geometry). */
export const iconLabel = (e) => {
  const parts = [e.entity, e.entityType, e.entitySubtype].filter(Boolean);
  return e.geometry ? `${parts.join(" / ")} [${e.geometry}]` : parts.join(" / ");
};

/** Human-readable label for a modifier entry. */
export const modifierLabel = (m) =>
  m.category ? `${m.modifier} (${m.category})` : m.modifier;

const byCode = (list = []) => {
  const map = new Map();
  for (const entry of list) map.set(entry.code, entry);
  return map;
};

/**
 * Normalise a label for comparison: collapse internal whitespace runs and trim.
 * The 2525E data is generated with trimmed values, but the older hand-kept
 * 2525D file has stray trailing/double spaces; without this, those would be
 * reported as spurious "changed" entries. Display always uses the originals.
 */
export const norm = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Relaxed label normaliser for relocated-modifier detection. Strips the
 * parenthetical category suffix (e.g. " (Vehicle)" or " (Task)"), lowercases,
 * and collapses whitespace.  This lets us match entries whose category changed
 * or was added/dropped when moving to the common modifier table, and catches
 * trivial casing differences.
 *
 * Example: "Engineer (Task)" and "Engineer" both reduce to "engineer".
 */
const relaxedNorm = (s) =>
  norm(s)
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Split a relaxed-normalised string into a set of meaningful tokens.
 * Splits on whitespace, forward-slash, and commas; filters single-char words.
 */
const tokenize = (s) => new Set(s.split(/[\s/,]+/).filter((t) => t.length > 1));

/** Standard Levenshtein edit distance (character-level). */
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev.splice(0, b.length + 1, ...curr);
  }
  return prev[b.length];
}

/**
 * Compare two code-keyed lists. Returns { added, removed, changed, recoded,
 * relocated }:
 *  - added     — code present only in E
 *  - removed   — code present only in D
 *  - changed   — same code, different label
 *  - recoded   — same label, different code within this list
 *  - relocated — a D entry whose label now lives in the 2525E common modifier
 *                table (matched via `isRelocated`), i.e. moved out of the set
 *                rather than deleted
 */
export function diffList(dList, eList, label, isRelocated = null) {
  const d = byCode(dList);
  const e = byCode(eList);
  const added = [];
  const removed = [];
  const changed = [];

  for (const [code, eEntry] of e) {
    if (!d.has(code)) {
      added.push({ code, label: label(eEntry), e: eEntry });
    } else {
      const dEntry = d.get(code);
      const from = label(dEntry);
      const to = label(eEntry);
      // Compare whitespace-normalised; whitespace-only edits aren't changes.
      if (norm(from) !== norm(to)) changed.push({ code, from, to, d: dEntry, e: eEntry });
    }
  }

  const relocated = [];
  for (const [code, dEntry] of d) {
    if (e.has(code)) continue;
    const lab = label(dEntry);
    const commonMatch = isRelocated?.(lab);
    if (commonMatch) relocated.push({ code, label: lab, d: dEntry, commonMatch });
    else removed.push({ code, label: lab, d: dEntry });
  }

  // Pair leftover removed/added entries that share a label -> recoded.
  const recoded = [];
  const addedByLabel = new Map();
  for (const a of added) {
    const key = norm(a.label);
    if (!addedByLabel.has(key)) addedByLabel.set(key, []);
    addedByLabel.get(key).push(a);
  }
  const stillRemoved = [];
  for (const r of removed) {
    const match = addedByLabel.get(norm(r.label))?.shift();
    if (match)
      recoded.push({
        from: r.code,
        to: match.code,
        label: r.label,
        d: r.d,
        e: match.e,
      });
    else stillRemoved.push(r);
  }
  const stillAdded = [...addedByLabel.values()].flat();

  const byCodeStr = (a, b) => String(a.code).localeCompare(String(b.code));
  const byLabel = (a, b) => a.label.localeCompare(b.label);
  return {
    added: stillAdded.sort(byCodeStr),
    removed: stillRemoved.sort(byCodeStr),
    changed: changed.sort(byCodeStr),
    recoded: recoded.sort(byLabel),
    relocated: relocated.sort(byCodeStr),
  };
}

const sectionCount = (s) =>
  s.added.length +
  s.removed.length +
  s.changed.length +
  s.recoded.length +
  s.relocated.length;

const TYPE_KEYS = ["added", "removed", "changed", "recoded", "relocated"];

/** Coarse battle-dimension grouping for the per-dimension summary. */
const DIMENSION_OF = {
  "01": "Air & Space",
  "02": "Air & Space",
  "05": "Air & Space",
  "06": "Air & Space",
  10: "Land",
  11: "Land",
  15: "Land",
  20: "Land",
  25: "Land",
  27: "Land",
  30: "Sea",
  35: "Sea",
  36: "Sea",
  40: "Activities",
  50: "SIGINT",
  51: "SIGINT",
  52: "SIGINT",
  53: "SIGINT",
  54: "SIGINT",
  60: "Cyberspace",
};
const DIMENSION_ORDER = [
  "Air & Space",
  "Land",
  "Sea",
  "SIGINT",
  "Activities",
  "Cyberspace",
];

/** Sum the five change-type counts across a set's three sections. */
function setCounts(sections) {
  const c = { added: 0, removed: 0, changed: 0, recoded: 0, relocated: 0 };
  for (const s of Object.values(sections)) for (const k of TYPE_KEYS) c[k] += s[k].length;
  return c;
}

/**
 * Load both editions and compute the full structured diff.
 * Returns { onlyInD, onlyInE, sets, common, totals, generatedAt }.
 */
export async function computeDiff() {
  const { ms2525d } = await jiti.import(resolve(standardsDir, "milstd2525.ts"));
  const { ms2525e, ms2525eCommonModifiers } = await jiti.import(
    resolve(standardsDir, "milstd2525e.ts"),
  );

  const commonOne = ms2525eCommonModifiers?.modifierOne ?? [];
  const commonTwo = ms2525eCommonModifiers?.modifierTwo ?? [];

  /**
   * Returns the matching common modifier entry (with `sector` attached) when
   * a D label resolves to an entry in the common table, or null otherwise.
   * Used to populate `relocated[].commonMatch` so the report can render the
   * E/common version side-by-side with the D version.
   *
   * Five tiers, from strictest to most permissive:
   *   1. Exact: whitespace-normalised label equality.
   *   2. Relaxed: lowercase + parenthetical-category stripped.
   *   3. Character containment: D's relaxed form is a substring of E's (≥ 6
   *      chars), or vice versa (≥ 8 chars). Catches expanded slash-alternatives
   *      like "Bridging" → "Bridge/Bridging" and plurals like "Mine
   *      Countermeasure" → "Mine Countermeasures". Best match = shortest E that
   *      contains D (highest coverage ratio).
   *   4. Token coverage: ≥ 80 % of D's tokens appear in E's token set, for
   *      labels with ≥ 2 tokens. Catches comma/slash reorderings like
   *      "Intelligence, Surveillance, Reconnaissance" → "Intelligence
   *      Surveillance Reconnaissance". Best match = highest coverage, then
   *      shortest E.
   *   5. Levenshtein: relative similarity ≥ 0.68 for strings of ≥ 10 chars.
   *      Catches minor wording differences not covered by the above tiers.
   */
  const makeRelocatedCheck = (list, sector) => {
    const annotated = list.map((m) => {
      const lbl = modifierLabel(m);
      return { ...m, sector, _norm: norm(lbl), _relaxed: relaxedNorm(lbl) };
    });
    const exactMap = new Map(annotated.map((m) => [m._norm, m]));
    const relaxedMap = new Map(annotated.map((m) => [m._relaxed, m]));

    return (lab) => {
      const n = norm(lab);
      const r = relaxedNorm(lab);

      // Tier 1: exact
      if (exactMap.has(n)) return exactMap.get(n);
      // Tier 2: relaxed
      if (relaxedMap.has(r)) return relaxedMap.get(r);

      // Tier 3: character containment
      if (r.length >= 6) {
        let best = null;
        let bestRatio = -1;
        for (const m of annotated) {
          // D's relaxed label is a substring of E's (e.g. "Bridging" → "Bridge/Bridging")
          if (m._relaxed.includes(r)) {
            const ratio = r.length / m._relaxed.length;
            if (ratio > bestRatio) { bestRatio = ratio; best = m; }
          }
          // E's relaxed label is a substring of D's (e.g. "Wheeled" ⊂ "Wheeled LTD")
          if (m._relaxed.length >= 8 && r.includes(m._relaxed)) {
            const ratio = m._relaxed.length / r.length;
            if (ratio > bestRatio) { bestRatio = ratio; best = m; }
          }
        }
        if (best) return best;
      }

      // Tier 4: token coverage
      const dTokens = tokenize(r);
      if (dTokens.size >= 2) {
        let best = null;
        let bestScore = -1;
        for (const m of annotated) {
          const eTokens = tokenize(m._relaxed);
          let overlap = 0;
          for (const t of dTokens) if (eTokens.has(t)) overlap++;
          const coverage = overlap / dTokens.size;
          if (coverage >= 0.8) {
            // Tiebreak: prefer shorter E (most specific match)
            const score = coverage - m._relaxed.length * 1e-6;
            if (score > bestScore) { bestScore = score; best = m; }
          }
        }
        if (best) return best;
      }

      // Tier 5: Levenshtein
      if (r.length >= 10) {
        let best = null;
        let bestSim = 0;
        for (const m of annotated) {
          if (m._relaxed.length < 10) continue;
          const dist = levenshtein(r, m._relaxed);
          const sim = 1 - dist / Math.max(r.length, m._relaxed.length);
          if (sim >= 0.68 && sim > bestSim) { bestSim = sim; best = m; }
        }
        if (best) return best;
      }

      return null;
    };
  };

  const isRelocatedOne = makeRelocatedCheck(commonOne, 1);
  const isRelocatedTwo = makeRelocatedCheck(commonTwo, 2);

  const allKeys = [...new Set([...Object.keys(ms2525d), ...Object.keys(ms2525e)])].sort();

  const totals = { added: 0, removed: 0, changed: 0, recoded: 0, relocated: 0 };
  const onlyInD = [];
  const onlyInE = [];
  const sets = [];

  // A set new to one edition is flagged as a callout banner, but its entries
  // are still rendered (against an empty counterpart) so a brand-new symbol set
  // like "Dismounted individuals" shows up as a full block of added icons
  // rather than vanishing behind a one-line "new symbol set" note.
  const EMPTY_SET = { mainIcon: [], modifierOne: [], modifierTwo: [] };

  for (const key of allKeys) {
    const dSet = ms2525d[key];
    const eSet = ms2525e[key];

    if (dSet && !eSet) onlyInD.push({ key, name: dSet.name });
    if (!dSet && eSet) onlyInE.push({ key, name: eSet.name });

    const d = dSet ?? EMPTY_SET;
    const e = eSet ?? EMPTY_SET;
    const name = (eSet ?? dSet).name;

    const sections = {
      mainIcon: diffList(d.mainIcon, e.mainIcon, iconLabel),
      modifierOne: diffList(d.modifierOne, e.modifierOne, modifierLabel, isRelocatedOne),
      modifierTwo: diffList(d.modifierTwo, e.modifierTwo, modifierLabel, isRelocatedTwo),
    };

    const counts = setCounts(sections);
    for (const k of TYPE_KEYS) totals[k] += counts[k];

    const changeCount =
      sectionCount(sections.mainIcon) +
      sectionCount(sections.modifierOne) +
      sectionCount(sections.modifierTwo);

    sets.push({
      key,
      name,
      prevName: dSet && eSet && dSet.name !== eSet.name ? dSet.name : null,
      dimension: DIMENSION_OF[key] ?? "Other",
      counts,
      sections,
      changeCount,
    });
  }

  // Aggregate per battle dimension for the summary band.
  const dimMap = new Map();
  for (const set of sets) {
    if (!dimMap.has(set.dimension))
      dimMap.set(set.dimension, {
        name: set.dimension,
        sets: 0,
        added: 0,
        removed: 0,
        changed: 0,
        recoded: 0,
        relocated: 0,
      });
    const d = dimMap.get(set.dimension);
    d.sets += 1;
    for (const k of TYPE_KEYS) d[k] += set.counts[k];
  }
  const dimensions = DIMENSION_ORDER.filter((n) => dimMap.has(n)).map((n) =>
    dimMap.get(n),
  );

  return {
    onlyInD,
    onlyInE,
    sets,
    dimensions,
    common: { modifierOne: commonOne, modifierTwo: commonTwo },
    totals,
    counts: {
      setsD: Object.keys(ms2525d).length,
      setsE: Object.keys(ms2525e).length,
    },
    generatedAt: new Date().toISOString(),
  };
}
