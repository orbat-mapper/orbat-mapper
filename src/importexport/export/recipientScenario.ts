import type { Scenario } from "@/types/scenarioModels";
import type { OrbatMapperExportSettings } from "@/types/importExport";

/** Shared by the preview and download so both include exactly the same content. */
export function buildRecipientScenario(
  scenario: Scenario,
  settings: Pick<
    OrbatMapperExportSettings,
    "sideGroups" | "emptySideIds" | "layerIds" | "scenarioName"
  >,
): Scenario {
  return {
    ...scenario,
    name: settings.scenarioName || scenario.name,
    sides: scenario.sides
      .filter((side) =>
        side.groups.length
          ? side.groups.some((group) => settings.sideGroups.includes(group.id))
          : settings.emptySideIds?.includes(side.id),
      )
      .map((side) => ({
        ...side,
        groups: side.groups.filter((group) => settings.sideGroups.includes(group.id)),
      })),
    layerStack:
      settings.layerIds === undefined
        ? scenario.layerStack
        : scenario.layerStack.filter((layer) => settings.layerIds!.includes(layer.id)),
  };
}
