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
var tabs_1 = require("@/components/ui/tabs");
var lucide_vue_next_1 = require("lucide-vue-next");
var helpers_1 = require("@turf/helpers");
var vue_1 = require("vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var core_1 = require("@vueuse/core");
var Vector_1 = require("ol/layer/Vector");
var Vector_2 = require("ol/source/Vector");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var transformStore_1 = require("@/stores/transformStore");
var pinia_1 = require("pinia");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var transformations_ts_1 = require("@/geo/transformations.ts");
var TransformForm_vue_1 = require("@/modules/scenarioeditor/TransformForm.vue");
var button_1 = require("@/components/ui/button");
var ScenarioFeatureSelect_vue_1 = require("@/components/ScenarioFeatureSelect.vue");
var label_1 = require("@/components/ui/label");
var timeFormatStore_ts_1 = require("@/stores/timeFormatStore.ts");
var props = withDefaults(defineProps(), { unitMode: false });
var isUnitMode = props.unitMode;
var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var activeLayerId = (0, utils_1.injectStrict)(injects_1.activeLayerKey);
var olMapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var fmt = (0, timeFormatStore_ts_1.useTimeFormatStore)();
var formattedTime = (0, vue_1.computed)(function () {
    return fmt.scenarioFormatter.format(+scn.time.scenarioTime.value);
});
var _a = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _a.selectedFeatureIds, selectedUnitIds = _a.selectedUnitIds;
var selectedItems = (0, vue_1.computed)(function () {
    if (props.unitMode) {
        return Array.from(selectedUnitIds.value).map(function (id) { return scn.helpers.getUnitById(id); });
    }
    else {
        return Array.from(selectedFeatureIds.value).map(function (id) { var _a; return (_a = scn.geo.getFeatureById(id)) === null || _a === void 0 ? void 0 : _a.feature; });
    }
});
var isMultiMode = (0, vue_1.computed)(function () { return selectedFeatureIds.value.size > 1; });
var _b = (0, pinia_1.storeToRefs)((0, transformStore_1.useTransformSettingsStore)()), showPreview = _b.showPreview, transformations = _b.transformations, updateActiveFeature = _b.updateActiveFeature, updateAtTime = _b.updateAtTime;
var toggleRedraw = (0, vue_1.ref)(true);
var addActiveLayer = (0, vue_1.ref)(activeLayerId.value);
var previewLayer = new Vector_1.default({
    source: new Vector_2.default({}),
    style: {
        "stroke-color": "red",
        "stroke-width": 3,
        "stroke-line-dash": [10, 10],
        "fill-color": "rgba(188,35,65,0.2)",
        "circle-radius": 5,
        "circle-fill-color": "red",
        "circle-stroke-color": "red",
    },
});
olMapRef.value.addLayer(previewLayer);
var calculatePreview = (0, core_1.useDebounceFn)(function (features, ops) {
    var geometry = isUnitMode
        ? (0, transformations_ts_1.doUnitTransformations)(features, ops)
        : (0, transformations_ts_1.doScenarioFeatureTransformation)(features, ops);
    (0, openlayersHelpers_1.drawGeoJsonLayer)(previewLayer, geometry);
}, 200);
function createScenarioFeatureFromGeoJSON(feature, layerId) {
    return {
        type: "Feature",
        id: (0, utils_1.nanoid)(),
        properties: feature.properties,
        geometry: feature.geometry,
        meta: { type: feature.geometry.type, name: "New Feature" },
        style: {},
        _pid: layerId,
    };
}
if (!props.unitMode) {
    (0, vue_1.watch)([
        function () { var _a; return (_a = selectedItems.value[0]) === null || _a === void 0 ? void 0 : _a.geometry; },
        function () { var _a, _b; return (_b = (_a = selectedItems.value[0]) === null || _a === void 0 ? void 0 : _a._state) === null || _b === void 0 ? void 0 : _b.geometry; },
    ], function () {
        toggleRedraw.value = !toggleRedraw.value;
    }, { deep: true });
}
(0, vue_1.watch)([
    transformations,
    toggleRedraw,
    showPreview,
    function () { return scn.store.state.unitStateCounter; },
    function () { return scn.store.state.currentTime; },
], function () {
    var _a;
    if (showPreview.value && transformations.value) {
        calculatePreview(selectedItems.value, transformations.value.filter(function (v) { return !!v; }));
    }
    else {
        (_a = previewLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    }
}, { deep: true });
function onSubmit(updateMode) {
    var _a;
    if (updateMode === void 0) { updateMode = false; }
    if (selectedItems.value.length === 0)
        return;
    var activeFeature = selectedItems.value[0];
    var filteredTrans = transformations.value.filter(function (v) { return !!v; });
    if (filteredTrans.length === 0)
        return;
    var transformedFeature = isUnitMode
        ? (0, transformations_ts_1.doUnitTransformations)(selectedItems.value, filteredTrans)
        : (0, transformations_ts_1.doScenarioFeatureTransformation)(selectedItems.value, filteredTrans);
    if (!transformedFeature)
        return;
    if (transformedFeature.type === "FeatureCollection") {
        transformedFeature = (0, helpers_1.geometryCollection)(transformedFeature.features.map(function (f) { return f.geometry; }));
    }
    var scenarioFeature = createScenarioFeatureFromGeoJSON(transformedFeature, -1);
    if (updateMode && updateActiveFeature.value) {
        if (updateAtTime.value) {
            scn.geo.addFeatureStateGeometry(updateActiveFeature.value, scenarioFeature.geometry);
        }
        else {
            scn.geo.updateFeature(updateActiveFeature.value, {
                geometry: scenarioFeature.geometry,
            });
        }
    }
    else {
        var layerId = addActiveLayer.value;
        var activeFeatureName = isUnitMode
            ? activeFeature.name
            : activeFeature.meta.name;
        var featureName = isMultiMode.value ? "FeatureCollection" : activeFeatureName;
        scenarioFeature.meta.name = "".concat(featureName, " (").concat(filteredTrans[0].transform, ")");
        scn.geo.addFeature(scenarioFeature, layerId);
    }
    (_a = previewLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
}
(0, vue_1.onUnmounted)(function () {
    var _a;
    (_a = previewLayer.getSource()) === null || _a === void 0 ? void 0 : _a.clear();
    olMapRef.value.removeLayer(previewLayer);
});
function addTransformation() {
    transformations.value.push((0, transformations_ts_1.createDefaultTransformationOperation)());
}
function deleteTransformation(index) {
    transformations.value.splice(index, 1);
}
var __VLS_defaults = { unitMode: false };
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.selectedItems.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-2" }));
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-1" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    var _loop_1 = function (op, i) {
        var __VLS_0 = TransformForm_vue_1.default;
        // @ts-ignore
        var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onDelete': {} }, { key: (op.id), modelValue: (__VLS_ctx.transformations[i]), unitMode: __VLS_ctx.unitMode })));
        var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onDelete': {} }, { key: (op.id), modelValue: (__VLS_ctx.transformations[i]), unitMode: __VLS_ctx.unitMode })], __VLS_functionalComponentArgsRest(__VLS_1), false));
        var __VLS_5 = void 0;
        var __VLS_6 = ({ delete: {} },
            { onDelete: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.selectedItems.length))
                        return;
                    __VLS_ctx.deleteTransformation(i);
                    // @ts-ignore
                    [selectedItems, transformations, transformations, unitMode, deleteTransformation,];
                } });
        // @ts-ignore
        [];
    };
    var __VLS_3, __VLS_4;
    for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.transformations)); _i < _c.length; _i++) {
        var _d = _c[_i], op = _d[0], i = _d[1];
        _loop_1(op, i);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex w-full items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    var __VLS_12 = void 0;
    var __VLS_13 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.selectedItems.length))
                    return;
                __VLS_ctx.addTransformation();
                // @ts-ignore
                [addTransformation,];
            } });
    var __VLS_14 = __VLS_10.slots.default;
    var __VLS_15 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.PlusIcon} */
    lucide_vue_next_1.PlusIcon;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_16), false));
    // @ts-ignore
    [];
    var __VLS_10;
    var __VLS_11;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    var __VLS_20 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ modelValue: (__VLS_ctx.showPreview), label: "Show preview" }, { class: "" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.showPreview), label: "Show preview" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
    tabs_1.Tabs;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ defaultValue: "add" }, { class: "border-border mt-4 border-t pt-4" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ defaultValue: "add" }, { class: "border-border mt-4 border-t pt-4" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    var __VLS_30 = __VLS_28.slots.default;
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
    tabs_1.TabsList;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ class: "w-full" })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_36 = __VLS_34.slots.default;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        value: "add",
    }));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
            value: "add",
        }], __VLS_functionalComponentArgsRest(__VLS_38), false));
    var __VLS_42 = __VLS_40.slots.default;
    // @ts-ignore
    [showPreview,];
    var __VLS_40;
    var __VLS_43 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        value: "update",
    }));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
            value: "update",
        }], __VLS_functionalComponentArgsRest(__VLS_44), false));
    var __VLS_48 = __VLS_46.slots.default;
    // @ts-ignore
    [];
    var __VLS_46;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_49 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        value: "add",
    }));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{
            value: "add",
        }], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_54 = __VLS_52.slots.default;
    var __VLS_55 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55(__assign({ class: "mt-2 pb-1.5" })));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ class: "mt-2 pb-1.5" })], __VLS_functionalComponentArgsRest(__VLS_56), false));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1.5']} */ ;
    var __VLS_60 = __VLS_58.slots.default;
    // @ts-ignore
    [];
    var __VLS_58;
    var __VLS_61 = ScenarioFeatureSelect_vue_1.default;
    // @ts-ignore
    var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign({ modelValue: (__VLS_ctx.addActiveLayer), layerMode: true }, { class: "" })));
    var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.addActiveLayer), layerMode: true }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_62), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex items-center justify-end" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    var __VLS_66 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ 'onClick': {} }, { type: "button", primary: true, small: true })));
    var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", primary: true, small: true })], __VLS_functionalComponentArgsRest(__VLS_67), false));
    var __VLS_71 = void 0;
    var __VLS_72 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.selectedItems.length))
                    return;
                __VLS_ctx.onSubmit(false);
                // @ts-ignore
                [addActiveLayer, onSubmit,];
            } });
    var __VLS_73 = __VLS_69.slots.default;
    // @ts-ignore
    [];
    var __VLS_69;
    var __VLS_70;
    // @ts-ignore
    [];
    var __VLS_52;
    var __VLS_74 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        value: "update",
    }));
    var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([{
            value: "update",
        }], __VLS_functionalComponentArgsRest(__VLS_75), false));
    var __VLS_79 = __VLS_77.slots.default;
    var __VLS_80 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80(__assign({ class: "mt-2 pb-1.5" })));
    var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([__assign({ class: "mt-2 pb-1.5" })], __VLS_functionalComponentArgsRest(__VLS_81), false));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1.5']} */ ;
    var __VLS_85 = __VLS_83.slots.default;
    // @ts-ignore
    [];
    var __VLS_83;
    var __VLS_86 = ScenarioFeatureSelect_vue_1.default;
    // @ts-ignore
    var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
        modelValue: (__VLS_ctx.updateActiveFeature),
    }));
    var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.updateActiveFeature),
        }], __VLS_functionalComponentArgsRest(__VLS_87), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_91 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        modelValue: (__VLS_ctx.updateAtTime),
        label: ("Update geometry at ".concat(__VLS_ctx.formattedTime)),
        description: "",
    }));
    var __VLS_93 = __VLS_92.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.updateAtTime),
            label: ("Update geometry at ".concat(__VLS_ctx.formattedTime)),
            description: "",
        }], __VLS_functionalComponentArgsRest(__VLS_92), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex items-center justify-end" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    var __VLS_96 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96(__assign({ 'onClick': {} }, { type: "button", primary: true, small: true, disabled: (!__VLS_ctx.updateActiveFeature) })));
    var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", primary: true, small: true, disabled: (!__VLS_ctx.updateActiveFeature) })], __VLS_functionalComponentArgsRest(__VLS_97), false));
    var __VLS_101 = void 0;
    var __VLS_102 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.selectedItems.length))
                    return;
                __VLS_ctx.onSubmit(true);
                // @ts-ignore
                [onSubmit, updateActiveFeature, updateActiveFeature, updateAtTime, formattedTime,];
            } });
    var __VLS_103 = __VLS_99.slots.default;
    // @ts-ignore
    [];
    var __VLS_99;
    var __VLS_100;
    // @ts-ignore
    [];
    var __VLS_77;
    // @ts-ignore
    [];
    var __VLS_28;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-center text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
