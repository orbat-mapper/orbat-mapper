import type { OrbatMapperExportSettings } from "@/types/importExport";

/** Derive recipient names from the selected content, in scenario side order. */
export function suggestExportNames(
  sourceName: string,
  sides: { id: string; name: string; groups: string[] }[],
  layerIds: NonNullable<OrbatMapperExportSettings["layerIds"]>,
  settings: OrbatMapperExportSettings,
) {
  const selectedSides = sides.filter((side) =>
    side.groups.length
      ? side.groups.some((id) => settings.sideGroups.includes(id))
      : settings.emptySideIds?.includes(side.id),
  );
  const allContent =
    sides.every((side) =>
      side.groups.length
        ? side.groups.every((id) => settings.sideGroups.includes(id))
        : settings.emptySideIds?.includes(side.id),
    ) &&
    layerIds.every(
      (id) => settings.layerIds === undefined || settings.layerIds.includes(id),
    );
  const suffix = allContent
    ? ""
    : selectedSides.length
      ? selectedSides.map((side) => side.name).join(" + ")
      : layerIds.some(
            (id) => settings.layerIds === undefined || settings.layerIds.includes(id),
          )
        ? "Layers"
        : "Export";
  const scenarioName = suffix ? `${sourceName} — ${suffix}` : sourceName;
  const slug = scenarioName
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return { scenarioName, fileName: `${slug || "scenario"}.json` };
}
