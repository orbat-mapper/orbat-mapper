"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILITARY_TIME_ZONE_NAMES = exports.MILITARY_TIME_ZONES = void 0;
exports.resolveTimeZone = resolveTimeZone;
exports.MILITARY_TIME_ZONES = {
    Alpha: "Etc/GMT-1",
    Bravo: "Etc/GMT-2",
    Charlie: "Etc/GMT-3",
    Delta: "Etc/GMT-4",
    Echo: "Etc/GMT-5",
    Foxtrot: "Etc/GMT-6",
    Golf: "Etc/GMT-7",
    Hotel: "Etc/GMT-8",
    India: "Etc/GMT-9",
    Kilo: "Etc/GMT-10",
    Lima: "Etc/GMT-11",
    Mike: "Etc/GMT-12",
    November: "Etc/GMT+1",
    Oscar: "Etc/GMT+2",
    Papa: "Etc/GMT+3",
    Quebec: "Etc/GMT+4",
    Romeo: "Etc/GMT+5",
    Sierra: "Etc/GMT+6",
    Tango: "Etc/GMT+7",
    Uniform: "Etc/GMT+8",
    Victor: "Etc/GMT+9",
    Whiskey: "Etc/GMT+10",
    "X-ray": "Etc/GMT+11",
    Yankee: "Etc/GMT+12",
    Zulu: "UTC",
};
exports.MILITARY_TIME_ZONE_NAMES = Object.keys(exports.MILITARY_TIME_ZONES);
function resolveTimeZone(tz) {
    return exports.MILITARY_TIME_ZONES[tz] || tz;
}
