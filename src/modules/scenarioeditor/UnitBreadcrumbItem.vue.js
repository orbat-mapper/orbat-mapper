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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var props = defineProps();
var _d = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), state = _d.store.state, isUnitLocked = _d.unitActions.isUnitLocked, getUnitById = _d.helpers.getUnitById;
var dragItemRef = (0, vue_1.ref)(null);
var isDragged = (0, vue_1.ref)(false);
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    if (!dragItemRef.value || !props.item.id)
        return;
    var unit = getUnitById(props.item.id);
    if (!unit) {
        return;
    }
    dndCleanup = (0, adapter_1.draggable)({
        element: dragItemRef.value,
        canDrag: function () { return !isUnitLocked(unit.id); },
        getInitialData: function () { return (0, draggables_1.getUnitDragItem)({ unit: unit }, "breadcrumbs"); },
        onDragStart: function () { return (isDragged.value = true); },
        onDrop: function () { return (isDragged.value = false); },
    });
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-7 items-center overflow-clip" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-clip']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ ref: "dragItemRef" }, { class: "relative flex shrink-0 cursor-move" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
if (__VLS_ctx.item.sidc) {
    var __VLS_0 = UnitSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ sidc: (__VLS_ctx.item.sidc), options: ((_a = __VLS_ctx.item.symbolOptions) !== null && _a !== void 0 ? _a : {}), modifiers: ({ outlineWidth: 8 }), size: (15) }, { class: "w-7" }), { class: ({ 'opacity-20': __VLS_ctx.isDragged }) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ sidc: (__VLS_ctx.item.sidc), options: ((_b = __VLS_ctx.item.symbolOptions) !== null && _b !== void 0 ? _b : {}), modifiers: ({ outlineWidth: 8 }), size: (15) }, { class: "w-7" }), { class: ({ 'opacity-20': __VLS_ctx.isDragged }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-20']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-1 select-none" }, { class: ([
        ((_c = __VLS_ctx.item.symbolOptions) === null || _c === void 0 ? void 0 : _c.reinforcedReduced) ? 'ml-2' : '',
        __VLS_ctx.item.location ? 'text-accent-foreground underline' : '',
    ]) }));
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
(__VLS_ctx.item.name);
// @ts-ignore
[item, item, item, item, item, item, isDragged,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
