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
var utils_1 = require("@/utils");
var props = withDefaults(defineProps(), { horizontal: false, left: false });
var emit = defineEmits(["resizestart", "resizing", "resizeend"]);
var dragging = (0, vue_1.ref)(false);
var startValue = (0, vue_1.ref)(0);
function onButtonDown(event) {
    event.preventDefault();
    onDragStart(event);
    if (utils_1.isClient) {
        document.addEventListener("mousemove", onDragging);
        document.addEventListener("touchmove", onDragging);
        document.addEventListener("mouseup", onDragEnd);
        document.addEventListener("touchend", onDragEnd);
        document.addEventListener("contextmenu", onDragEnd);
    }
}
function onDragStart(event) {
    dragging.value = true;
    if (props.parentRef) {
        startValue.value = props.parentRef.getBoundingClientRect().width;
        emit("resizestart", startValue.value);
    }
    if (event.type === "touchstart") {
        startValue.value = event.touches[0].clientX;
    }
    else {
        startValue.value = event.clientX;
    }
}
function onDragging(event) {
    event.preventDefault();
    event.stopPropagation();
    if (dragging.value) {
        var currentValue = 0;
        if (event.type === "touchmove") {
            currentValue = event.touches[0].clientX;
        }
        else {
            currentValue = event.clientX;
        }
        var diff = currentValue - startValue.value;
        emit("resizing", diff);
    }
}
function onDragEnd(event) {
    dragging.value = false;
    emit("resizeend");
    if (utils_1.isClient) {
        document.removeEventListener("mousemove", onDragging);
        document.removeEventListener("touchmove", onDragging);
        document.removeEventListener("mouseup", onDragEnd);
        document.removeEventListener("touchend", onDragEnd);
        document.removeEventListener("contextmenu", onDragEnd);
    }
}
var __VLS_defaults = { horizontal: false, left: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign({ onMousedown: (__VLS_ctx.onButtonDown) }, { onTouchstart: (__VLS_ctx.onButtonDown) }), { class: "bg-muted absolute flex items-center justify-center border hover:border-red-900 hover:bg-red-900" }), { class: ([
        __VLS_ctx.horizontal
            ? 'inset-x-0 bottom-0 h-1 cursor-row-resize'
            : 'inset-y-0 w-1 cursor-col-resize',
        !__VLS_ctx.horizontal && __VLS_ctx.left ? 'left-0' : '',
        !__VLS_ctx.horizontal && !__VLS_ctx.left ? 'right-0' : '',
    ]) }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-900']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-900']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ class: "bg-background z-10 flex h-8 flex-none items-center justify-center rounded shadow-sm" }, { class: ({ 'rotate-90 transform': __VLS_ctx.horizontal }) }), { style: {} }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign(__assign({ viewBox: "0 0 14 24", fill: "none", 'stroke-width': "2", stroke: "currentColor" }, { class: "h-3 flex-none text-red-700" }), { style: {} }));
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path, __VLS_intrinsics.path)({
    d: "M 1 0 V 24 M 7 0 V 24 M 13 0 V 24",
});
// @ts-ignore
[onButtonDown, onButtonDown, horizontal, horizontal, horizontal, horizontal, left, left,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
