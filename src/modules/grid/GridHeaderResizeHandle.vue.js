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
var props = defineProps();
var emit = defineEmits(["update", "dragging"]);
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
        emit("update", initialWidth + (evt.clientX - startX));
    }
}
var throttledOnPointerMove = (0, core_1.useThrottleFn)(onPointerMove, 10);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign({ onClick: function () { } }, { onPointerdown: (__VLS_ctx.onPointerDown) }), { onPointerup: (__VLS_ctx.onPointerUp) }), { onPointermove: (__VLS_ctx.throttledOnPointerMove) }), { ref: "el", role: "separator" }), { class: "absolute top-0 right-0 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2" }), { class: ({ border: __VLS_ctx.isDragging }) }));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-col-resize']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
// @ts-ignore
[onPointerDown, onPointerUp, throttledOnPointerMove, isDragging,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
