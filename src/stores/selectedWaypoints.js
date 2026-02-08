"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelectedWaypoints = useSelectedWaypoints;
var vue_1 = require("vue");
var selectedWaypointIds = (0, vue_1.ref)(new Set());
function useSelectedWaypoints() {
    return {
        selectedWaypointIds: selectedWaypointIds,
    };
}
