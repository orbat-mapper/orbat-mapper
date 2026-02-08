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
var emit = defineEmits(["update:modelValue", "loaded"]);
var dropZoneRef = (0, vue_1.ref)();
var isOverDropZone = (0, core_1.useDropZone)(dropZoneRef, onDrop).isOverDropZone;
var isError = (0, vue_1.ref)(false);
function readFile(file) {
    var reader = new FileReader();
    reader.onload = function (evt) {
        var _a;
        var content = (_a = evt === null || evt === void 0 ? void 0 : evt.target) === null || _a === void 0 ? void 0 : _a.result;
        try {
            var scenarioData = JSON.parse(content);
            if ((scenarioData === null || scenarioData === void 0 ? void 0 : scenarioData.type) === "ORBAT-mapper" ||
                (scenarioData === null || scenarioData === void 0 ? void 0 : scenarioData.type) === "ORBAT-mapper-encrypted") {
                emit("loaded", scenarioData);
            }
            else {
                console.error("Failed to load", file.name);
                isError.value = true;
            }
        }
        catch (e) {
            console.error("Failed to load", file.name);
            isError.value = true;
        }
    };
    reader.readAsText(file);
}
var onFileLoad = function (e) {
    var _a;
    var target = e.target;
    if (!((_a = target === null || target === void 0 ? void 0 : target.files) === null || _a === void 0 ? void 0 : _a.length))
        return;
    var file = target.files[0];
    if (file)
        readFile(file);
};
function onDrop(files) {
    var file = files && files[0];
    if (file)
        readFile(file);
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ ref: "dropZoneRef" }, { class: "border-border hover:border-border/80 relative w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2" }), { class: (__VLS_ctx.isOverDropZone ? 'border-primary cursor-crosshair' : '') }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-border/80']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-offset-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:ring-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ onChange: (__VLS_ctx.onFileLoad) }, { type: "file", id: "file" }), { class: "absolute h-[0.1px] w-[0.1px] opacity-0" }));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[0.1px]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[0.1px]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "file" }, { class: "text-foreground hover:text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign({ xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", 'stroke-width': "1", stroke: "currentColor" }, { class: "text-muted-foreground h-12 w-12" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "mt-2 block text-center" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
if (__VLS_ctx.isError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-destructive-foreground absolute bottom-2 left-0 w-full text-center text-base" }));
    /** @type {__VLS_StyleScopedClasses['text-destructive-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
}
// @ts-ignore
[isOverDropZone, onFileLoad, isError,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
