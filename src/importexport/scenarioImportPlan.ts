import { klona } from "klona";
import { isEqual } from "es-toolkit";
import { nanoid } from "@/utils";
import { getCustomSymbolId } from "@/symbology/helpers";
import type { Scenario, Side, SideGroup, Unit } from "@/types/scenarioModels";

export interface ImportOptions {
  scopeId: string;
  action: "update" | "replace" | "copy";
  content: "units-only" | "units-and-state" | "state-only";
  states: "replace" | "add_new";
  selectedIds: string[];
  targetSideId?: string;
}
type Node = Side | SideGroup | Unit;
interface Entry {
  node: Node;
  parent?: string;
  side: string;
  kind: "side" | "group" | "unit";
}
export interface ImportChange {
  id: string;
  name: string;
  kind: Entry["kind"];
  effect: "added" | "changed" | "removed" | "unchanged" | "preserved";
  before?: object;
  after?: object;
}
function index(scenario: Scenario, errors: string[] = []) {
  const result = new Map<string, Entry>();
  function visit(node: Node, side: string, kind: Entry["kind"], parent?: string) {
    if (!node.id || result.has(node.id))
      errors.push(`Missing or duplicate ID: ${node.name} (${node.id})`);
    result.set(node.id, { node, parent, side, kind });
    if ("groups" in node) node.groups.forEach((g) => visit(g, side, "group", node.id));
    node.subUnits?.forEach((u) => visit(u, side, "unit", node.id));
  }
  scenario.sides.forEach((s) => visit(s, s.id, "side"));
  return result;
}
function fields(entry: Entry) {
  const { subUnits, ...rest } = entry.node;
  const result = Object.fromEntries(
    Object.entries(rest).filter(
      ([k, v]) => k !== "groups" && !k.startsWith("_") && v !== undefined,
    ),
  );
  return {
    ...result,
    subUnits: (subUnits ?? []).map((u) => u.id),
    ...("groups" in entry.node ? { groups: entry.node.groups.map((g) => g.id) } : {}),
    parent: entry.parent,
  };
}
/** File timestamps may be ISO strings, while the store uses numbers. Empty optional
 * lists and generated state-entry IDs do not constitute authored content changes.
 * Shared with the summary so the diff and its description agree on what changed. */
export function comparable(value: unknown, key = ""): unknown {
  if (Array.isArray(value))
    return value.length
      ? value.map((v) => comparable(v, key === "state" ? "stateEntry" : ""))
      : undefined;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !(key === "stateEntry" && k === "id"))
        .map(([k, v]) => [k, comparable(v, k)])
        .filter(([, v]) => v !== undefined),
    );
  if ((key === "t" || key === "viaStartTime") && value != null)
    return +new Date(value as string);
  return value;
}
function within(entries: Map<string, Entry>, id: string, scope: string): boolean {
  const seen = new Set<string>();
  let current: string | undefined = id;
  while (current && !seen.has(current)) {
    if (current === scope) return true;
    seen.add(current);
    current = entries.get(current)?.parent;
  }
  return false;
}
/** Incoming authored fields replace included units' fields; omitted units retain their
 * fields and parent. This is deliberately not field-level conflict resolution.
 * The returned scenario is the sole source for both the diff and application. */
export function planScenarioImport(
  master: Scenario,
  incoming: Scenario,
  options: ImportOptions,
) {
  const errors: string[] = [];
  const before = index(master, errors);
  const source = index(klona(incoming), errors);
  const next = klona(master);
  const after = index(next);
  const scope = source.get(options.scopeId);
  const target = before.get(options.scopeId);
  const changes: ImportChange[] = [];
  const ignored: string[] = [];
  if (!scope || scope.kind === "unit") errors.push("Select a side or group to import.");
  if (options.action !== "copy" && target && target.kind !== scope?.kind)
    errors.push("Target ID belongs to another entity type.");
  const selected = new Set(options.selectedIds);
  const included = [...source].filter(
    ([id, e]) =>
      within(source, id, options.scopeId) &&
      (e.kind !== "unit" ||
        (options.action === "replace" && options.content !== "state-only") ||
        selected.has(id)),
  );
  if (options.action === "copy" && options.content === "state-only")
    errors.push("State-only import cannot create a separate copy.");
  const remap = new Map<string, string>();
  if (options.action === "copy") included.forEach(([id]) => remap.set(id, nanoid()));
  const mapped = (id: string) => remap.get(id) ?? id;
  const touched = new Set<string>();
  if (options.action === "replace" && options.content !== "state-only") {
    for (const [id] of before)
      if (within(before, id, options.scopeId)) {
        after.delete(id);
        touched.add(id);
      }
  }
  for (const [id, entry] of included) {
    const old = before.get(id);
    if (options.action !== "copy" && old && !within(before, id, options.scopeId)) {
      errors.push(
        `${entry.node.name} (${id}) belongs outside the selected target scope.`,
      );
      continue;
    }
    if (options.content === "state-only" && (entry.kind !== "unit" || !old)) {
      if (entry.kind === "unit")
        ignored.push(`${entry.node.name}: missing unit; state-only does not add units.`);
      continue;
    }
    if (old && options.action !== "copy" && old.kind !== entry.kind) {
      errors.push(`${entry.node.name}: ID belongs to another entity type.`);
      continue;
    }
    let node = klona(entry.node);
    let parent =
      id === options.scopeId && old && options.action !== "copy"
        ? old.parent
        : entry.parent;
    if (entry.kind === "unit") {
      const unit = node as Unit;
      const existing =
        options.action === "copy" ? undefined : (old?.node as Unit | undefined);
      if (options.content === "state-only") {
        node = klona(existing!);
        parent = old!.parent;
      }
      const output = node as Unit;
      if (options.content === "units-only") output.state = klona(existing?.state ?? []);
      else if (options.states === "add_new") {
        const latest = Math.max(
          -Infinity,
          ...(existing?.state ?? []).map((s) => +new Date(s.t)),
        );
        const additions = (unit.state ?? []).filter((s) => +new Date(s.t) > latest);
        const skipped = (unit.state?.length ?? 0) - additions.length;
        if (skipped)
          ignored.push(
            `${unit.name}: ${skipped} states at or before the latest timestamp ignored.`,
          );
        output.state = [...klona(existing?.state ?? []), ...additions];
      } else output.state = klona(unit.state ?? []);
      if (options.action === "copy")
        output.state?.forEach((s) => {
          s.id = nanoid();
          if (s.hierarchy) {
            s.hierarchy.targetId = mapped(s.hierarchy.targetId);
            if (s.hierarchy.parentId) s.hierarchy.parentId = mapped(s.hierarchy.parentId);
          }
        });
    }
    node.id = mapped(id);
    if (parent) parent = mapped(parent);
    if (
      id === options.scopeId &&
      entry.kind === "group" &&
      (options.action === "copy" || !target)
    )
      parent = options.targetSideId;
    after.set(node.id, { ...entry, node, parent });
    touched.add(node.id);
  }
  // Validate the final graph before rebuilding it. Also catches references from
  // preserved units to nodes removed by an explicit replacement.
  for (const [id, e] of after) {
    if (e.parent && !after.has(e.parent))
      errors.push(`${e.node.name}: unresolved parent ${e.parent}.`);
    if (e.kind === "group" && e.parent && after.get(e.parent)?.kind !== "side")
      errors.push(`${e.node.name}: a group must belong to a side.`);
    if (e.kind !== "side" && !e.parent) errors.push(`${e.node.name}: missing parent.`);
    if (
      touched.has(id) &&
      e.parent &&
      id !== mapped(options.scopeId) &&
      !within(after, e.parent, mapped(options.scopeId))
    )
      errors.push(`${e.node.name}: parent lies outside selected scope.`);
    const seen = new Set([id]);
    let parent = e.parent;
    while (parent && after.has(parent)) {
      if (seen.has(parent)) {
        errors.push(`${e.node.name}: hierarchy cycle.`);
        break;
      }
      seen.add(parent);
      parent = after.get(parent)?.parent;
    }
    if (e.kind === "unit")
      for (const state of (e.node as Unit).state ?? []) {
        if (!state.hierarchy) continue;
        for (const ref of [state.hierarchy.targetId, state.hierarchy.parentId].filter(
          Boolean,
        ) as string[]) {
          if (
            !after.has(ref) ||
            (touched.has(id) && !within(after, ref, mapped(options.scopeId)))
          )
            errors.push(
              `${e.node.name}: unresolved or out-of-scope hierarchy reference ${ref}.`,
            );
        }
      }
  }
  if (!errors.length) {
    next.sides = [];
    for (const e of after.values()) {
      if (e.node.subUnits) e.node.subUnits = [];
      if ("groups" in e.node) e.node.groups = [];
    }
    for (const e of after.values()) {
      if (e.kind === "side") next.sides.push(e.node as Side);
      else {
        const parent = after.get(e.parent!)!.node;
        if (e.kind === "group" && "groups" in parent)
          parent.groups.push(e.node as SideGroup);
        else (parent.subUnits ??= []).push(e.node as Unit);
      }
    }
  }
  if (!errors.length) {
    const sideOrder = master.sides.map((s) => s.id);
    const rank = (ids: string[], id: string) =>
      ids.includes(id) ? ids.indexOf(id) : ids.length;
    next.sides.sort((a, b) => rank(sideOrder, a.id) - rank(sideOrder, b.id));
    if (scope?.kind === "group" && target?.parent && options.action !== "copy") {
      const oldParent = before.get(target.parent)?.node as Side;
      const newParent = after.get(target.parent)?.node as Side;
      const order = oldParent.groups.map((g) => g.id);
      newParent.groups.sort((a, b) => rank(order, a.id) - rank(order, b.id));
    }
  }
  if (!errors.length && options.content !== "state-only") {
    for (const [sourceId, e] of included) {
      const dest = after.get(mapped(sourceId));
      if (!dest) continue;
      const ordered = (e.node.subUnits ?? [])
        .map((u) => mapped(u.id))
        .filter((id) => touched.has(id));
      dest.node.subUnits?.sort((a, b) => {
        const rank = (id: string) =>
          ordered.includes(id) ? ordered.indexOf(id) : ordered.length;
        return rank(a.id) - rank(b.id);
      });
      if ("groups" in dest.node && "groups" in e.node) {
        const order = e.node.groups.map((g) => mapped(g.id));
        dest.node.groups.sort(
          (a, b) =>
            (order.includes(a.id) ? order.indexOf(a.id) : order.length) -
            (order.includes(b.id) ? order.indexOf(b.id) : order.length),
        );
      }
    }
  }
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const a = before.get(id),
      b = after.get(id);
    const oldFields = a && fields(a),
      newFields = b && fields(b);
    if (
      !touched.has(id) &&
      !within(before, id, options.scopeId) &&
      isEqual(comparable(oldFields), comparable(newFields))
    )
      continue;
    const effect = !a
      ? "added"
      : !b
        ? "removed"
        : !isEqual(comparable(oldFields), comparable(newFields))
          ? "changed"
          : !touched.has(id)
            ? "preserved"
            : "unchanged";
    changes.push({
      id,
      name: (b ?? a)!.node.name,
      kind: (b ?? a)!.kind,
      effect,
      before: oldFields,
      after: newFields,
    });
  }

  // Bring definitions needed by additions without importing unrelated catalogs or
  // overwriting the master's definitions. Unit resources use names in scenario files.
  const dependencies: { kind: string; name: string; definition: object }[] = [];
  const changedUnits = changes
    .filter((c) => c.kind === "unit" && (c.effect === "added" || c.effect === "changed"))
    .map((c) => after.get(c.id)!.node as Unit);
  function addDefinitions<T extends { name: string }>(
    kind: string,
    existing: T[],
    definitions: T[],
    required: Set<string>,
  ): T[] {
    const names = new Set(existing.map((e) => e.name));
    const added = definitions.filter((e) => required.has(e.name) && !names.has(e.name));
    added.forEach((e) => dependencies.push({ kind, name: e.name, definition: e }));
    return [...existing, ...klona(added)];
  }
  const resourceNames = (key: "equipment" | "personnel" | "supplies") =>
    new Set(
      changedUnits.flatMap((u) => [
        ...(u[key] ?? []).map((e) => e.name),
        ...(u.state ?? []).flatMap((s) =>
          [...(s.update?.[key] ?? []), ...(s.diff?.[key] ?? [])].map((e) => e.name),
        ),
      ]),
    );
  next.equipment = addDefinitions(
    "Equipment",
    next.equipment ?? [],
    incoming.equipment ?? [],
    resourceNames("equipment"),
  );
  next.personnel = addDefinitions(
    "Personnel",
    next.personnel ?? [],
    incoming.personnel ?? [],
    resourceNames("personnel"),
  );
  next.supplyCategories = addDefinitions(
    "Supply",
    next.supplyCategories ?? [],
    incoming.supplyCategories ?? [],
    resourceNames("supplies"),
  );
  const symbols = new Set(
    changedUnits.flatMap((u) =>
      [u.sidc, ...(u.state ?? []).map((s) => s.sidc)]
        .filter(Boolean)
        .map((sidc) => getCustomSymbolId(sidc!))
        .filter(Boolean),
    ),
  );
  const addedSymbols = (incoming.settings?.customSymbols ?? []).filter(
    (s) =>
      symbols.has(s.id) &&
      !(next.settings?.customSymbols ?? []).some((e) => e.id === s.id),
  );
  if (addedSymbols.length) {
    next.settings ??= {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
    };
    next.settings.customSymbols = [
      ...(next.settings.customSymbols ?? []),
      ...klona(addedSymbols),
    ];
    addedSymbols.forEach((s) =>
      dependencies.push({ kind: "Symbol", name: s.name, definition: s }),
    );
  }
  return {
    scenario: next,
    changes,
    errors: [...new Set(errors)],
    ignored,
    dependencies,
    options: klona(options),
    hasChanges: changes.some((c) => ["added", "changed", "removed"].includes(c.effect)),
  };
}
