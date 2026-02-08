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
var vue_1 = require("vue");
var solid_1 = require("@heroicons/vue/20/solid");
var orbatchart_1 = require("./orbatchart");
var BaseToolbar_vue_1 = require("@/components/BaseToolbar.vue");
var ToolbarButton_vue_1 = require("@/components/ToolbarButton.vue");
var props = withDefaults(defineProps(), {
    debug: false,
    interactive: false,
    highlightedLevels: function () { return []; },
    width: 600,
    height: 600,
    enablePanZoom: false,
    hideToolbar: false,
});
var emit = defineEmits(["unitclick", "levelclick", "branchclick"]);
var chartRootElement = (0, vue_1.ref)();
var orbatChart;
function onClick(unit) {
    emit("unitclick", unit);
}
function onLevelClick(levelNumber) {
    emit("levelclick", levelNumber);
}
function onBranchClick(parentId, levelNumber) {
    emit("branchclick", parentId, levelNumber);
}
function handleLevelHighlight(value) {
    orbatChart.highlightLevels(__spreadArray([], value, true));
}
var visible = (0, vue_1.ref)(true);
(0, vue_1.watchEffect)(function () {
    if (!chartRootElement.value || !props.unit)
        return;
    var panScaleCopy;
    if (orbatChart) {
        panScaleCopy = orbatChart.getPanScale();
        orbatChart.cleanup();
    }
    orbatChart = new orbatchart_1.OrbatChart(props.unit, __assign(__assign({}, props.options), { symbolGenerator: props.symbolGenerator, debug: props.debug, onClick: onClick, onLevelClick: onLevelClick, onBranchClick: onBranchClick }), props.specificOptions || {});
    orbatChart.toSVG(chartRootElement.value, {
        width: props.width,
        height: props.height,
        elementId: props.chartId,
        enablePanZoom: props.enablePanZoom,
    });
    if (props.interactive)
        orbatChart.makeInteractive();
    if (panScaleCopy) {
        orbatChart.setPanScale({ x: panScaleCopy.pan.x, y: panScaleCopy.pan.y }, panScaleCopy.scale);
    }
});
(0, vue_1.onBeforeUnmount)(function () {
    orbatChart === null || orbatChart === void 0 ? void 0 : orbatChart.cleanup();
});
function resetZoom() {
    orbatChart.resetZoom();
}
var __VLS_defaults = {
    debug: false,
    interactive: false,
    highlightedLevels: function () { return []; },
    width: 600,
    height: 600,
    enablePanZoom: false,
    hideToolbar: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative h-full w-full" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign(__assign({ ref: "chartRootElement" }, { class: "animate h-full w-full" }), { class: (__VLS_ctx.visible ? 'opacity-100' : 'opacity-0') }));
/** @type {__VLS_StyleScopedClasses['animate']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
if (__VLS_ctx.enablePanZoom && !__VLS_ctx.hideToolbar) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "absolute bottom-4 left-4 print:hidden" }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
    var __VLS_0 = BaseToolbar_vue_1.default || BaseToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_5 = __VLS_3.slots.default;
    var __VLS_6 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { start: true })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { start: true })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = void 0;
    var __VLS_12 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.enablePanZoom && !__VLS_ctx.hideToolbar))
                    return;
                __VLS_ctx.orbatChart.zoomIn();
                // @ts-ignore
                [visible, enablePanZoom, hideToolbar, orbatChart,];
            } });
    var __VLS_13 = __VLS_9.slots.default;
    var __VLS_14 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MagnifyingGlassPlusIcon} */
    solid_1.MagnifyingGlassPlusIcon;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "h-5 w-5" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_9;
    var __VLS_10;
    var __VLS_19 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ 'onClick': {} })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = void 0;
    var __VLS_25 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.enablePanZoom && !__VLS_ctx.hideToolbar))
                    return;
                __VLS_ctx.orbatChart.zoomOut();
                // @ts-ignore
                [orbatChart,];
            } });
    var __VLS_26 = __VLS_22.slots.default;
    var __VLS_27 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MagnifyingGlassMinusIcon} */
    solid_1.MagnifyingGlassMinusIcon;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ class: "h-5 w-5" })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_22;
    var __VLS_23;
    var __VLS_32 = ToolbarButton_vue_1.default || ToolbarButton_vue_1.default;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { end: true })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { end: true })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    var __VLS_37 = void 0;
    var __VLS_38 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.enablePanZoom && !__VLS_ctx.hideToolbar))
                    return;
                __VLS_ctx.resetZoom();
                // @ts-ignore
                [resetZoom,];
            } });
    var __VLS_39 = __VLS_35.slots.default;
    var __VLS_40 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ArrowsPointingOutIcon} */
    solid_1.ArrowsPointingOutIcon;
    // @ts-ignore
    var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign({ class: "h-5 w-5" })));
    var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_35;
    var __VLS_36;
    // @ts-ignore
    [];
    var __VLS_3;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
