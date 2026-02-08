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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
var radio_group_1 = require("@/components/ui/radio-group");
var label_1 = require("@/components/ui/label");
var OpacityInput_vue_1 = require("./OpacityInput.vue");
var vue_1 = require("vue");
var props = defineProps();
var __VLS_emit = defineEmits(["update:layerOpacity"]);
var selected = defineModel();
var nsettings = (0, vue_1.computed)(function () { return __spreadArray([], props.settings, true); });
var selectedId = (0, vue_1.computed)({
    get: function () { var _a, _b; return (_b = (_a = selected.value) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "__NULL__"; },
    set: function (id) {
        if (id === "__NULL__") {
            selected.value = props.settings.find(function (s) { return s.id === null; });
        }
        else {
            selected.value = props.settings.find(function (s) { return s.id === id; });
        }
    },
});
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
radio_group_1.RadioGroup;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.selectedId) }, { class: "block" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.selectedId) }, { class: "block" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['block']} */ ;
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
label_1.Label;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "sr-only" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "sr-only" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_12 = __VLS_10.slots.default;
// @ts-ignore
[selectedId,];
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "divide-border border-border bg-card divide-y overflow-hidden rounded-md border" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
var _loop_1 = function (setting) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (setting.title) }, { class: "hover:bg-muted/50 flex items-start gap-3 p-4 transition-colors" }));
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ value: ((_a = setting.id) !== null && _a !== void 0 ? _a : '__NULL__'), id: ("layer-".concat((_b = setting.id) !== null && _b !== void 0 ? _b : 'null')) }, { class: "mt-1" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ value: ((_c = setting.id) !== null && _c !== void 0 ? _c : '__NULL__'), id: ("layer-".concat((_d = setting.id) !== null && _d !== void 0 ? _d : 'null')) }, { class: "mt-1" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-w-0 flex-auto flex-col text-sm" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between font-medium" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    var __VLS_18 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ for: ("layer-".concat((_e = setting.id) !== null && _e !== void 0 ? _e : 'null')) }, { class: "flex-auto truncate font-medium" })));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ for: ("layer-".concat((_f = setting.id) !== null && _f !== void 0 ? _f : 'null')) }, { class: "flex-auto truncate font-medium" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    var __VLS_23 = __VLS_21.slots.default;
    (setting.title);
    if (__VLS_ctx.defaultLayerName && setting.id === __VLS_ctx.defaultLayerName) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "border-border/60 bg-muted ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium" }));
        /** @type {__VLS_StyleScopedClasses['border-border/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    }
    // @ts-ignore
    [nsettings, defaultLayerName, defaultLayerName,];
    if (setting.title === 'None') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({});
    }
    else {
        var __VLS_24 = OpacityInput_vue_1.default;
        // @ts-ignore
        var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (setting.opacity) }), { class: "text-foreground shrink-0" })));
        var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (setting.opacity) }), { class: "text-foreground shrink-0" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
        var __VLS_29 = void 0;
        var __VLS_30 = ({ 'update:modelValue': {} },
            { 'onUpdate:modelValue': function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(setting.title === 'None'))
                        return;
                    __VLS_ctx.$emit('update:layerOpacity', setting, $event);
                    // @ts-ignore
                    [$emit,];
                } });
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    }
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ for: ("layer-".concat((_g = setting.id) !== null && _g !== void 0 ? _g : 'null')) }, { class: "text-muted-foreground block text-sm font-normal" })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ for: ("layer-".concat((_h = setting.id) !== null && _h !== void 0 ? _h : 'null')) }, { class: "text-muted-foreground block text-sm font-normal" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    var __VLS_36 = __VLS_34.slots.default;
    (setting.description || "");
    // @ts-ignore
    [];
    // @ts-ignore
    [];
};
var __VLS_21, __VLS_27, __VLS_28, __VLS_34;
for (var _i = 0, _j = __VLS_vFor((__VLS_ctx.nsettings)); _i < _j.length; _i++) {
    var setting = _j[_i][0];
    _loop_1(setting);
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
