import { isEqual } from "es-toolkit";
import { comparable, type ImportChange, type ImportOptions } from "./scenarioImportPlan";

const equal = (a: unknown, b: unknown, key = "") =>
  isEqual(comparable(a, key), comparable(b, key));
const label = (key: string) =>
  ({
    sidc: "Symbol",
    subUnits: "Child units",
    symbolOptions: "Symbol appearance",
    state: "History",
  })[key] ??
  key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, (c) => ` ${c.toLowerCase()}`);
const count = (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`;

/** Short user-facing descriptions; the original plan remains available for inspection. */
export function describeImportChange(
  change: ImportChange,
  nameForId: (id: string) => string,
): string[] {
  if (change.effect === "removed")
    return [`This ${change.kind} and its data will be removed.`];
  if (change.effect === "preserved")
    return ["Not included in this update; kept as it is."];
  if (change.effect === "unchanged") return ["Already matches; no changes needed."];
  const before = (change.before ?? {}) as Record<string, unknown>;
  const after = (change.after ?? {}) as Record<string, unknown>;
  const messages: string[] =
    change.effect === "added" ? [`New ${change.kind} will be added.`] : [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (
      key === "id" ||
      (key === "name" && change.effect === "added") ||
      equal(before[key], after[key], key)
    )
      continue;
    const a = before[key],
      b = after[key];
    if (key === "parent") {
      messages.push(
        a == null
          ? `Added under ${nameForId(String(b))}.`
          : `Moved from ${nameForId(String(a))} to ${nameForId(String(b))}.`,
      );
    } else if (key === "state") {
      const old = [...((a ?? []) as Record<string, unknown>[])];
      const incoming = (b ?? []) as Record<string, unknown>[];
      // Match identical entries first so a repeated entry cannot conceal a removal.
      const unmatched = incoming.filter((entry) => {
        const i = old.findIndex((s) => equal(s, entry, "stateEntry"));
        if (i < 0) return true;
        old.splice(i, 1);
        return false;
      });
      let updated = 0;
      for (const entry of unmatched) {
        const i = old.findIndex(
          (s) =>
            (s.id && s.id === entry.id) ||
            +new Date(s.t as string) === +new Date(entry.t as string),
        );
        if (i >= 0) {
          updated++;
          old.splice(i, 1);
        }
      }
      const added = unmatched.length - updated;
      const parts = [
        added && `${count(added)} added`,
        updated && `${count(updated)} updated`,
        old.length && `${count(old.length)} removed`,
      ].filter(Boolean);
      messages.push(
        parts.length ? `History: ${parts.join(", ")}.` : "History entries reordered.",
      );
    } else if (key === "subUnits" || key === "groups") {
      const old = (a ?? []) as string[],
        next = (b ?? []) as string[];
      const added = next.filter((id) => !old.includes(id));
      const removed = old.filter((id) => !next.includes(id));
      if (added.length)
        messages.push(`${label(key)} added: ${added.map(nameForId).join(", ")}.`);
      if (removed.length)
        messages.push(
          `${label(key)} moved or removed: ${removed.map(nameForId).join(", ")}.`,
        );
      if (!added.length && !removed.length) messages.push(`${label(key)} reordered.`);
    } else if (key === "sidc") {
      messages.push(a == null ? "Symbol set." : "Symbol changed.");
    } else if (key === "location") {
      messages.push(
        b == null
          ? "Location removed."
          : a == null
            ? "Location added."
            : "Location changed.",
      );
    } else if (b == null || (Array.isArray(b) && !b.length))
      messages.push(`${label(key)} cleared.`);
    else if (["string", "number", "boolean"].includes(typeof b))
      messages.push(
        `${label(key)}: ${a == null ? "not set" : String(a)} → ${String(b)}.`,
      );
    else messages.push(`${label(key)} ${a == null ? "added" : "changed"}.`);
  }
  return messages;
}

/** Headline for the whole plan: the verb describing the action and the unit tally. */
export function summarizeImportPlan(
  changes: ImportChange[],
  options: Pick<ImportOptions, "action" | "content">,
) {
  const counts: Record<ImportChange["effect"], number> = {
    added: 0,
    changed: 0,
    removed: 0,
    unchanged: 0,
    preserved: 0,
  };
  for (const change of changes) if (change.kind === "unit") counts[change.effect]++;
  const parts = [
    `${counts.changed} ${counts.changed === 1 ? "unit" : "units"} updated`,
    `${counts.added} added`,
  ];
  if (counts.removed) parts.push(`${counts.removed} removed`);
  parts.push(`${counts.unchanged + counts.preserved} left unchanged`);
  return {
    counts,
    action:
      options.content === "state-only"
        ? "Update history for"
        : options.action === "replace"
          ? "Replace"
          : options.action === "copy"
            ? "Create a separate copy of"
            : "Update",
    sentence: parts.join(", ") + ".",
  };
}
