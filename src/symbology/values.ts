// Values based on code from https://github.com/spatialillusions/milsymbol-generator

import { type SymbolValue } from "@/types/constants";

export const AIR_SYMBOLSET_VALUE = "01";
export const SPACE_SYMBOLSET_VALUE = "05";
export const UNIT_SYMBOLSET_VALUE = "10";
export const DISMOUNTED_SYMBOLSET_VALUE = "27";
export const SURFACE_SYMBOLSET_VALUE = "30";
export const SUBSURFACE_SYMBOLSET_VALUE = "35";
export const CONTROL_MEASURE_SYMBOLSET_VALUE = "25";

export const symbolSetValues: SymbolValue[] = [
  { code: "10", text: "Land unit" },
  { code: "11", text: "Land civilian unit/Organization" },
  { code: "15", text: "Land equipment" },
  { code: "20", text: "Land installations" },
  { code: "25", text: "Control measure" },
  { code: "27", text: "Dismounted individual" },
  { code: "30", text: "Sea surface" },
  { code: "35", text: "Sea subsurface" },
  { code: "36", text: "Mine warfare" },
  { code: "40", text: "Activity/Event" },
  { code: "01", text: "Air" },
  { code: "02", text: "Air missile" },
  { code: "05", text: "Space" },
];

export const symbolSetMap: Record<string, SymbolValue> = symbolSetValues.reduce(
  (acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  },
  {} as Record<string, SymbolValue>,
);

export const HQTFDummyValues: SymbolValue[] = [
  { code: "0", text: "Not Applicable" },
  { code: "1", text: "Feint/Dummy" },
  { code: "2", text: "Headquarters" },
  { code: "3", text: "Feint/Dummy Headquarters" },
  { code: "4", text: "Task Force" },
  { code: "5", text: "Feint/Dummy Task Force" },
  { code: "6", text: "Task Force Headquarters" },
  { code: "7", text: "Feint/Dummy Task Force Headquarters" },
];

export const statusValues: SymbolValue[] = [
  { code: "0", text: "Present" },
  { code: "1", text: "Planned/Anticipated/Suspect" },
  { code: "2", text: "Present/Fully capable" },
  { code: "3", text: "Present/Damaged" },
  { code: "4", text: "Present/Destroyed" },
  { code: "5", text: "Present/Full to capacity" },
];

export const echelonValues: SymbolValue[] = [
  { code: "00", text: "Unspecified" },
  { code: "11", text: "Team/Crew" },
  { code: "12", text: "Squad" },
  { code: "13", text: "Section" },
  { code: "14", text: "Platoon/Detachment" },
  { code: "15", text: "Company/Battery/Troop" },
  { code: "16", text: "Battalion/Squadron" },
  { code: "17", text: "Regiment/Group" },
  { code: "18", text: "Brigade" },
  { code: "21", text: "Division" },
  { code: "22", text: "Corps/MEF" },
  { code: "23", text: "Army" },
  { code: "24", text: "Army Group/Front" },
  { code: "25", text: "Region/Theater" },
  { code: "26", text: "Command" },
];

export const EQUIPMENT_SYMBOLSET_VALUE = "15";
export const mobilityValues: SymbolValue[] = [
  { code: "00", text: "Unspecified" },
  { code: "31", text: "Wheeled limited cross country" },
  { code: "32", text: "Wheeled cross country" },
  { code: "33", text: "Tracked" },
  { code: "34", text: "Wheeled and tracked combination" },
  { code: "35", text: "Towed" },
  { code: "36", text: "Railway" },
  { code: "37", text: "Pack animals" },
  { code: "41", text: "Over snow (prime mover)" },
  { code: "42", text: "Sled" },
  { code: "51", text: "Barge" },
  { code: "52", text: "Amphibious" },
];

export const leadershipValues: SymbolValue[] = [
  { code: "00", text: "Unspecified" },
  { code: "71", text: "Leader" },
];

export const towedArrayValues: SymbolValue[] = [
  { code: "00", text: "Unspecified" },
  { code: "61", text: "Short towed array" },
  { code: "62", text: "Long towed array" },
];

export const standardIdentityValues: SymbolValue[] = [
  {
    code: "0",
    text: "Pending",
  },
  {
    code: "1",
    text: "Unknown",
  },
  {
    code: "2",
    text: "Assumed Friend",
  },
  {
    code: "3",
    text: "Friend",
  },
  {
    code: "4",
    text: "Neutral",
  },
  {
    code: "5",
    text: "Suspect/Joker",
  },
  {
    code: "6",
    text: "Hostile/Faker",
  },
  {
    code: "7",
    text: "Custom 1",
  },
  {
    code: "8",
    text: "Custom 2",
  },
];

export const SID = {
  Pending: "0",
  Unknown: "1",
  AssumedFriend: "2",
  Friend: "3",
  Neutral: "4",
  Suspect: "5",
  Joker: "5",
  Hostile: "6",
  Faker: "6",
  Custom1: "7",
  Custom2: "8",
  Custom3: "9",
} as const;

export type SidValue = (typeof SID)[keyof typeof SID];

export const Dimension = {
  Unknown: "Unknown",
  Space: "Space",
  Air: "Air",
  LandUnit: "LandUnit",
  LandEquipment: "LandEquipment",
  LandInstallation: "LandInstallation",
  SeaSurface: "SeaSurface",
  SeaSubsurface: "SeaSubsurface",
  Activity: "Activity",
  DismountedIndividual: "DismountedIndividual",
} as const;

export type DimensionValue = (typeof Dimension)[keyof typeof Dimension];

export const symbolSetToDimension: Record<string, DimensionValue> = {
  [AIR_SYMBOLSET_VALUE]: Dimension.Air,
  [SPACE_SYMBOLSET_VALUE]: Dimension.Space,
  [UNIT_SYMBOLSET_VALUE]: Dimension.LandUnit,
  [DISMOUNTED_SYMBOLSET_VALUE]: Dimension.DismountedIndividual,
  [SURFACE_SYMBOLSET_VALUE]: Dimension.SeaSurface,
  [SUBSURFACE_SYMBOLSET_VALUE]: Dimension.SeaSubsurface,
  [CONTROL_MEASURE_SYMBOLSET_VALUE]: Dimension.Activity,
  [EQUIPMENT_SYMBOLSET_VALUE]: Dimension.LandEquipment,
};
