"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGeoJsonConverter = useGeoJsonConverter;
var helpers_1 = require("@turf/helpers");
function useGeoJsonConverter(scenario) {
    var geo = scenario.geo, unitActions = scenario.unitActions;
    function convertUnitsToGeoJson(units, options) {
        if (options === void 0) { options = {}; }
        var features = units.map(function (unit) {
            var _a, _b, _c, _d;
            var includeIdInProperties = (_a = options.includeIdInProperties) !== null && _a !== void 0 ? _a : false;
            var id = unit.id, name = unit.name, sidc = unit.sidc, shortName = unit.shortName, description = unit.description;
            var symbolOptions = unitActions.getCombinedSymbolOptions(unit);
            return (0, helpers_1.point)((_b = unit._state) === null || _b === void 0 ? void 0 : _b.location, __assign(__assign({ id: includeIdInProperties ? id : undefined, name: name, shortName: shortName, sidc: ((_c = unit._state) === null || _c === void 0 ? void 0 : _c.sidc) || sidc, description: description }, ((_d = unit.textAmplifiers) !== null && _d !== void 0 ? _d : {})), symbolOptions), { id: options.includeId ? id : undefined });
        });
        return (0, helpers_1.featureCollection)(features);
    }
    function convertScenarioFeaturesToGeoJson(options) {
        var _a;
        if (options === void 0) { options = {}; }
        var includeIdInProperties = (_a = options.includeIdInProperties) !== null && _a !== void 0 ? _a : false;
        return (0, helpers_1.featureCollection)(geo.layers.value
            .map(function (layer) { return layer.features; })
            .flat(1)
            .map(function (f) {
            var id = f.id, geometry = f.geometry, properties = f.properties, meta = f.meta;
            return {
                type: "Feature",
                id: options.includeId ? id : undefined,
                properties: __assign({ id: includeIdInProperties ? id : undefined, name: meta.name, description: meta.description }, properties),
                geometry: geometry,
            };
        }));
    }
    return { convertUnitsToGeoJson: convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson: convertScenarioFeaturesToGeoJson };
}
