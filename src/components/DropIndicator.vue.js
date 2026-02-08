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
var props = withDefaults(defineProps(), { gap: "0px" });
var edgeToOrientationMap = {
    top: "horizontal",
    bottom: "horizontal",
    left: "vertical",
    right: "vertical",
};
var orientationStyles = {
    horizontal: "h-(--line-thickness) left-(--terminal-radius) right-0 before:left-(--negative-terminal-size)",
    vertical: "w-(--line-thickness) top-(--terminal-radius) bottom-0 before:top-(--negative-terminal-size)",
};
var edgeStyles = {
    top: "top-(--line-offset) before:top-(--offset-terminal)",
    right: "right-(--line-offset) before:right-(--offset-terminal)",
    bottom: "bottom-(--line-offset) before:bottom-(--offset-terminal)",
    left: "left-(--line-offset) before:left-(--offset-terminal)",
};
var strokeSize = 2;
var terminalSize = 8;
var offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;
var __VLS_defaults = { gap: "0px" };
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: ([
        __VLS_ctx.orientationStyles[__VLS_ctx.edgeToOrientationMap[__VLS_ctx.edge]],
        [__VLS_ctx.edgeStyles[__VLS_ctx.edge]],
        'before:content[\'\'] pointer-events-none absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-(--terminal-size) before:rounded-full before:border-(length:--line-thickness) before:border-solid before:border-blue-700',
    ]) }, { style: ({
        '--line-thickness': "".concat(__VLS_ctx.strokeSize, "px"),
        '--line-offset': "calc(-0.5 * (".concat(props.gap, " + ").concat(__VLS_ctx.strokeSize, "px))"),
        '--terminal-size': "".concat(__VLS_ctx.terminalSize, "px"),
        '--terminal-radius': "".concat(__VLS_ctx.terminalSize / 2, "px"),
        '--negative-terminal-size': "-".concat(__VLS_ctx.terminalSize, "px"),
        '--offset-terminal': "".concat(__VLS_ctx.offsetToAlignTerminalWithLine, "px"),
    }) }));
/** @type {__VLS_StyleScopedClasses['before:content[\'\']']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['before:absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['before:h-(--terminal-size)']} */ ;
/** @type {__VLS_StyleScopedClasses['before:w-(--terminal-size)']} */ ;
/** @type {__VLS_StyleScopedClasses['before:rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['before:border-(length:--line-thickness)']} */ ;
/** @type {__VLS_StyleScopedClasses['before:border-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['before:border-blue-700']} */ ;
// @ts-ignore
[orientationStyles, edgeToOrientationMap, edge, edge, edgeStyles, strokeSize, strokeSize, terminalSize, terminalSize, terminalSize, offsetToAlignTerminalWithLine,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
