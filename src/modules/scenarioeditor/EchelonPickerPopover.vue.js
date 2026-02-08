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
var PanelSymbolButton_vue_1 = require("@/components/PanelSymbolButton.vue");
var popover_1 = require("@/components/ui/popover");
var vue_1 = require("vue");
var mainToolbarData_1 = require("@/composables/mainToolbarData");
var props = defineProps();
var isOpen = (0, vue_1.ref)(false);
var _a = (0, mainToolbarData_1.useToolbarUnitSymbolData)(), echelonSidc = _a.echelonSidc, emtItems = _a.emtItems;
var onSelect = function (sidc) {
    props.selectEchelon(sidc);
    isOpen.value = false;
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
popover_1.Popover;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.isOpen),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.isOpen),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.PopoverTrigger | typeof __VLS_components.PopoverTrigger} */
popover_1.PopoverTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    asChild: true,
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13 = PanelSymbolButton_vue_1.default;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    size: (20),
    sidc: (__VLS_ctx.echelonSidc || ''),
    symbolOptions: (__VLS_ctx.symbolOptions),
    title: "Select echelon",
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        size: (20),
        sidc: (__VLS_ctx.echelonSidc || ''),
        symbolOptions: (__VLS_ctx.symbolOptions),
        title: "Select echelon",
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
// @ts-ignore
[isOpen, echelonSidc, symbolOptions,];
var __VLS_10;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "grid grid-cols-5 justify-items-center gap-2 p-2" }, { align: "center", side: "top", sideOffset: (10) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "grid grid-cols-5 justify-items-center gap-2 p-2" }, { align: "center", side: "top", sideOffset: (10) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-5']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
var __VLS_23 = __VLS_21.slots.default;
var _loop_1 = function (sidc, text) {
    var __VLS_24 = PanelSymbolButton_vue_1.default;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign(__assign({ 'onClick': {} }, { class: "self-end" }), { key: (sidc), sidc: (sidc), title: (text), symbolOptions: (__VLS_ctx.symbolOptions) })));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { class: "self-end" }), { key: (sidc), sidc: (sidc), title: (text), symbolOptions: (__VLS_ctx.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_29 = void 0;
    var __VLS_30 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onSelect(sidc);
                // @ts-ignore
                [symbolOptions, emtItems, onSelect,];
            } });
    /** @type {__VLS_StyleScopedClasses['self-end']} */ ;
    // @ts-ignore
    [];
};
var __VLS_27, __VLS_28;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.emtItems)); _i < _b.length; _i++) {
    var _c = _b[_i][0], sidc = _c.sidc, text = _c.text;
    _loop_1(sidc, text);
}
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
