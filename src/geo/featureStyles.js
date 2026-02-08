"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeatureStyles = useFeatureStyles;
var Circle_1 = require("ol/style/Circle");
var Style_1 = require("ol/style/Style");
var simplestyle_1 = require("./simplestyle");
var arrowStyles_1 = require("./arrowStyles");
var View_1 = require("ol/View");
var Geometry_1 = require("ol/geom/Geometry");
var zoomResolutions = [];
function calculateZoomToResolution(view) {
    zoomResolutions = [];
    for (var i = 0; i <= 24; i++) {
        zoomResolutions.push(view.getResolutionForZoom(i));
    }
}
calculateZoomToResolution(new View_1.default());
var defaultStyle = new Style_1.default({
    stroke: simplestyle_1.defaultSimplestyleStroke,
    fill: simplestyle_1.defaultSimplestyleFill,
    image: new Circle_1.default({
        fill: simplestyle_1.defaultSimplestyleFill,
        stroke: simplestyle_1.defaultSimplestyleStroke,
        radius: 5,
    }),
});
function useFeatureStyles(geo) {
    var styleCache = new Map();
    function clearCache() {
        styleCache.clear();
    }
    function scenarioFeatureStyle(feature, resolution, overrideLimitVisibility) {
        var _a, _b, _c, _d;
        if (overrideLimitVisibility === void 0) { overrideLimitVisibility = false; }
        var featureId = feature.getId();
        var geometry = feature.getGeometry();
        var revision = (_b = (_a = geometry === null || geometry === void 0 ? void 0 : geometry.getRevision) === null || _a === void 0 ? void 0 : _a.call(geometry)) !== null && _b !== void 0 ? _b : 0;
        var cachedItem = styleCache.get(featureId);
        if (cachedItem && cachedItem.revision !== revision) {
            cachedItem = undefined;
        }
        var cachedStyle = cachedItem === null || cachedItem === void 0 ? void 0 : cachedItem.style;
        var scenarioFeature = geo.getFeatureById(featureId).feature;
        if (!scenarioFeature)
            return;
        var _e = scenarioFeature.meta, label = _e.name, _zIndex = _e._zIndex, _f = scenarioFeature.style, _g = _f.showLabel, showLabel = _g === void 0 ? false : _g, limitVisibility = _f.limitVisibility, _h = _f.minZoom, minZoom = _h === void 0 ? 0 : _h, _j = _f.maxZoom, maxZoom = _j === void 0 ? 24 : _j, _k = _f.textMinZoom, textMinZoom = _k === void 0 ? 0 : _k, _l = _f.textMaxZoom, textMaxZoom = _l === void 0 ? 24 : _l;
        if (!cachedStyle) {
            var baseStyle_1 = (0, simplestyle_1.createSimpleStyle)(scenarioFeature.style || {}) || defaultStyle;
            // @ts-ignore
            feature.set("_zIndex", scenarioFeature.meta._zIndex, true);
            // Create arrow styles if applicable
            var geometry_1 = feature.getGeometry();
            var featureStyle = scenarioFeature.style;
            if (geometry_1 instanceof Geometry_1.default &&
                (featureStyle["arrow-start"] || featureStyle["arrow-end"])) {
                var arrowStyles = (0, arrowStyles_1.createArrowStyles)(geometry_1, featureStyle);
                if (arrowStyles.length > 0) {
                    cachedStyle = __spreadArray([baseStyle_1], arrowStyles, true);
                }
                else {
                    cachedStyle = baseStyle_1;
                }
            }
            else {
                cachedStyle = baseStyle_1;
            }
            styleCache.set(featureId, { style: cachedStyle, revision: revision });
        }
        if (limitVisibility &&
            !overrideLimitVisibility &&
            (resolution > zoomResolutions[minZoom] || resolution < zoomResolutions[maxZoom])) {
            return;
        }
        var stylesArray = Array.isArray(cachedStyle) ? cachedStyle : [cachedStyle];
        var baseStyle = stylesArray[0];
        baseStyle.setZIndex(_zIndex !== null && _zIndex !== void 0 ? _zIndex : 0);
        if (showLabel &&
            resolution < zoomResolutions[textMinZoom] &&
            resolution > zoomResolutions[textMaxZoom]) {
            (_c = baseStyle.getText()) === null || _c === void 0 ? void 0 : _c.setText(label);
        }
        else {
            (_d = baseStyle.getText()) === null || _d === void 0 ? void 0 : _d.setText(undefined);
        }
        // Update arrow z-index
        for (var i = 1; i < stylesArray.length; i++) {
            stylesArray[i].setZIndex((_zIndex !== null && _zIndex !== void 0 ? _zIndex : 0) + 1);
        }
        return cachedStyle;
    }
    function invalidateStyle(featureId) {
        styleCache.delete(featureId);
    }
    return {
        clearCache: clearCache,
        scenarioFeatureStyle: scenarioFeatureStyle,
        invalidateStyle: invalidateStyle,
    };
}
