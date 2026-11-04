import type { EntityId } from "@/types/base";
import type { ExportRecord, Scenario } from "@/types/scenarioModels";

export type FileBaseCheck =
  | { status: "latest" }
  /** Importing can undo changes made in this scenario since `baseDate`. */
  | { status: "older"; baseDate: string; latestDate: string }
  /** From another scenario, or saved before exports were recorded. */
  | { status: "unknown" };

/** What an import takes from the file: the side groups and layers it may change. */
export interface FileBaseScope {
  sideGroupIds?: EntityId[];
  layerIds?: EntityId[];
}

/**
 * Checks a file coming back against the exports recorded in this scenario. A file
 * the recipient exported again names its base in `meta.exportedFrom`; one saved
 * with Download scenario keeps the export's ID.
 */
export function checkFileBase(
  records: ExportRecord[],
  file: Pick<Scenario, "id" | "meta">,
  scope: FileBaseScope,
): FileBaseCheck {
  // A raw export names the source scenario in exportedFrom, so fall back to its ID.
  const base =
    records.find((r) => r.id === file.meta?.exportedFrom) ??
    records.find((r) => r.id === file.id);
  if (!base) return { status: "unknown" };
  const sideGroupIds = new Set(scope.sideGroupIds);
  const layerIds = new Set(scope.layerIds);
  // A group exported as a snapshot carries no history, so that file never comes back.
  const included = (r: ExportRecord) =>
    r.sideGroupIds.some(
      (id) => sideGroupIds.has(id) && !r.snapshotGroupIds.includes(id),
    ) || r.layerIds.some((id) => layerIds.has(id));
  const baseTime = Date.parse(base.exportedDate);
  const latest = records
    .filter((r) => included(r) && Date.parse(r.exportedDate) > baseTime)
    .reduce<ExportRecord | undefined>(
      (newest, r) =>
        !newest || Date.parse(r.exportedDate) > Date.parse(newest.exportedDate)
          ? r
          : newest,
      undefined,
    );
  return latest
    ? { status: "older", baseDate: base.exportedDate, latestDate: latest.exportedDate }
    : { status: "latest" };
}

/** Export dates are real times, shown in the user's own time zone. */
export const formatExportDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export interface FileBaseNotice {
  title: string;
  message: string;
}

/** `subject` names what the import takes, such as "this side". */
export function describeFileBase(
  check: FileBaseCheck,
  subject: string,
  formatDate = formatExportDate,
): FileBaseNotice | undefined {
  if (check.status === "older") {
    const base = formatDate(check.baseDate);
    return {
      title: "This file may be out of date",
      message:
        `This file was made from the export of ${base}. ` +
        `A newer export of ${subject} was made on ${formatDate(check.latestDate)}. ` +
        `Importing it can undo changes made since ${base}.`,
    };
  }
  if (check.status === "unknown") {
    return {
      title: "Unknown origin",
      message:
        "The origin of this file is unknown. It was not made from an export of this " +
        "scenario, so it cannot be checked for changes made since.",
    };
  }
}
