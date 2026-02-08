"use strict";
// Values based on code from https://github.com/spatialillusions/milsymbol-generator
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbolSetToDimension = exports.Dimension = exports.SID = exports.standardIdentityValues = exports.towedArrayValues = exports.leadershipValues = exports.mobilityValues = exports.EQUIPMENT_SYMBOLSET_VALUE = exports.echelonValues = exports.statusValues = exports.HQTFDummyValues = exports.symbolSetMap = exports.symbolSetValues = exports.CONTROL_MEASURE_SYMBOLSET_VALUE = exports.SUBSURFACE_SYMBOLSET_VALUE = exports.SURFACE_SYMBOLSET_VALUE = exports.DISMOUNTED_SYMBOLSET_VALUE = exports.UNIT_SYMBOLSET_VALUE = exports.SPACE_SYMBOLSET_VALUE = exports.AIR_SYMBOLSET_VALUE = void 0;
exports.AIR_SYMBOLSET_VALUE = "01";
exports.SPACE_SYMBOLSET_VALUE = "05";
exports.UNIT_SYMBOLSET_VALUE = "10";
exports.DISMOUNTED_SYMBOLSET_VALUE = "27";
exports.SURFACE_SYMBOLSET_VALUE = "30";
exports.SUBSURFACE_SYMBOLSET_VALUE = "35";
exports.CONTROL_MEASURE_SYMBOLSET_VALUE = "25";
exports.symbolSetValues = [
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
exports.symbolSetMap = exports.symbolSetValues.reduce(function (acc, curr) {
    acc[curr.code] = curr;
    return acc;
}, {});
exports.HQTFDummyValues = [
    { code: "0", text: "Not Applicable" },
    { code: "1", text: "Feint/Dummy" },
    { code: "2", text: "Headquarters" },
    { code: "3", text: "Feint/Dummy Headquarters" },
    { code: "4", text: "Task Force" },
    { code: "5", text: "Feint/Dummy Task Force" },
    { code: "6", text: "Task Force Headquarters" },
    { code: "7", text: "Feint/Dummy Task Force Headquarters" },
];
exports.statusValues = [
    { code: "0", text: "Present" },
    { code: "1", text: "Planned/Anticipated/Suspect" },
    { code: "2", text: "Present/Fully capable" },
    { code: "3", text: "Present/Damaged" },
    { code: "4", text: "Present/Destroyed" },
    { code: "5", text: "Present/Full to capacity" },
];
exports.echelonValues = [
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
exports.EQUIPMENT_SYMBOLSET_VALUE = "15";
exports.mobilityValues = [
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
exports.leadershipValues = [
    { code: "00", text: "Unspecified" },
    { code: "71", text: "Leader" },
];
exports.towedArrayValues = [
    { code: "00", text: "Unspecified" },
    { code: "61", text: "Short towed array" },
    { code: "62", text: "Long towed array" },
];
exports.standardIdentityValues = [
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
exports.SID = {
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
};
exports.Dimension = {
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
};
exports.symbolSetToDimension = (_a = {},
    _a[exports.AIR_SYMBOLSET_VALUE] = exports.Dimension.Air,
    _a[exports.SPACE_SYMBOLSET_VALUE] = exports.Dimension.Space,
    _a[exports.UNIT_SYMBOLSET_VALUE] = exports.Dimension.LandUnit,
    _a[exports.DISMOUNTED_SYMBOLSET_VALUE] = exports.Dimension.DismountedIndividual,
    _a[exports.SURFACE_SYMBOLSET_VALUE] = exports.Dimension.SeaSurface,
    _a[exports.SUBSURFACE_SYMBOLSET_VALUE] = exports.Dimension.SeaSubsurface,
    _a[exports.CONTROL_MEASURE_SYMBOLSET_VALUE] = exports.Dimension.Activity,
    _a[exports.EQUIPMENT_SYMBOLSET_VALUE] = exports.Dimension.LandEquipment,
    _a);
