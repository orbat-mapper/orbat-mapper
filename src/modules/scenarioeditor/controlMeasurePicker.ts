/**
 * The picker's view of the control-measure registry.
 *
 * The list is derived from `CONTROL_MEASURE_IDS` / `CONTROL_MEASURE_METADATA` rather
 * than from a host-side table, so a kind the pinned library adds shows up without a
 * code change here — the same rule the layers panel already follows.
 */
import {
  CONTROL_MEASURE_IDS,
  CONTROL_MEASURE_METADATA,
} from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

export interface ControlMeasureKindOption {
  id: ControlMeasureId;
  name: string;
  description: string;
  /** Registry entity, used as the group heading (e.g. "Maneuver Lines"). */
  entity: string;
  /** `entityType` / `entitySubtype`, shown as the row's secondary line. */
  qualifier: string;
  /** Pre-lowercased haystack, so filtering does no work per keystroke per row. */
  searchText: string;
}

function toOption(id: ControlMeasureId): ControlMeasureKindOption {
  const metadata = CONTROL_MEASURE_METADATA[id];
  const qualifier = [metadata.entityType, metadata.entitySubtype]
    .filter(Boolean)
    .join(" — ");
  return {
    id,
    name: metadata.name,
    description: metadata.description,
    entity: metadata.entity,
    qualifier,
    searchText: [id, metadata.name, metadata.entity, qualifier, metadata.description]
      .join(" ")
      .toLowerCase(),
  };
}

const OPTIONS: readonly ControlMeasureKindOption[] = CONTROL_MEASURE_IDS.map(toOption);
// Built once: the split-button menu looks a kind up per row on every render.
const OPTIONS_BY_ID = new Map(OPTIONS.map((option) => [option.id, option]));

/** Every kind the library knows, in registry order. */
export function listControlMeasureKindOptions(): readonly ControlMeasureKindOption[] {
  return OPTIONS;
}

export function getControlMeasureKindOption(
  id: ControlMeasureId,
): ControlMeasureKindOption | undefined {
  return OPTIONS_BY_ID.get(id);
}

/**
 * Every whitespace-separated term must match somewhere, so "line phase" finds the
 * phase line and "arrow block" finds the block arrow. An empty query lists everything.
 */
export function searchControlMeasureKinds(
  query: string,
): readonly ControlMeasureKindOption[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return OPTIONS;
  return OPTIONS.filter((option) =>
    terms.every((term) => option.searchText.includes(term)),
  );
}

/** Groups by registry entity, preserving registry order within and between groups. */
export function groupControlMeasureKinds(
  options: readonly ControlMeasureKindOption[],
): Map<string, ControlMeasureKindOption[]> {
  const groups = new Map<string, ControlMeasureKindOption[]>();
  for (const option of options) {
    const group = groups.get(option.entity);
    if (group) group.push(option);
    else groups.set(option.entity, [option]);
  }
  return groups;
}
