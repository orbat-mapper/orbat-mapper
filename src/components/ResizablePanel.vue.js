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
var DragHandle_vue_1 = require("@/components/DragHandle.vue");
var props = withDefaults(defineProps(), { left: false });
var emit = defineEmits(["resizeend"]);
var panelRef = (0, vue_1.ref)();
var panelWidth = defineModel("width", { required: true });
var initialWidth = (0, vue_1.ref)(panelWidth.value);
var __VLS_modelEmit;
var __VLS_defaults = { left: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)(__assign(__assign({ class: "bg-muted/50 relative flex shrink-0 flex-col border-r-2" }, { ref: "panelRef" }), { style: ({ width: __VLS_ctx.panelWidth + 'px' }) }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r-2']} */ ;
var __VLS_0 = {};
var __VLS_2 = DragHandle_vue_1.default;
// @ts-ignore
var __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2(__assign(__assign(__assign({ 'onResizestart': {} }, { 'onResizing': {} }), { 'onResizeend': {} }), { parentRef: (__VLS_ctx.panelRef), left: (__VLS_ctx.left) })));
var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onResizestart': {} }, { 'onResizing': {} }), { 'onResizeend': {} }), { parentRef: (__VLS_ctx.panelRef), left: (__VLS_ctx.left) })], __VLS_functionalComponentArgsRest(__VLS_3), false));
var __VLS_7;
var __VLS_8 = ({ resizestart: {} },
    { onResizestart: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.initialWidth = $event;
            // @ts-ignore
            [panelWidth, panelRef, left, initialWidth,];
        } });
var __VLS_9 = ({ resizing: {} },
    { onResizing: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.panelWidth = props.left ? __VLS_ctx.initialWidth - $event : __VLS_ctx.initialWidth + $event;
            // @ts-ignore
            [panelWidth, initialWidth, initialWidth,];
        } });
var __VLS_10 = ({ resizeend: {} },
    { onResizeend: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('resizeend');
            // @ts-ignore
            [emit,];
        } });
var __VLS_5;
var __VLS_6;
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
