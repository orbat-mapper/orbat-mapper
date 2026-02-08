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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var props = withDefaults(defineProps(), { left: false });
var emit = defineEmits(["update", "dragging", "reset"]);
var isDragging = (0, vue_1.ref)(false);
var initialWidth = 0;
var startX = 0;
var el = (0, vue_1.ref)();
function onPointerDown(evt) {
    var e = (0, vue_1.unref)(el);
    initialWidth = props.width;
    startX = evt.clientX;
    e.setPointerCapture(evt.pointerId);
    isDragging.value = true;
    emit("dragging", isDragging.value);
}
function onPointerUp(evt) {
    isDragging.value = false;
    emit("dragging", isDragging.value);
}
function onPointerMove(evt) {
    if (isDragging.value) {
        emit("update", props.left
            ? initialWidth - (evt.clientX - startX)
            : initialWidth + (evt.clientX - startX));
    }
}
function resetWidth() {
    emit("reset");
}
var throttledOnPointerMove = (0, core_1.useThrottleFn)(onPointerMove, 10);
var __VLS_defaults = { left: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onDblclick: (__VLS_ctx.resetWidth) }, { onPointerdown: (__VLS_ctx.onPointerDown) }), { onPointerup: (__VLS_ctx.onPointerUp) }), { onPointermove: (__VLS_ctx.throttledOnPointerMove) }), { ref: "el", role: "separator" }), { class: "pointer-none:bg-army2 pointer-fine:hover:bg-army2 absolute top-0 bottom-0 z-30 w-1.5 cursor-col-resize touch-none pointer-none:w-3" }), { class: (__VLS_ctx.left ? 'left-0' : 'right-0') }), { type: "button" }));
/** @type {__VLS_StyleScopedClasses['pointer-none:bg-army2']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-fine:hover:bg-army2']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-col-resize']} */ ;
/** @type {__VLS_StyleScopedClasses['touch-none']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-none:w-3']} */ ;
// @ts-ignore
[resetWidth, onPointerDown, onPointerUp, throttledOnPointerMove, left,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
