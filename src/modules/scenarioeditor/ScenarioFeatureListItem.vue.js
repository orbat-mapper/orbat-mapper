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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var featureLayerUtils_1 = require("@/modules/scenarioeditor/featureLayerUtils");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var combine_1 = require("@atlaskit/pragmatic-drag-and-drop/combine");
var closest_edge_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var DropIndicator_vue_1 = require("@/components/DropIndicator.vue");
var draggables_1 = require("@/types/draggables");
var props = defineProps();
var emit = defineEmits();
var elRef = (0, vue_1.ref)(null);
var handleRef = (0, vue_1.ref)(null);
var itemState = (0, vue_1.ref)(draggables_1.idle);
var hidden = (0, vue_1.computed)(function () { return props.layer.isHidden || props.feature._hidden; });
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    if (!elRef.value)
        return;
    dndCleanup = (0, combine_1.combine)((0, adapter_1.draggable)({
        element: elRef.value,
        dragHandle: handleRef.value,
        getInitialData: function () { return (0, draggables_1.getScenarioFeatureDragItem)({ feature: props.feature }); },
        onDragStart: function () { return (itemState.value = { type: "dragging" }); },
        onDrop: function () { return (itemState.value = draggables_1.idle); },
    }), (0, adapter_1.dropTargetForElements)({
        element: elRef.value,
        onDragEnter: function (_a) {
            var self = _a.self;
            var closestEdge = (0, closest_edge_1.extractClosestEdge)(self.data);
            itemState.value = { type: "drag-over", closestEdge: closestEdge };
        },
        onDragLeave: function () { return (itemState.value = draggables_1.idle); },
        canDrop: function (_a) {
            var source = _a.source;
            var data = source.data;
            if (!(0, draggables_1.isScenarioFeatureDragItem)(data))
                return false;
            return data.feature !== props.feature;
        },
        getData: function (_a) {
            var input = _a.input, element = _a.element;
            var data = (0, draggables_1.getScenarioFeatureDragItem)({ feature: props.feature });
            return (0, closest_edge_1.attachClosestEdge)(data, {
                input: input,
                element: element,
                allowedEdges: ["top", "bottom"],
            });
        },
        onDrag: function (_a) {
            var self = _a.self;
            var closestEdge = (0, closest_edge_1.extractClosestEdge)(self.data);
            itemState.value = { type: "drag-over", closestEdge: closestEdge };
        },
        onDrop: function () {
            itemState.value = draggables_1.idle;
        },
    }));
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign(__assign(__assign({ ref: "elRef" }, { class: "group hover:bg-accent relative flex items-center justify-between border-l select-none" }), { 'data-feature-id': (__VLS_ctx.feature.id) }), { class: ([
        __VLS_ctx.itemState.type === 'drag-over'
            ? 'bg-muted'
            : __VLS_ctx.selected
                ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
                : 'border-transparent',
        __VLS_ctx.itemState.type === 'dragging' ? 'opacity-20' : '',
    ]) }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ref: "handleRef",
});
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.IconDrag} */
vue_mdi_1.IconDrag;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:opacity-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('feature-click', $event);
        // @ts-ignore
        [feature, itemState, itemState, selected, emit,];
    } }, { onDblclick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('feature-double-click', $event);
        // @ts-ignore
        [emit,];
    } }), { class: "flex flex-auto items-center py-2.5 sm:py-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:py-2']} */ ;
var __VLS_5 = (__VLS_ctx.getGeometryIcon(__VLS_ctx.feature));
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "text-muted-foreground size-5" })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "group-hover:text-accent-foreground text-foreground ml-2 text-left text-sm" }, { class: ({ 'font-bold': __VLS_ctx.active, 'opacity-50': __VLS_ctx.hidden }) }));
/** @type {__VLS_StyleScopedClasses['group-hover:text-accent-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
(__VLS_ctx.feature.meta.name || __VLS_ctx.feature.type || __VLS_ctx.feature.geometry.type);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex items-center" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('toggle-visibility');
        // @ts-ignore
        [feature, feature, feature, feature, emit, featureLayerUtils_1.getGeometryIcon, active, hidden,];
    } }, { type: "button" }), { class: "text-muted-foreground hover:text-foreground mr-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Toggle visibility" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
if (__VLS_ctx.feature.meta.isHidden) {
    var __VLS_10 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
    vue_mdi_1.IconEyeOff;
    // @ts-ignore
    var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ class: "size-5" })));
    var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
}
else {
    var __VLS_15 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconEye} */
    vue_mdi_1.IconEye;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ class: "size-5" })));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
}
if (__VLS_ctx.feature.meta.visibleFromT || __VLS_ctx.feature.meta.visibleUntilT) {
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClockOutline} */
    vue_mdi_1.IconClockOutline;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ class: "text-muted-foreground h-5 w-5" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
var __VLS_25 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.featureMenuItems) }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { items: (__VLS_ctx.featureMenuItems) }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30;
var __VLS_31 = ({ action: {} },
    { onAction: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('feature-action', $event);
            // @ts-ignore
            [feature, feature, feature, emit, featureLayerUtils_1.featureMenuItems,];
        } });
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
var __VLS_28;
var __VLS_29;
if (__VLS_ctx.itemState.type === 'drag-over' && __VLS_ctx.itemState.closestEdge) {
    var __VLS_32 = DropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        edge: (__VLS_ctx.itemState.closestEdge),
        gap: "0px",
    }));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
            edge: (__VLS_ctx.itemState.closestEdge),
            gap: "0px",
        }], __VLS_functionalComponentArgsRest(__VLS_33), false));
}
// @ts-ignore
[itemState, itemState, itemState,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
