import {
  MilitaryScenario,
  Unit,
  ForceSide,
  StandardIdentity,
} from "@orbat-mapper/msdllib";
import type {
  Scenario,
  Side,
  SideGroup,
  Unit as ScenarioUnit,
} from "@/types/scenarioModels";
import { type SidValue, SID } from "@/symbology/values";
import { nanoid } from "@/utils";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";

export function parseMsdlToScenario(xmlString: string): Scenario {
  const ms = MilitaryScenario.createFromString(xmlString);
  const scenarioId = nanoid();

  const sides: Side[] = ms.sides.map((forceSide) => convertForceSide(forceSide));

  const scenario: Scenario = {
    type: "ORBAT-mapper",
    id: scenarioId,
    name: "Imported MSDL Scenario",
    description: "Imported from MSDL",
    version: "2.1.0", // Defaulting to a known version
    sides,
    events: [],
    layers: [],
    mapLayers: [],
    startTime: Date.now(),
    meta: {
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      exportedFrom: "MSDL",
    },
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      map: { baseMapId: "osm" },
    },
  };

  return scenario;
}

function convertForceSide(forceSide: ForceSide): Side {
  return {
    id: forceSide.objectHandle || nanoid(),
    name: forceSide.name || "Unknown Side",
    standardIdentity: mapStandardIdentityToSid(forceSide.getAffiliation()),
    groups: [
      {
        id: nanoid(),
        name: "Main Group",
        subUnits: forceSide.subordinates.map((unit) => convertUnit(unit)),
      },
    ],
  };
}

function mapStandardIdentityToSid(identity: StandardIdentity): SidValue {
  switch (identity) {
    case StandardIdentity.Pending:
      return SID.Pending;
    case StandardIdentity.Unknown:
      return SID.Unknown;
    case StandardIdentity.AssumedFriend:
      return SID.AssumedFriend;
    case StandardIdentity.Friend:
      return SID.Friend;
    case StandardIdentity.Neutral:
      return SID.Neutral;
    case StandardIdentity.Suspect:
      return SID.Suspect;
    case StandardIdentity.Hostile:
      return SID.Hostile;
    case StandardIdentity.Joker:
      return SID.Joker;
    case StandardIdentity.Faker:
      return SID.Faker;
    default:
      return SID.Unknown;
  }
}

function convertUnit(unit: Unit): ScenarioUnit {
  const scenarioUnit: ScenarioUnit = {
    id: unit.objectHandle || nanoid(),
    name: unit.name || "Unknown Unit",
    sidc: convertLetterSidc2NumberSidc(unit.symbolIdentifier).sidc,
    subUnits: unit.subordinates.map((sub) => convertUnit(sub)),
    location: unit.location ? unit.location : undefined,
  };

  // Map other properties if needed (equipment, personnel, etc.)
  // MSDL location is [lon, lat, ele?], internal is [lon, lat] usually, but Position type handles it.

  return scenarioUnit;
}
