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
var DropIndicator_vue_1 = require("@/components/DropIndicator.vue");
var props = defineProps();
var token = function (name) {
    var tokens = {
        "color.border.warning": "#FFAB00", // Example color, replace with actual value
    };
    return tokens[name] || "";
};
var line = {
    backgroundColor: "red", // Example color, replace with actual value
    thickness: 2, // Example thickness, replace with actual value
};
var style = (0, vue_1.computed)(function () {
    if (props.instruction.type === "instruction-blocked") {
        return {};
    }
    return {
        "--horizontal-indent": "".concat(props.instruction.currentLevel * props.instruction.indentPerLevel, "px"),
        "--indicator-color": !isBlocked.value
            ? line.backgroundColor
            : token("color.border.warning"),
    };
});
var isBlocked = (0, vue_1.computed)(function () { return props.instruction.type === "instruction-blocked"; });
var reparentStyle = (0, vue_1.computed)(function () {
    if (props.instruction.type !== "reparent") {
        return {};
    }
    return __assign(__assign({}, style.value), { "--horizontal-indent": "-".concat(props.instruction.desiredLevel * props.instruction.indentPerLevel, "px") });
});
var lineStyles = "'before:content[\\'\\'] pointer-events-none top-0 right-0 absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-(--terminal-size) before:rounded-full before:border-(length:--line-thickness) before:border-solid before:border-blue-700'";
var lineAboveStyles = "before:top-0 before:transform-translate-x-[-50%] before:transform-translate-y-[-50%] after:top-[-1px]";
var outlineStyles = "absolute top-0 right-0 left-0 bottom-0 pointer-events-none border-[2px] border-blue-700 rounded-[3px]";
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.instruction.type === 'reorder-above') {
    var __VLS_0 = DropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        edge: "top",
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            edge: "top",
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = {};
    var __VLS_3;
}
else if (__VLS_ctx.instruction.type === 'reorder-below') {
    var __VLS_6 = DropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        edge: "bottom",
    }));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
            edge: "bottom",
        }], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = {};
    var __VLS_9;
}
else if (__VLS_ctx.instruction.type === 'make-child') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: ([__VLS_ctx.outlineStyles]) }, { style: (__VLS_ctx.style) }));
}
else if (__VLS_ctx.instruction.type === 'reparent') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: ([__VLS_ctx.lineStyles, __VLS_ctx.lineAboveStyles]) }, { style: (__VLS_ctx.reparentStyle) }));
}
// @ts-ignore
[instruction, instruction, instruction, instruction, outlineStyles, style, lineStyles, lineAboveStyles, reparentStyle,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
