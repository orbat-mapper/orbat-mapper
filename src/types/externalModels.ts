// TypeScript types for the Spatial Illusions ORBAT builder export format
import { type SymbolOptions } from "milsymbol";
import type { ReinforcedStatus } from "@/types/scenarioModels";

export interface SpatialIllusionsOrbat {
  options: SpatialIllusionsOptions;
  subOrganizations?: SpatialIllusionsOrbat[];
}

export interface SpatialIllusionsOptions extends SymbolOptions {
  uniqueDesignation?: string;
  sidc: string;
  fillColor?: string;
  stack?: number;
  reinforced?: string;
  additionalInformation?: string;
}

export type OrbatGeneratorOrbat = OrbatGeneratorItem[];
// sidc, level, position, unit name, subtitle, color
export type OrbatGeneratorItem = [string, string, string, string, string, string];

export function mapSpatialIllusionsReinforced(reinforced: string): ReinforcedStatus {
  if (reinforced === "(+)") return "Reinforced";
  if (reinforced === "(-)") return "Reduced";
  if (reinforced === "(±)") return "ReinforcedReduced";
  return "None";
}

export const reinforcedStatus2SpatialIllusions = {
  Reinforced: "(+)",
  Reduced: "(-)",
  ReinforcedReduced: "(±)",
  None: undefined,
};

export function makeSpatialIllusionsNode(
  options: SpatialIllusionsOptions,
  subOrganizations: SpatialIllusionsOrbat[] = [],
): SpatialIllusionsOrbat {
  const node: SpatialIllusionsOrbat = { options };
  if (subOrganizations.length > 0) {
    node.subOrganizations = subOrganizations;
  }
  return node;
}
