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
var OrbatTreeItem_vue_1 = require("./OrbatTreeItem.vue");
var filtering_1 = require("@/composables/filtering");
var props = withDefaults(defineProps(), {
    filterQuery: "",
    locationFilter: false,
});
var emit = defineEmits();
var queryHasChanged = (0, vue_1.ref)(true);
(0, vue_1.watch)(function () { return props.filterQuery; }, function () { return (queryHasChanged.value = true); });
var onUnitAction = function (unit, action) {
    emit("unit-action", unit, action);
};
var filteredUnits = (0, vue_1.computed)(function () {
    var resetOpen = queryHasChanged.value;
    queryHasChanged.value = false;
    return (0, filtering_1.filterUnits)(props.units, props.unitMap, props.filterQuery, props.locationFilter, resetOpen);
});
var __VLS_defaults = {
    filterQuery: "",
    locationFilter: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.filteredUnits)); _i < _a.length; _i++) {
    var _b = _a[_i], orbatItem = _b[0], index = _b[1];
    var __VLS_0 = OrbatTreeItem_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { item: (orbatItem), key: (orbatItem.unit.id), symbolOptions: (__VLS_ctx.symbolOptions), lastInGroup: (index === __VLS_ctx.filteredUnits.length - 1) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { item: (orbatItem), key: (orbatItem.unit.id), symbolOptions: (__VLS_ctx.symbolOptions), lastInGroup: (index === __VLS_ctx.filteredUnits.length - 1) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ unitAction: {} },
        { onUnitAction: (__VLS_ctx.onUnitAction) });
    var __VLS_7 = ({ unitClick: {} },
        { onUnitClick: (function (unit, event) { return __VLS_ctx.emit('unit-click', unit, event); }) });
    var __VLS_3;
    var __VLS_4;
    // @ts-ignore
    [filteredUnits, filteredUnits, symbolOptions, onUnitAction, emit,];
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
