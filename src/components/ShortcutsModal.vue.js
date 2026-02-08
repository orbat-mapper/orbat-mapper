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
var keyboardShortcuts_1 = require("@/components/keyboardShortcuts");
var vue_1 = require("vue");
var vue_router_1 = require("vue-router");
var names_1 = require("@/router/names");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var kbd_1 = require("@/components/ui/kbd");
var route = (0, vue_router_1.useRoute)();
var open = defineModel({ default: false });
var shortcuts = (0, vue_1.computed)(function () {
    if (route.name === names_1.OLD_MAP_ROUTE || route.name === names_1.MAP_EDIT_MODE_ROUTE)
        return keyboardShortcuts_1.mapEditModeShortcuts;
    if (route.name === names_1.GRID_EDIT_ROUTE)
        return keyboardShortcuts_1.gridEditModeShortcuts;
    return keyboardShortcuts_1.defaultShortcuts;
});
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = NewSimpleModal_vue_1.default || NewSimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.open),
    dialogTitle: "Keyboard shortcuts",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.open),
        dialogTitle: "Keyboard shortcuts",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.shortcuts)); _i < _a.length; _i++) {
    var category = _a[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "border-b-2 pb-1 text-base font-medium" }));
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (category.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "divide-y text-sm" }));
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    for (var _b = 0, _c = __VLS_vFor((category.shortcuts)); _b < _c.length; _b++) {
        var entry = _c[_b][0];
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "flex items-center justify-between py-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (entry.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "divide-muted-foreground/50 flex divide-x-2" }));
        /** @type {__VLS_StyleScopedClasses['divide-muted-foreground/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-x-2']} */ ;
        for (var _d = 0, _e = __VLS_vFor((entry.shortcut)); _d < _e.length; _d++) {
            var i = _e[_d][0];
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "flex gap-0.5 px-2 py-0.5" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            for (var _f = 0, _g = __VLS_vFor((i)); _f < _g.length; _f++) {
                var s = _g[_f][0];
                var __VLS_7 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Kbd | typeof __VLS_components.Kbd} */
                kbd_1.Kbd;
                // @ts-ignore
                var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
                var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_8), false));
                var __VLS_12 = __VLS_10.slots.default;
                (s);
                // @ts-ignore
                [open, shortcuts,];
                var __VLS_10;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
