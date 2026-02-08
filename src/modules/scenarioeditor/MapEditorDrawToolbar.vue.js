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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var FloatingPanel_vue_1 = require("@/components/FloatingPanel.vue");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var MainToolbarButton_vue_1 = require("@/components/MainToolbarButton.vue");
var core_1 = require("@vueuse/core");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var geoEditing_1 = require("@/composables/geoEditing");
var mapSelectStore_1 = require("@/stores/mapSelectStore");
var vue_1 = require("vue");
var pinia_1 = require("pinia");
var selectedStore_1 = require("@/stores/selectedStore");
var scenarioFeatureLayers_1 = require("@/modules/scenarioeditor/scenarioFeatureLayers");
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), groupUpdate = _a.store.groupUpdate, geo = _a.geo;
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var featureSelectInteractionRef = (0, utils_1.injectStrict)(injects_1.activeFeatureSelectInteractionKey);
var activeLayerIdRef = (0, utils_1.injectStrict)(injects_1.activeLayerKey);
var getOlLayerById = (0, featureLayerUtils_1.useFeatureLayerUtils)(mapRef.value).getOlLayerById;
var _b = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _b.selectedFeatureIds, activeFeatureId = _b.activeFeatureId;
var _c = (0, pinia_1.storeToRefs)((0, mainToolbarStore_1.useMainToolbarStore)()), addMultiple = _c.addMultiple, currentDrawStyle = _c.currentDrawStyle;
var _d = (0, core_1.useToggle)(true), snap = _d[0], toggleSnap = _d[1];
var _e = (0, core_1.useToggle)(false), translate = _e[0], toggleTranslate = _e[1];
var _f = (0, core_1.useToggle)(false), modifyHistory = _f[0], toggleModifyHistory = _f[1];
var layer = (0, vue_1.ref)();
(0, vue_1.watch)(activeLayerIdRef, function (layerId) {
    var _a;
    if (layerId) {
        layer.value = getOlLayerById(layerId);
    }
    else if (((_a = geo.layers.value) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        layer.value = getOlLayerById(geo.layers.value[0].id);
    }
}, { immediate: true });
function updateFeatureGeometryFromOlFeature(olFeature, updateState) {
    if (updateState === void 0) { updateState = false; }
    var t = (0, scenarioFeatureLayers_1.convertOlFeatureToScenarioFeature)(olFeature);
    var id = olFeature.getId();
    if (!id)
        return;
    var _a = geo.getFeatureById(id) || {}, feature = _a.feature, layer = _a.layer;
    if (!(feature && layer))
        return;
    var dataUpdate = {
        meta: __assign(__assign({}, feature.meta), t.meta),
        properties: __assign(__assign({}, feature.properties), t.properties),
        geometry: t.geometry,
    };
    if (updateState) {
        geo.addFeatureStateGeometry(id, t.geometry);
    }
    else {
        geo.updateFeature(id, dataUpdate, { noEmit: true });
    }
}
function addOlFeature(olFeature, olLayer) {
    var _a;
    if (!olFeature.getId())
        olFeature.setId((0, utils_1.nanoid)());
    var scenarioFeature = (0, scenarioFeatureLayers_1.convertOlFeatureToScenarioFeature)(olFeature);
    var scenarioLayer = geo.getLayerById(olLayer.get("id"));
    var lastFeatureInLayer = geo.getFeatureById(scenarioLayer.features[scenarioLayer.features.length - 1]).feature;
    var _zIndex = Math.max(scenarioLayer.features.length, ((lastFeatureInLayer === null || lastFeatureInLayer === void 0 ? void 0 : lastFeatureInLayer.meta._zIndex) || 0) + 1);
    scenarioFeature.meta.name = "".concat(scenarioFeature.meta.type, " ").concat(_zIndex + 1);
    scenarioFeature.meta._zIndex = _zIndex;
    scenarioFeature.style = (_a = currentDrawStyle.value) !== null && _a !== void 0 ? _a : {};
    olFeature.set("_zIndex", _zIndex);
    scenarioLayer && geo.addFeature(scenarioFeature, scenarioLayer.id);
    return scenarioFeature;
}
var _g = (0, geoEditing_1.useEditingInteraction)(mapRef.value, layer.value, {
    addMultiple: addMultiple,
    select: featureSelectInteractionRef.value,
    addHandler: function (olFeature, olLayer) {
        var newFeature = addOlFeature(olFeature, olLayer);
        activeFeatureId.value = newFeature.id;
    },
    modifyHandler: function (olFeatures) {
        olFeatures.forEach(function (f) {
            return updateFeatureGeometryFromOlFeature(f, modifyHistory.value);
        });
    },
    snap: snap,
    translate: translate,
}), startDrawing = _g.startDrawing, currentDrawType = _g.currentDrawType, startModify = _g.startModify, isModifying = _g.isModifying, cancel = _g.cancel, isDrawing = _g.isDrawing;
var store = (0, mainToolbarStore_1.useMainToolbarStore)();
var selectStore = (0, mapSelectStore_1.useMapSelectStore)();
(0, vue_1.watch)(isDrawing, function (isDrawing) {
    if (isDrawing) {
        translate.value = false;
        selectStore.unitSelectEnabled = false;
        selectStore.featureSelectEnabled = false;
    }
    else {
        selectStore.unitSelectEnabled = true;
        selectStore.featureSelectEnabled = true;
    }
});
(0, vue_1.watch)(isModifying, function (isModifying) {
    if (isModifying) {
        translate.value = false;
    }
});
(0, vue_1.watch)(translate, function (translate) {
    if (translate) {
        cancel();
    }
});
function onFeatureDelete() {
    groupUpdate(function () {
        __spreadArray([], selectedFeatureIds.value.values(), true).forEach(function (featureId) {
            return geo.deleteFeature(featureId);
        });
    }, { label: "batchLayer", value: "dummy" });
}
(0, core_1.onKeyStroke)("Escape", function (event) {
    cancel();
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = FloatingPanel_vue_1.default || FloatingPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "pointer-events-auto flex items-center space-x-0 rounded-md p-1" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "pointer-events-auto flex items-center space-x-0 rounded-md p-1" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground hidden px-2 text-sm font-medium sm:block" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border mr-2 h-5 border-l" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
var __VLS_7 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { title: "Select", active: (!__VLS_ctx.currentDrawType) })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Select", active: (!__VLS_ctx.currentDrawType) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.cancel();
            // @ts-ignore
            [currentDrawType, cancel,];
        } });
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.SelectIcon} */
vue_mdi_1.IconCursorDefaultOutline;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "size-5" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
var __VLS_20 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { title: "Point", active: (__VLS_ctx.currentDrawType === 'Point') })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Point", active: (__VLS_ctx.currentDrawType === 'Point') })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
var __VLS_26 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Point');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_27 = __VLS_23.slots.default;
var __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.PointIcon} */
vue_mdi_1.IconMapMarker;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "size-5" })));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_23;
var __VLS_24;
var __VLS_33 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ 'onClick': {} }, { title: "Line", active: (__VLS_ctx.currentDrawType === 'LineString') })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Line", active: (__VLS_ctx.currentDrawType === 'LineString') })], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38;
var __VLS_39 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('LineString');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_40 = __VLS_36.slots.default;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.LineStringIcon} */
vue_mdi_1.IconVectorLine;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ class: "size-5" })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_42), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_36;
var __VLS_37;
var __VLS_46 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onClick': {} }, { title: "Polygon", active: (__VLS_ctx.currentDrawType === 'Polygon') })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Polygon", active: (__VLS_ctx.currentDrawType === 'Polygon') })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51;
var __VLS_52 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Polygon');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_53 = __VLS_49.slots.default;
var __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.PolygonIcon} */
vue_mdi_1.IconVectorSquare;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ class: "size-5" })));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_49;
var __VLS_50;
var __VLS_59 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ 'onClick': {} }, { title: "Circle", active: (__VLS_ctx.currentDrawType === 'Circle') })));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Circle", active: (__VLS_ctx.currentDrawType === 'Circle') })], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_64;
var __VLS_65 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startDrawing('Circle');
            // @ts-ignore
            [currentDrawType, startDrawing,];
        } });
var __VLS_66 = __VLS_62.slots.default;
var __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.CircleIcon} */
vue_mdi_1.IconVectorCircleVariant;
// @ts-ignore
var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67(__assign({ class: "size-5" })));
var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_68), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_62;
var __VLS_63;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "mx-2 h-5 border-l border-gray-300" }));
/** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_72 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72(__assign({ 'onClick': {} }, { title: "Snap to grid", active: (__VLS_ctx.snap) })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Snap to grid", active: (__VLS_ctx.snap) })], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77;
var __VLS_78 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleSnap();
            // @ts-ignore
            [snap, toggleSnap,];
        } });
var __VLS_79 = __VLS_75.slots.default;
var __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.SnapIcon} */
vue_mdi_1.IconMagnet;
// @ts-ignore
var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80(__assign({ class: "size-5" })));
var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_81), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_75;
var __VLS_76;
var __VLS_85 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85(__assign({ 'onClick': {} }, { title: "Edit", active: (__VLS_ctx.isModifying) })));
var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Edit", active: (__VLS_ctx.isModifying) })], __VLS_functionalComponentArgsRest(__VLS_86), false));
var __VLS_90;
var __VLS_91 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.startModify();
            // @ts-ignore
            [isModifying, startModify,];
        } });
var __VLS_92 = __VLS_88.slots.default;
var __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.EditIcon} */
vue_mdi_1.IconSquareEditOutline;
// @ts-ignore
var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93(__assign({ class: "size-5" })));
var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_94), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_88;
var __VLS_89;
var __VLS_98 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98(__assign({ 'onClick': {} }, { title: "Modify feature history", active: (__VLS_ctx.modifyHistory) })));
var __VLS_100 = __VLS_99.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Modify feature history", active: (__VLS_ctx.modifyHistory) })], __VLS_functionalComponentArgsRest(__VLS_99), false));
var __VLS_103;
var __VLS_104 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleModifyHistory();
            // @ts-ignore
            [modifyHistory, toggleModifyHistory,];
        } });
var __VLS_105 = __VLS_101.slots.default;
var __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.IconClockEdit} */
vue_mdi_1.IconClockEditOutline;
// @ts-ignore
var __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106(__assign({ class: "size-5" })));
var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_107), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_101;
var __VLS_102;
var __VLS_111 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111(__assign({ 'onClick': {} }, { title: "translate", active: (__VLS_ctx.translate) })));
var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "translate", active: (__VLS_ctx.translate) })], __VLS_functionalComponentArgsRest(__VLS_112), false));
var __VLS_116;
var __VLS_117 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleTranslate();
            // @ts-ignore
            [translate, toggleTranslate,];
        } });
var __VLS_118 = __VLS_114.slots.default;
var __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.MoveIcon} */
vue_mdi_1.IconCursorMove;
// @ts-ignore
var __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119(__assign({ class: "size-5" })));
var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_120), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_114;
var __VLS_115;
var __VLS_124 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124(__assign({ 'onClick': {} }, { title: "Delete", disabled: (__VLS_ctx.selectedFeatureIds.size === 0) })));
var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Delete", disabled: (__VLS_ctx.selectedFeatureIds.size === 0) })], __VLS_functionalComponentArgsRest(__VLS_125), false));
var __VLS_129;
var __VLS_130 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onFeatureDelete();
            // @ts-ignore
            [selectedFeatureIds, onFeatureDelete,];
        } });
var __VLS_131 = __VLS_127.slots.default;
var __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.DeleteIcon} */
vue_mdi_1.IconTrashCanOutline;
// @ts-ignore
var __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132(__assign({ class: "size-5" })));
var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_133), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_127;
var __VLS_128;
var __VLS_137 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137(__assign({ 'onClick': {} }, { title: "Toggle toolbar" })));
var __VLS_139 = __VLS_138.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Toggle toolbar" })], __VLS_functionalComponentArgsRest(__VLS_138), false));
var __VLS_142;
var __VLS_143 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.clearToolbar();
            // @ts-ignore
            [store,];
        } });
var __VLS_144 = __VLS_140.slots.default;
var __VLS_145;
/** @ts-ignore @type {typeof __VLS_components.CloseIcon} */
vue_mdi_1.IconClose;
// @ts-ignore
var __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145(__assign({ class: "size-5" })));
var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_146), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_140;
var __VLS_141;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
