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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var sidc_1 = require("@/symbology/sidc");
var values_1 = require("@/symbology/values");
var TextAmpInput_vue_1 = require("@/modules/scenarioeditor/TextAmpInput.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var selectedStore_1 = require("@/stores/selectedStore");
var button_1 = require("@/components/ui/button");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var constants_ts_1 = require("@/config/constants.ts");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var props = defineProps();
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var _b = activeScenario.unitActions, updateUnit = _b.updateUnit, getCombinedSymbolOptions = _b.getCombinedSymbolOptions, groupUpdate = activeScenario.store.groupUpdate;
var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
var customSymbol = (0, vue_1.computed)(function () {
    if (props.unit.sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        var symbolId = props.unit.sidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE);
        return activeScenario.store.state.customSymbolMap[symbolId];
    }
});
var overrideName = (0, vue_1.ref)(((_a = props.unit.textAmplifiers) === null || _a === void 0 ? void 0 : _a.uniqueDesignation) !== undefined);
var textAmplifiers = (0, vue_1.ref)(__assign({}, (props.unit.textAmplifiers || {})));
(0, vue_1.watch)(overrideName, function (override) {
    if (override) {
        textAmplifiers.value.uniqueDesignation =
            props.unit.shortName || props.unit.name || "";
    }
    else {
        delete textAmplifiers.value.uniqueDesignation;
    }
});
var dimension = (0, vue_1.computed)(function () {
    var sidc = new sidc_1.Sidc(props.unit.sidc);
    return values_1.symbolSetToDimension[sidc.symbolSet] || values_1.Dimension.Unknown;
});
var displaySymbol = (0, vue_1.computed)(function () {
    var sidc = new sidc_1.Sidc(props.unit.sidc);
    sidc.emt = "000";
    sidc.hqtfd = "0";
    if (props.isMultiMode) {
        sidc.mainIcon = "000000";
        sidc.modifierOne = "00";
        sidc.modifierTwo = "00";
    }
    return sidc.toString();
});
var combinedSymbolOptions = (0, vue_1.computed)(function () {
    return __assign(__assign(__assign(__assign({}, getCombinedSymbolOptions(props.unit)), { uniqueDesignation: props.unit.shortName || props.unit.name }), textAmplifiers.value), { outlineWidth: 4 });
});
var landUnitFields = [
    { x: 3, y: 2, field: "G", title: "Staff Comments" },
    { x: 3, y: 3, field: "H", title: "Additional Information" },
    { x: 1, y: 4, field: "T", title: "Unique Designation" },
    { x: 3, y: 4, field: "M", title: "Higher Formation" },
];
var surfaceFields = [
    { x: 3, y: 1, field: "T", title: "Unique Designation" },
    { x: 3, y: 4, field: "G", title: "Staff Comments" },
];
var subSurfaceFields = [
    { x: 3, y: 1, field: "T", title: "Unique Designation" },
    { x: 3, y: 4, field: "G", title: "Staff Comments" },
];
var airFields = [
    { x: 3, y: 1, field: "T", title: "Unique Designation" },
    { x: 3, y: 4, field: "G", title: "Staff Comments" },
];
var textFields = (0, vue_1.computed)(function () {
    if (dimension.value === values_1.Dimension.SeaSurface) {
        return surfaceFields;
    }
    else if (dimension.value === values_1.Dimension.SeaSubsurface) {
        return subSurfaceFields;
    }
    else if (dimension.value === values_1.Dimension.Air) {
        return airFields;
    }
    return landUnitFields;
});
function onSubmit() {
    if (props.isMultiMode && selectedUnitIds.value.size > 1) {
        groupUpdate(function () {
            selectedUnitIds.value.forEach(function (id) {
                updateUnit(id, { textAmplifiers: __assign({}, textAmplifiers.value) });
            });
        });
    }
    else {
        updateUnit(props.unit.id, { textAmplifiers: __assign({}, textAmplifiers.value) });
    }
}
function handleReset() {
    textAmplifiers.value = {};
    overrideName.value = false;
    onSubmit();
}
function setTextAmpValue(field, value) {
    var key = milsymbwrapper_1.textAmpMap[field];
    if (key === undefined)
        return;
    //@ts-ignore
    textAmplifiers.value[key] = value;
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "-mx-4 sm:mx-0" }));
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mx-0']} */ ;
if (!__VLS_ctx.customSymbol) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "my-4 flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p)({});
    var __VLS_0 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.overrideName),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.overrideName),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = __VLS_3.slots.default;
    // @ts-ignore
    [customSymbol, overrideName,];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onSubmit) }));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 grid-rows-5" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-rows-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "col-start-1 row-start-1 h-9" }));
    /** @type {__VLS_StyleScopedClasses['col-start-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-start-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    var _loop_1 = function (x, y, field, placeholder, title) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (field) }, { style: ({ 'grid-row-start': y, 'grid-column-start': x }) }));
        if (field == 'T') {
            var __VLS_6 = TextAmpInput_vue_1.default;
            // @ts-ignore
            var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onUpdate:modelValue': {} }, { placeholder: (field || placeholder), modelValue: (!__VLS_ctx.overrideName
                    ? __VLS_ctx.isMultiMode
                        ? '...'
                        : __VLS_ctx.unit.shortName || __VLS_ctx.unit.name
                    : __VLS_ctx.textAmplifiers.uniqueDesignation), disabled: (__VLS_ctx.isLocked || !__VLS_ctx.overrideName), title: (title) })));
            var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { placeholder: (field || placeholder), modelValue: (!__VLS_ctx.overrideName
                        ? __VLS_ctx.isMultiMode
                            ? '...'
                            : __VLS_ctx.unit.shortName || __VLS_ctx.unit.name
                        : __VLS_ctx.textAmplifiers.uniqueDesignation), disabled: (__VLS_ctx.isLocked || !__VLS_ctx.overrideName), title: (title) })], __VLS_functionalComponentArgsRest(__VLS_7), false));
            var __VLS_11 = void 0;
            var __VLS_12 = ({ 'update:modelValue': {} },
                { 'onUpdate:modelValue': function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!__VLS_ctx.customSymbol))
                            return;
                        if (!(field == 'T'))
                            return;
                        __VLS_ctx.setTextAmpValue(field, $event);
                        // @ts-ignore
                        [overrideName, overrideName, onSubmit, textFields, isMultiMode, unit, unit, textAmplifiers, isLocked, setTextAmpValue,];
                    } });
        }
        else {
            var __VLS_13 = TextAmpInput_vue_1.default;
            // @ts-ignore
            var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ 'onUpdate:modelValue': {} }, { placeholder: (field || placeholder), modelValue: (__VLS_ctx.textAmplifiers[__VLS_ctx.textAmpMap[field]]), disabled: (__VLS_ctx.isLocked), title: (title) })));
            var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { placeholder: (field || placeholder), modelValue: (__VLS_ctx.textAmplifiers[__VLS_ctx.textAmpMap[field]]), disabled: (__VLS_ctx.isLocked), title: (title) })], __VLS_functionalComponentArgsRest(__VLS_14), false));
            var __VLS_18 = void 0;
            var __VLS_19 = ({ 'update:modelValue': {} },
                { 'onUpdate:modelValue': function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!__VLS_ctx.customSymbol))
                            return;
                        if (!!(field == 'T'))
                            return;
                        __VLS_ctx.setTextAmpValue(field, $event);
                        // @ts-ignore
                        [textAmplifiers, isLocked, setTextAmpValue, milsymbwrapper_1.textAmpMap,];
                    } });
        }
        // @ts-ignore
        [];
    };
    var __VLS_9, __VLS_10, __VLS_16, __VLS_17;
    for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.textFields)); _i < _c.length; _i++) {
        var _d = _c[_i][0], x = _d.x, y = _d.y, field = _d.field, placeholder = _d.placeholder, title = _d.title;
        _loop_1(x, y, field, placeholder, title);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-start-2 row-span-3 row-start-2 items-center justify-self-center pt-2" }));
    /** @type {__VLS_StyleScopedClasses['col-start-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-span-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-start-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-self-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    var __VLS_20 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign(__assign({ sidc: (__VLS_ctx.displaySymbol) }, { class: "stroke-muted-foreground" }), { size: (75), modifiers: ({
            frame: true,
            monoColor: 'inherit',
        }) })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign(__assign({ sidc: (__VLS_ctx.displaySymbol) }, { class: "stroke-muted-foreground" }), { size: (75), modifiers: ({
                frame: true,
                monoColor: 'inherit',
            }) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    /** @type {__VLS_StyleScopedClasses['stroke-muted-foreground']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-2 flex items-center justify-end gap-2 border-t pt-2" }));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ 'onClick': {} }, { size: "sm", type: "button", variant: "outline", disabled: (__VLS_ctx.isLocked) })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "sm", type: "button", variant: "outline", disabled: (__VLS_ctx.isLocked) })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = void 0;
    var __VLS_31 = ({ click: {} },
        { onClick: (__VLS_ctx.handleReset) });
    var __VLS_32 = __VLS_28.slots.default;
    // @ts-ignore
    [isLocked, displaySymbol, handleReset,];
    var __VLS_28;
    var __VLS_29;
    var __VLS_33 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        size: "sm",
        variant: "secondary",
        type: "submit",
        disabled: (__VLS_ctx.isLocked),
    }));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
            size: "sm",
            variant: "secondary",
            type: "submit",
            disabled: (__VLS_ctx.isLocked),
        }], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_38 = __VLS_36.slots.default;
    // @ts-ignore
    [isLocked,];
    var __VLS_36;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-4 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-2 text-sm leading-7 font-medium" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 flex justify-center" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_39 = UnitSymbol_vue_1.default;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ sidc: (props.unit.sidc), size: (30), options: (__VLS_ctx.combinedSymbolOptions) }, { class: "w-30" })));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ sidc: (props.unit.sidc), size: (30), options: (__VLS_ctx.combinedSymbolOptions) }, { class: "w-30" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
/** @type {__VLS_StyleScopedClasses['w-30']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
// @ts-ignore
[combinedSymbolOptions,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
