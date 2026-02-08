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
var formatting_1 = require("../../composables/formatting");
var testStory_1 = require("../../testdata/testStory");
var scrollama_1 = require("scrollama");
var core_1 = require("@vueuse/core");
exports.default = {};
;
var __VLS_ctx = {};
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "bg-background fixed right-2 bottom-2 z-40 border p-2" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-2']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
(__VLS_ctx.sIndex);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert p-4" }));
__VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.renderedContent) }), null, null);
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
// @ts-ignore
[sIndex, renderedContent,];
var __VLS_export = (0, vue_1.defineComponent)({
    name: "StoryModeContent",
    emits: ["update-state"],
    setup: function (props, _a) {
        var emit = _a.emit;
        var renderedContent = (0, vue_1.computed)(function () {
            return (0, formatting_1.renderMarkdown)(testStory_1.content);
        });
        var scroller;
        var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
        var smAndLarger = breakpoints.greater("md");
        var sIndex = (0, vue_1.ref)(-1);
        (0, vue_1.onMounted)(function () {
            scroller = (0, scrollama_1.default)();
            scroller
                .setup({
                step: ".scroll-step",
                // debug: true,
            })
                .onStepEnter(function (_a) {
                var element = _a.element, index = _a.index, direction = _a.direction;
                sIndex.value = index;
                if (testStory_1.actions[index])
                    emit("update-state", testStory_1.actions[index]);
                element.classList.add("bg-red-50");
                // console.log("Enter", element, index, direction);
            })
                .onStepExit(function (_a) {
                var element = _a.element, index = _a.index, direction = _a.direction;
                element.classList.remove("bg-red-50");
                // console.log("Exit", element, index, direction);
            });
            (0, vue_1.watch)(smAndLarger, function (larger) {
                //@ts-ignore
                if (larger)
                    scroller === null || scroller === void 0 ? void 0 : scroller.offset("100px");
                //@ts-ignore
                else
                    scroller === null || scroller === void 0 ? void 0 : scroller.offset(0.5);
            }, { immediate: true });
        });
        (0, vue_1.onUnmounted)(function () {
            scroller.destroy();
        });
        return { renderedContent: renderedContent, sIndex: sIndex };
    },
});
