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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var ChevronPanel_vue_1 = require("@/components/ChevronPanel.vue");
var vue_1 = require("vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var uiStore_1 = require("@/stores/uiStore");
var constants_1 = require("@/types/constants");
var selectedStore_1 = require("@/stores/selectedStore");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var scenarioMapLayers_1 = require("@/modules/scenarioeditor/scenarioMapLayers");
var SplitButton_vue_1 = require("@/components/SplitButton.vue");
var ScenarioFeatureLayer_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureLayer.vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var closest_edge_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var emit = defineEmits(["feature-click"]);
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var activeLayerId = (0, utils_1.injectStrict)(injects_1.activeLayerKey);
var uiStore = (0, uiStore_1.useUiStore)();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), geo = _a.geo, _b = _a.store, groupUpdate = _b.groupUpdate, state = _b.state;
var mapLayers = geo.mapLayers;
uiStore.layersPanelActive = true;
(0, vue_1.onUnmounted)(function () { return (uiStore.layersPanelActive = false); });
var mapLayerMenuItems = [
    { label: "Zoom to", action: "zoom" },
    { label: "Move up", action: "moveUp" },
    { label: "Move down", action: "moveDown" },
    { label: "Delete", action: "delete" },
];
var mapLayerButtonItems = [
    {
        label: "Add feature layer",
        onClick: function () {
            var newLayer = addNewLayer();
        },
    },
    {
        label: "Add image layer",
        onClick: function () { return addNewMapLayer("ImageLayer"); },
    },
    {
        label: "Add XYZ tile layer",
        onClick: function () { return addNewMapLayer("XYZLayer"); },
    },
    {
        label: "Add TileJSON layer",
        onClick: function () { return addNewMapLayer("TileJSONLayer"); },
    },
];
var _c = (0, featureLayerUtils_1.useFeatureLayerUtils)(mapRef.value), scenarioLayersFeatures = _c.scenarioLayersFeatures, scenarioLayersGroup = _c.scenarioLayersGroup, zoomToLayer = _c.zoomToLayer, zoomToFeature = _c.zoomToFeature, zoomToFeatures = _c.zoomToFeatures, panToFeature = _c.panToFeature;
(0, featureLayerUtils_1.useScenarioLayerSync)(scenarioLayersGroup.getLayers());
var _d = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _d.selectedFeatureIds, selectedMapLayerIds = _d.selectedMapLayerIds, activeMapLayerId = _d.activeMapLayerId, activeFeatureId = _d.activeFeatureId;
var editedLayerId = (0, vue_1.ref)(null);
function calculateSelectedFeatureIds(newFeatureId) {
    var lastSelectedId = __spreadArray([], selectedFeatureIds.value, true).pop();
    if (lastSelectedId === undefined)
        return [newFeatureId];
    var allOpenFeatures = [];
    for (var _i = 0, _a = scenarioLayersFeatures.value; _i < _a.length; _i++) {
        var _b = _a[_i], features = _b.features, layer = _b.layer;
        if (!(layer._isOpen === false)) {
            features.forEach(function (feature) {
                allOpenFeatures.push(feature.id);
            });
        }
    }
    var lastSelectedIndex = allOpenFeatures.indexOf(lastSelectedId);
    var newFeatureIndex = allOpenFeatures.indexOf(newFeatureId);
    if (lastSelectedIndex === -1 || newFeatureIndex === -1)
        return [newFeatureId];
    return allOpenFeatures.slice(Math.min(lastSelectedIndex, newFeatureIndex), Math.max(lastSelectedIndex, newFeatureIndex) + 1);
}
function onFeatureClick(feature, layer, event) {
    var ids = selectedFeatureIds.value;
    if (event && event.shiftKey) {
        var selectedIds = calculateSelectedFeatureIds(feature.id);
        selectedIds.forEach(function (id) {
            ids.add(id);
        });
    }
    else if (event && (event.ctrlKey || event.metaKey)) {
        if (ids.has(feature.id)) {
            ids.delete(feature.id);
        }
        else {
            ids.add(feature.id);
        }
    }
    else {
        activeFeatureId.value = feature.id;
    }
    emit("feature-click", feature, layer, event);
}
function onFeatureDoubleClick(feature, layer, event) {
    zoomToFeature(feature.id);
}
var bus = (0, core_1.useEventBus)(eventKeys_1.imageLayerAction);
function onImageLayerClick(layer, event) {
    if ((event === null || event === void 0 ? void 0 : event.ctrlKey) || (event === null || event === void 0 ? void 0 : event.shiftKey)) {
        if (selectedMapLayerIds.value.has(layer.id)) {
            selectedMapLayerIds.value.delete(layer.id);
        }
        else {
            selectedMapLayerIds.value.add(layer.id);
        }
    }
    else {
        selectedMapLayerIds.value.clear();
        selectedMapLayerIds.value.add(layer.id);
    }
}
function onImageLayerDoubleClick(layer) {
    bus.emit({ action: "zoom", id: layer.id });
}
var mapLayersMenuItems = [
    { label: "Add image layer", action: function () { return addNewMapLayer("ImageLayer"); } },
    { label: "Add TileJSON layer", action: function () { return addNewMapLayer("TileJSONLayer"); } },
    { label: "Add XYZ tile layer", action: function () { return addNewMapLayer("XYZLayer"); } },
];
function onMapLayerAction(layer, action) {
    if (action === "zoom")
        bus.emit({ action: action, id: layer.id });
    if (action === "delete") {
        geo.deleteMapLayer(layer.id);
        activeMapLayerId.value = null;
    }
    if (action === "moveUp") {
        geo.moveMapLayer(layer.id, { direction: "up" });
    }
    if (action === "moveDown") {
        geo.moveMapLayer(layer.id, { direction: "down" });
    }
}
function onLayerAction(layer, action) {
    if (action === constants_1.ScenarioLayerActions.SetActive)
        activeLayerId.value = layer.id;
    if (action === constants_1.ScenarioLayerActions.Zoom)
        zoomToLayer(layer.id);
    if (action === constants_1.ScenarioLayerActions.Edit) {
        editedLayerId.value = layer.id;
        layer._isOpen = true;
    }
    if (action === constants_1.ScenarioLayerActions.Delete) {
        /* if (activeLayer.value === layer.id) {
          activeLayer.value = null;
          olCurrentLayer.value = null;
        }*/
        geo.deleteLayer(layer.id);
    }
    if (action === constants_1.ScenarioLayerActions.MoveUp ||
        action === constants_1.ScenarioLayerActions.MoveDown) {
        var direction = action === constants_1.ScenarioLayerActions.MoveUp ? "up" : "down";
        var toIndex = geo.getLayerIndex(layer.id);
        if (direction === "up")
            toIndex--;
        if (direction === "down")
            toIndex++;
        geo.moveLayer(layer.id, toIndex);
    }
}
function onFeatureAction(featureOrFeaturesId, action) {
    var isArray = Array.isArray(featureOrFeaturesId);
    if (isArray && (action === "zoom" || action === "pan")) {
        zoomToFeatures(featureOrFeaturesId);
        return;
    }
    var tmp = isArray ? featureOrFeaturesId : [featureOrFeaturesId];
    groupUpdate(function () {
        return tmp.forEach(function (featureId) {
            var _a = geo.getFeatureById(featureId) || {}, feature = _a.feature, layer = _a.layer;
            if (action === "zoom")
                zoomToFeature(featureId);
            if (action === "pan")
                panToFeature(featureId);
            if (!layer || !layer)
                return;
            if (action === "delete") {
                geo.deleteFeature(feature.id);
                selectedFeatureIds.value.delete(feature.id);
            }
            if (action === "moveUp" || action === "moveDown") {
                var direction = action === "moveUp" ? "up" : "down";
                var layer_1 = geo.getLayerById(feature._pid);
                var toIndex = layer_1.features.indexOf(feature.id);
                if (direction === "up")
                    toIndex--;
                if (direction === "down")
                    toIndex++;
                geo.moveFeature(feature.id, toIndex);
            }
            if (action === "duplicate") {
                var newId = geo.duplicateFeature(featureId);
                if (selectedFeatureIds.value.size === 1) {
                    activeFeatureId.value = newId;
                }
            }
        });
    }, { label: "batchLayer", value: "dummy" });
}
function onFeatureDrop(data) {
    var feature = data.feature, destinationFeature = data.destinationFeature, target = data.target;
    geo.reorderFeature(feature.id, destinationFeature.id, target);
}
function addNewLayer() {
    var addedLayer = geo.addLayer({
        id: (0, utils_1.nanoid)(),
        name: "New layer",
        features: [],
        _isNew: false,
    });
    activeLayerId.value = addedLayer.id;
    editedLayerId.value = addedLayer.id;
    return addedLayer;
}
function addNewMapLayer(layerType) {
    var newLayer = (0, scenarioMapLayers_1.addMapLayer)(layerType, geo);
    uiStore.mapLayersPanelOpen = true;
    (0, vue_1.nextTick)(function () {
        activeMapLayerId.value = newLayer.id;
    });
    return newLayer;
}
function toggleMapLayerVisibility(layer) {
    geo.updateMapLayer(layer.id, { isHidden: !layer.isHidden });
}
function onLayerDrop(layer, feature) {
    onFeatureDrop({
        feature: feature,
        destinationFeature: layer,
        target: "on",
    });
}
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    dndCleanup = (0, adapter_1.monitorForElements)({
        canMonitor: function (_a) {
            var source = _a.source;
            return (0, draggables_1.isScenarioFeatureDragItem)(source.data) ||
                (0, draggables_1.isScenarioFeatureLayerDragItem)(source.data);
        },
        onDrop: function (_a) {
            var source = _a.source, location = _a.location;
            var destination = location.current.dropTargets[0];
            if (!destination) {
                // if dropped outside any drop targets
                return;
            }
            var closestEdgeOfTarget = (0, closest_edge_1.extractClosestEdge)(destination.data);
            if ((0, draggables_1.isScenarioFeatureDragItem)(source.data) &&
                (0, draggables_1.isScenarioFeatureDragItem)(destination.data)) {
                var target = closestEdgeOfTarget === "top" ? "above" : "below";
                onFeatureDrop({
                    feature: source.data.feature,
                    destinationFeature: destination.data.feature,
                    target: target,
                });
                // get element by data id
                var featureId_1 = source.data.feature.id;
                (0, vue_1.nextTick)(function () {
                    var el = document.querySelector("[data-feature-id=\"".concat(featureId_1, "\"]"));
                    if (el) {
                        (0, utils_1.triggerPostMoveFlash)(el);
                    }
                });
            }
            else if ((0, draggables_1.isScenarioFeatureLayerDragItem)(destination.data) &&
                (0, draggables_1.isScenarioFeatureDragItem)(source.data)) {
                onLayerDrop(destination.data.layer, source.data.feature);
                var featureId_2 = source.data.feature.id;
                (0, vue_1.nextTick)(function () {
                    var el = document.querySelector("[data-feature-id=\"".concat(featureId_2, "\"]"));
                    if (el) {
                        (0, utils_1.triggerPostMoveFlash)(el);
                    }
                });
            }
            else if ((0, draggables_1.isScenarioFeatureLayerDragItem)(source.data) &&
                (0, draggables_1.isScenarioFeatureLayerDragItem)(destination.data)) {
                var fromIndex = geo.getLayerIndex(source.data.layer.id);
                var toIndex = geo.getLayerIndex(destination.data.layer.id);
                if (closestEdgeOfTarget === "bottom")
                    toIndex++;
                if (fromIndex < toIndex)
                    toIndex--;
                geo.moveLayer(source.data.layer.id, toIndex);
                var layerId_1 = source.data.layer.id;
                (0, vue_1.nextTick)(function () {
                    var el = document.querySelector("[data-layer-id=\"".concat(layerId_1, "\"]"));
                    if (el) {
                        (0, utils_1.triggerPostMoveFlash)(el);
                    }
                });
            }
        },
    });
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_0 = ChevronPanel_vue_1.default || ChevronPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ label: "Map layers" }, { class: "mb-4" }), { headerClass: "ml-4", open: (__VLS_ctx.uiStore.mapLayersPanelOpen) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ label: "Map layers" }, { class: "mb-4" }), { headerClass: "ml-4", open: (__VLS_ctx.uiStore.mapLayersPanelOpen) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
var __VLS_5 = __VLS_3.slots.default;
{
    var __VLS_6 = __VLS_3.slots.right;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_7 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }, { items: (__VLS_ctx.mapLayersMenuItems) })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }, { items: (__VLS_ctx.mapLayersMenuItems) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    // @ts-ignore
    [uiStore, mapLayersMenuItems,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "-mt-6" }));
/** @type {__VLS_StyleScopedClasses['-mt-6']} */ ;
var _loop_1 = function (layer) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign(__assign(__assign(__assign({ onDblclick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onImageLayerDoubleClick(layer);
            // @ts-ignore
            [mapLayers, onImageLayerDoubleClick,];
        } }, { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onImageLayerClick(layer, $event);
            // @ts-ignore
            [onImageLayerClick,];
        } }), { class: "group hover:bg-accent relative flex items-center justify-between border-l select-none" }), { key: (layer.id) }), { class: (__VLS_ctx.selectedMapLayerIds.has(layer.id)
            ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
            : 'border-transparent') }));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-accent']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "flex flex-auto items-center py-2.5 sm:py-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:py-2']} */ ;
    var __VLS_12 = (__VLS_ctx.getMapLayerIcon(layer));
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "text-muted-foreground size-5" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "group-hover:text-accent-foreground text-foreground ml-2 text-left text-sm" }, { class: ({
            'font-bold': __VLS_ctx.activeMapLayerId === layer.id,
            'opacity-50': layer.isHidden,
        }) }));
    /** @type {__VLS_StyleScopedClasses['group-hover:text-accent-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
    (layer.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex items-center" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    if (layer._isTemporary) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge" }, { title: "Temporary layer. Not saved" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleMapLayerVisibility(layer);
            // @ts-ignore
            [selectedMapLayerIds, scenarioMapLayers_1.getMapLayerIcon, activeMapLayerId, toggleMapLayerVisibility,];
        } }, { onKeydown: function () { } }), { type: "button" }), { class: "text-muted-foreground hover:text-muted-foreground ml-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Toggle layer visibility" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    if (layer.isHidden) {
        var __VLS_17 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
        vue_mdi_1.IconEyeOff;
        // @ts-ignore
        var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "h-5 w-5" })));
        var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    else {
        var __VLS_22 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEye} */
        vue_mdi_1.IconEye;
        // @ts-ignore
        var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "h-5 w-5" })));
        var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    var __VLS_27 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.mapLayerMenuItems) }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.mapLayerMenuItems) }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    var __VLS_32 = void 0;
    var __VLS_33 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onMapLayerAction(layer, $event);
                // @ts-ignore
                [mapLayerMenuItems, onMapLayerAction,];
            } });
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    // @ts-ignore
    [];
};
var __VLS_30, __VLS_31;
for (var _i = 0, _e = __VLS_vFor((__VLS_ctx.mapLayers)); _i < _e.length; _i++) {
    var layer = _e[_i][0];
    _loop_1(layer);
}
// @ts-ignore
[];
var __VLS_3;
for (var _f = 0, _g = __VLS_vFor((__VLS_ctx.scenarioLayersFeatures)); _f < _g.length; _f++) {
    var _h = _g[_f][0], layer = _h.layer, features = _h.features;
    var __VLS_34 = ScenarioFeatureLayer_vue_1.default;
    // @ts-ignore
    var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign(__assign(__assign(__assign({ 'onFeatureClick': {} }, { 'onFeatureDoubleClick': {} }), { 'onFeatureAction': {} }), { 'onLayerAction': {} }), { key: (layer.id), features: (features), layer: (layer), activeLayerId: (__VLS_ctx.activeLayerId), editedLayerId: (__VLS_ctx.editedLayerId) })));
    var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onFeatureClick': {} }, { 'onFeatureDoubleClick': {} }), { 'onFeatureAction': {} }), { 'onLayerAction': {} }), { key: (layer.id), features: (features), layer: (layer), activeLayerId: (__VLS_ctx.activeLayerId), editedLayerId: (__VLS_ctx.editedLayerId) })], __VLS_functionalComponentArgsRest(__VLS_35), false));
    var __VLS_39 = void 0;
    var __VLS_40 = ({ featureClick: {} },
        { onFeatureClick: (__VLS_ctx.onFeatureClick) });
    var __VLS_41 = ({ featureDoubleClick: {} },
        { onFeatureDoubleClick: (__VLS_ctx.onFeatureDoubleClick) });
    var __VLS_42 = ({ featureAction: {} },
        { onFeatureAction: (__VLS_ctx.onFeatureAction) });
    var __VLS_43 = ({ layerAction: {} },
        { onLayerAction: (__VLS_ctx.onLayerAction) });
    var __VLS_37;
    var __VLS_38;
    // @ts-ignore
    [scenarioLayersFeatures, activeLayerId, editedLayerId, onFeatureClick, onFeatureDoubleClick, onFeatureAction, onLayerAction,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "my-8 text-right" }));
/** @type {__VLS_StyleScopedClasses['my-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
var __VLS_44 = SplitButton_vue_1.default;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    items: (__VLS_ctx.mapLayerButtonItems),
}));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.mapLayerButtonItems),
    }], __VLS_functionalComponentArgsRest(__VLS_45), false));
// @ts-ignore
[mapLayerButtonItems,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
