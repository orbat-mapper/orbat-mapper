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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeScenarioIfNecessary = upgradeScenarioIfNecessary;
var compare_versions_1 = require("compare-versions");
function upgradeScenarioIfNecessary(scenario) {
    if ((0, compare_versions_1.compare)(scenario.version, "0.30.0", "<")) {
        console.log("Found outdated scenario version, upgrading from", scenario.version);
        var upgradedScenario = __assign({}, scenario);
        upgradedScenario.layers = upgradedScenario.layers.map(function (layer) {
            var upgradedLayer = __assign({}, layer);
            upgradedLayer.features = upgradedLayer.features.map(function (feature) {
                var _a;
                var upgradedFeature = __assign({}, feature);
                var _b = (_a = upgradedFeature.properties) !== null && _a !== void 0 ? _a : {}, visibleFromT = _b.visibleFromT, visibleUntilT = _b.visibleUntilT, type = _b.type, name = _b.name, description = _b.description, externalUrl = _b.externalUrl, radius = _b.radius, _zIndex = _b._zIndex, fillOpacity = _b["fill-opacity"], fill = _b.fill, showLabel = _b.showLabel, strokeOpacity = _b["stroke-opacity"], stroke = _b.stroke, markerColor = _b["marker-color"], markerSize = _b["marker-size"], markerSymbol = _b["marker-symbol"], strokeWidth = _b["stroke-width"], title = _b.title, textPlacement = _b["text-placement"], textAlign = _b["text-align"], textOffsetX = _b["text-offset-x"], textOffsetY = _b["text-offset-y"], limitVisibility = _b.limitVisibility, minZoom = _b.minZoom, maxZoom = _b.maxZoom, textMinZoom = _b.textMinZoom, textMaxZoom = _b.textMaxZoom, rest = __rest(_b, ["visibleFromT", "visibleUntilT", "type", "name", "description", "externalUrl", "radius", "_zIndex", "fill-opacity", "fill", "showLabel", "stroke-opacity", "stroke", "marker-color", "marker-size", "marker-symbol", "stroke-width", "title", "text-placement", "text-align", "text-offset-x", "text-offset-y", "limitVisibility", "minZoom", "maxZoom", "textMinZoom", "textMaxZoom"]);
                var meta = {
                    type: type,
                    visibleFromT: visibleFromT,
                    visibleUntilT: visibleUntilT,
                    name: name,
                    description: description,
                    externalUrl: externalUrl,
                    radius: radius,
                    _zIndex: _zIndex,
                    isHidden: false,
                };
                var style = {
                    fill: fill,
                    "fill-opacity": fillOpacity,
                    "stroke-opacity": strokeOpacity,
                    "stroke-style": "solid",
                    showLabel: showLabel,
                    stroke: stroke,
                    "marker-color": markerColor,
                    "marker-size": markerSize,
                    "marker-symbol": markerSymbol,
                    "stroke-width": strokeWidth,
                    "text-placement": textPlacement,
                    "text-align": textAlign,
                    "text-offset-x": textOffsetX,
                    "text-offset-y": textOffsetY,
                    title: title,
                    limitVisibility: limitVisibility,
                    minZoom: minZoom,
                    maxZoom: maxZoom,
                    textMinZoom: textMinZoom,
                    textMaxZoom: textMaxZoom,
                    "arrow-start": "none",
                    "arrow-end": "none",
                };
                upgradedFeature.meta = meta;
                upgradedFeature.style = style;
                upgradedFeature.properties = rest;
                return upgradedFeature;
            });
            return upgradedLayer;
        });
        return upgradedScenario;
    }
    return scenario;
}
