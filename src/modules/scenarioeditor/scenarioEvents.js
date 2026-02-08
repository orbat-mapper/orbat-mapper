"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScenarioEvents = useScenarioEvents;
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var geoStore_1 = require("@/stores/geoStore");
function useScenarioEvents(olMap) {
    var _a = (0, scenarioUtils_1.useActiveScenario)(), onGoToScenarioEventEvent = _a.time.onGoToScenarioEventEvent, getUnitById = _a.helpers.getUnitById;
    var geoStore = (0, geoStore_1.useGeoStore)();
    onGoToScenarioEventEvent(function (_a) {
        var event = _a.event;
        var where = event.where;
        if (!where)
            return;
        var maxZoom = where.maxZoom;
        if (where.type === "units") {
            var units = where.units.map(function (u) { return getUnitById(u); });
            if (units) {
                geoStore.zoomToUnits(units, { duration: 900, maxZoom: maxZoom });
            }
        }
        else if (where.type === "geometry") {
            geoStore.zoomToGeometry(where.geometry, { duration: 900, maxZoom: maxZoom });
        }
    });
    return {};
}
