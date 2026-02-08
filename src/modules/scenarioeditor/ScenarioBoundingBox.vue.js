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
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var vue_1 = require("vue");
var geoStore_1 = require("@/stores/geoStore");
var button_1 = require("@/components/ui/button");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var helpers_1 = require("@turf/helpers");
var bbox_1 = require("@turf/bbox");
var bbox_polygon_1 = require("@turf/bbox-polygon");
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var Draw_1 = require("ol/interaction/Draw");
var proj_1 = require("ol/proj");
var uiStore_1 = require("@/stores/uiStore");
var selectedStore_1 = require("@/stores/selectedStore");
var core_1 = require("@vueuse/core");
var pinia_1 = require("pinia");
var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var store = scn.store;
var geoStore = (0, geoStore_1.useGeoStore)();
var olMapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var uiStore = (0, uiStore_1.useUiStore)();
var widthStore = (0, uiStore_1.useWidthStore)();
var _a = (0, pinia_1.storeToRefs)(widthStore), orbatPanelWidth = _a.orbatPanelWidth, detailsWidth = _a.detailsWidth;
var showLeftPanel = (0, pinia_1.storeToRefs)(uiStore).showLeftPanel;
var _b = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _b.selectedFeatureIds, selectedUnitIds = _b.selectedUnitIds, activeScenarioEventId = _b.activeScenarioEventId, activeMapLayerId = _b.activeMapLayerId, showScenarioInfo = _b.showScenarioInfo;
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var showDetailsPanel = (0, vue_1.computed)(function () {
    return Boolean(selectedFeatureIds.value.size ||
        selectedUnitIds.value.size ||
        activeScenarioEventId.value ||
        activeMapLayerId.value ||
        showScenarioInfo.value);
});
var boundingBox = (0, vue_1.computed)(function () { return store.state.boundingBox; });
var isDrawing = (0, vue_1.ref)(false);
var drawInteraction = null;
var hasBbox = (0, vue_1.computed)(function () {
    var bbox = boundingBox.value;
    return bbox && bbox.length === 4;
});
var formattedBbox = (0, vue_1.computed)(function () {
    var bbox = boundingBox.value;
    if (!bbox || bbox.length !== 4)
        return "Not set";
    var minLon = bbox[0], minLat = bbox[1], maxLon = bbox[2], maxLat = bbox[3];
    return "SW: ".concat(minLat.toFixed(4), "\u00B0, ").concat(minLon.toFixed(4), "\u00B0 \u2014 NE: ").concat(maxLat.toFixed(4), "\u00B0, ").concat(maxLon.toFixed(4), "\u00B0");
});
// Create a layer to show the bounding box on the map
var bboxLayer = new Vector_1.default({
    source: new Vector_2.default({}),
    style: {
        "stroke-color": "#3b82f6",
        "stroke-width": 2,
        "stroke-line-dash": [8, 8],
        "fill-color": "rgba(59, 130, 246, 0.1)",
    },
});
function drawBboxOnMap() {
    var _a;
    var bbox = boundingBox.value;
    if (bbox && bbox.length === 4) {
        var polygon = (0, bbox_polygon_1.default)(bbox);
        (0, openlayersHelpers_1.drawGeoJsonLayer)(bboxLayer, polygon);
    }
    else {
        (_a = bboxLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    }
}
// Watch for bbox changes and redraw
(0, vue_1.watch)(boundingBox, function () {
    drawBboxOnMap();
});
(0, vue_1.onMounted)(function () {
    olMapRef.value.addLayer(bboxLayer);
    drawBboxOnMap();
});
(0, vue_1.onUnmounted)(function () {
    var _a;
    stopDrawing();
    (_a = bboxLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    olMapRef.value.removeLayer(bboxLayer);
});
function updateBoundingBox(bbox) {
    store.update(function (s) {
        s.boundingBox = bbox;
    });
}
function startDrawing() {
    isDrawing.value = true;
    drawInteraction = new Draw_1.default({
        type: "Circle",
        geometryFunction: (0, Draw_1.createBox)(),
    });
    drawInteraction.on("drawend", function (e) {
        var geometry = e.feature.getGeometry();
        if (!geometry)
            return;
        var extent = geometry.getExtent();
        var bbox = (0, proj_1.transformExtent)(extent, "EPSG:3857", "EPSG:4326");
        updateBoundingBox(bbox);
        stopDrawing();
    });
    olMapRef.value.addInteraction(drawInteraction);
}
function stopDrawing() {
    if (drawInteraction) {
        olMapRef.value.removeInteraction(drawInteraction);
        drawInteraction = null;
    }
    isDrawing.value = false;
}
function toggleDrawing() {
    if (isDrawing.value) {
        stopDrawing();
    }
    else {
        startDrawing();
    }
}
function setFromMapView() {
    var map = olMapRef.value;
    if (!map)
        return;
    var size = map.getSize();
    if (!size)
        return;
    var leftWidth = !isMobile.value && showLeftPanel.value ? orbatPanelWidth.value : 0;
    var rightWidth = !isMobile.value && showDetailsPanel.value ? detailsWidth.value : 0;
    var width = size[0], height = size[1];
    var blPixel = [leftWidth, height];
    var trPixel = [width - rightWidth, 0];
    var blCoord = map.getCoordinateFromPixel(blPixel);
    var trCoord = map.getCoordinateFromPixel(trPixel);
    if (!blCoord || !trCoord)
        return;
    var blLonLat = (0, proj_1.toLonLat)(blCoord);
    var trLonLat = (0, proj_1.toLonLat)(trCoord);
    var bbox = [blLonLat[0], blLonLat[1], trLonLat[0], trLonLat[1]];
    updateBoundingBox(bbox);
}
function setFromUnits() {
    var units = Object.values(store.state.unitMap);
    var points = units
        .map(function (u) { var _a; return (_a = u._state) === null || _a === void 0 ? void 0 : _a.location; })
        .filter(function (loc) { return !!loc; })
        .map(function (loc) { return (0, helpers_1.point)(loc); });
    if (points.length === 0)
        return;
    var fc = (0, helpers_1.featureCollection)(points);
    var bbox = (0, bbox_1.default)(fc);
    var expanded = expandBbox(bbox, 0.1);
    updateBoundingBox(expanded);
}
function expandBbox(bbox, factor) {
    var minLon = bbox[0], minLat = bbox[1], maxLon = bbox[2], maxLat = bbox[3];
    var width = maxLon - minLon;
    var height = maxLat - minLat;
    // If point, give some default size or just keep as point?
    // Usually if width is 0, we can add a small delta.
    // But let's just add factor * width. If width is 0, it stays 0.
    // To ensure visibility of a single point, we might need a minimum size or rely on map zoom limits.
    // Let's assume factor is applied. For single point, we might want fixed margin in degrees?
    // Let's use simple expansion for now. If width is 0, add 0.01 degrees?
    var dx = width === 0 ? 0.01 : width * factor;
    var dy = height === 0 ? 0.01 : height * factor;
    return [minLon - dx, minLat - dy, maxLon + dx, maxLat + dy];
}
function setFromSelectedUnits() {
    var units = __spreadArray([], selectedUnitIds.value, true).map(function (id) { return store.state.unitMap[id]; })
        .filter(function (u) { return !!u; });
    if (units.length === 0)
        return;
    var points = units
        .map(function (u) { var _a; return (_a = u._state) === null || _a === void 0 ? void 0 : _a.location; })
        .filter(function (loc) { return !!loc; })
        .map(function (loc) { return (0, helpers_1.point)(loc); });
    if (points.length === 0)
        return;
    var fc = (0, helpers_1.featureCollection)(points);
    var bbox = (0, bbox_1.default)(fc);
    var expanded = expandBbox(bbox, 0.1);
    updateBoundingBox(expanded);
}
function zoomToBbox() {
    var bbox = boundingBox.value;
    if (bbox && bbox.length === 4) {
        geoStore.zoomToBbox(bbox);
    }
}
function clearBbox() {
    updateBoundingBox(null);
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: "Current bounding box",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: "Current bounding box",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ({ 'text-gray-400 dark:text-gray-500': !__VLS_ctx.hasBbox }) }));
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-500']} */ ;
(__VLS_ctx.formattedBbox);
// @ts-ignore
[hasBbox, formattedBbox,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { variant: (__VLS_ctx.isDrawing ? 'default' : 'outline'), size: "sm" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: (__VLS_ctx.isDrawing ? 'default' : 'outline'), size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleDrawing) });
var __VLS_13 = __VLS_9.slots.default;
(__VLS_ctx.isDrawing ? "Cancel drawing" : "Draw on map");
// @ts-ignore
[isDrawing, isDrawing, toggleDrawing,];
var __VLS_9;
var __VLS_10;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19;
var __VLS_20 = ({ click: {} },
    { onClick: (__VLS_ctx.setFromMapView) });
var __VLS_21 = __VLS_17.slots.default;
// @ts-ignore
[setFromMapView,];
var __VLS_17;
var __VLS_18;
var __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27;
var __VLS_28 = ({ click: {} },
    { onClick: (__VLS_ctx.setFromUnits) });
var __VLS_29 = __VLS_25.slots.default;
// @ts-ignore
[setFromUnits,];
var __VLS_25;
var __VLS_26;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (__VLS_ctx.selectedUnitIds.size === 0) })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (__VLS_ctx.selectedUnitIds.size === 0) })], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
var __VLS_36 = ({ click: {} },
    { onClick: (__VLS_ctx.setFromSelectedUnits) });
var __VLS_37 = __VLS_33.slots.default;
// @ts-ignore
[selectedUnitIds, setFromSelectedUnits,];
var __VLS_33;
var __VLS_34;
var __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (!__VLS_ctx.hasBbox) })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (!__VLS_ctx.hasBbox) })], __VLS_functionalComponentArgsRest(__VLS_39), false));
var __VLS_43;
var __VLS_44 = ({ click: {} },
    { onClick: (__VLS_ctx.zoomToBbox) });
var __VLS_45 = __VLS_41.slots.default;
// @ts-ignore
[hasBbox, zoomToBbox,];
var __VLS_41;
var __VLS_42;
var __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (!__VLS_ctx.hasBbox) })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm", disabled: (!__VLS_ctx.hasBbox) })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51;
var __VLS_52 = ({ click: {} },
    { onClick: (__VLS_ctx.clearBbox) });
var __VLS_53 = __VLS_49.slots.default;
// @ts-ignore
[hasBbox, clearBbox,];
var __VLS_49;
var __VLS_50;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
