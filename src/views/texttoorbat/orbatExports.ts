/**
 * Exports of a parsed text ORBAT to ORBAT Mapper and Spatial Illusions formats.
 */

import { nanoid } from "nanoid";
import {
  makeSpatialIllusionsNode,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { Scenario, Side, SideGroup } from "@/types/scenarioModels";
import type { SidValue } from "@/symbology/values";
import { toUnits, type ParsedUnit } from "@/lib/textToOrbat";

function convertParsedUnitToSpatialIllusions(unit: ParsedUnit): SpatialIllusionsOrbat {
  return makeSpatialIllusionsNode(
    {
      uniqueDesignation: unit.name,
      sidc: unit.sidc,
    },
    unit.children.map((child) => convertParsedUnitToSpatialIllusions(child)),
  );
}

export function convertParsedUnitsToSpatialIllusions(
  units: ParsedUnit[],
): SpatialIllusionsOrbat {
  if (units.length === 0) {
    return makeSpatialIllusionsNode({
      uniqueDesignation: "ORBAT",
      sidc: "10031000001211000000",
    });
  }

  // Spatial Illusions only supports a single root unit
  return convertParsedUnitToSpatialIllusions(units[0]);
}

const SI_NAMES: Record<string, string> = {
  "0": "Pending",
  "1": "Unknown",
  "2": "Assumed Friend",
  "3": "Friendly",
  "4": "Neutral",
  "5": "Suspect",
  "6": "Hostile",
};

export function convertParsedUnitsToOrbatMapperScenario(
  units: ParsedUnit[],
  standardIdentity: string = "3",
): Scenario {
  const now = new Date().toISOString();

  const friendlyGroup: SideGroup = {
    id: nanoid(),
    name: "Units",
    subUnits: toUnits(units),
  };

  const side: Side = {
    id: nanoid(),
    name: SI_NAMES[standardIdentity] ?? "Friendly",
    standardIdentity: standardIdentity as SidValue,
    groups: [friendlyGroup],
  };

  return {
    type: "ORBAT-mapper",
    id: nanoid(12),
    version: "3.0.0",
    meta: {
      createdDate: now,
      lastModifiedDate: now,
    },
    name: "Text to ORBAT Scenario",
    sides: [side],
    events: [],
    layerStack: [{ id: nanoid(), kind: "overlay", name: "Features", items: [] }],
  };
}
