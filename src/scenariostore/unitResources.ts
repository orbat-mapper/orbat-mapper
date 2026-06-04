/**
 * Unit resources — the counted things a unit holds (equipment, personnel, supplies),
 * each drawn from a catalog. See CONTEXT.md › Unit resources.
 *
 * The three kinds share one per-entry shape (`id`, `count`, optional `onHand`) and one
 * set of timeline semantics, so the apply and name↔id round-trip logic lives here once
 * instead of being copied per kind across time.ts, newScenarioStore.ts, and io.ts.
 */

/** The three resource kinds a unit holds. Order is not significant. */
export const RESOURCE_KINDS = ["equipment", "personnel", "supplies"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/** A counted thing a unit holds, resolved to a catalog id. */
export interface ResourceEntry {
  id: string;
  count: number;
  onHand?: number;
}

/**
 * `update` semantics — replace fields on matching entries (matched by `id`).
 * Mutates `target` in place; entries with no match are warned and skipped using
 * `label` (e.g. the resource kind) for diagnostics.
 */
export function applyResourceUpdate<T extends ResourceEntry>(
  target: T[] | undefined,
  updates: Partial<T>[] | undefined,
  label: string,
): void {
  if (!updates || !target) return;
  for (const u of updates) {
    const idx = target.findIndex((e) => e.id === u.id);
    if (idx === -1) {
      console.warn(`${label} not found`, u);
      continue;
    }
    target[idx] = { ...target[idx], ...u };
  }
}

/**
 * `diff` semantics — accumulate an `onHand` delta on matching entries (matched by `id`).
 * `onHand` defaults to `count` when unset before the first delta is applied.
 * Mutates `target` in place; entries with no match are warned and skipped using
 * `label` (e.g. the resource kind) for diagnostics.
 */
export function applyResourceDiff<T extends ResourceEntry>(
  target: T[] | undefined,
  diffs: Partial<T>[] | undefined,
  label: string,
): void {
  if (!diffs || !target) return;
  for (const d of diffs) {
    const idx = target.findIndex((e) => e.id === d.id);
    if (idx === -1) {
      console.warn(`${label} not found`, d);
      continue;
    }
    const cur = target[idx];
    const onHand = (cur.onHand ?? cur.count) + (d.onHand ?? 0);
    target[idx] = { ...cur, onHand };
  }
}

/** External → internal: map each entry's `name` to a catalog `id`, preserving other fields. */
export function entriesToInternal<E extends { name: string }>(
  entries: E[] | undefined,
  nameToId: (name: string) => string,
): (Omit<E, "name"> & { id: string })[] | undefined {
  return entries?.map(({ name, ...rest }) => ({ id: nameToId(name), ...rest }));
}

/** Internal → external: map each entry's catalog `id` back to a `name`, preserving other fields. */
export function entriesToExternal<E extends { id: string }>(
  entries: E[] | undefined,
  idToName: (id: string) => string,
): (Omit<E, "id"> & { name: string })[] | undefined {
  return entries?.map(({ id, ...rest }) => ({ name: idToName(id), ...rest }));
}
