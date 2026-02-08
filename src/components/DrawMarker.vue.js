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
var Point_1 = require("ol/geom/Point");
var render_1 = require("ol/render");
var style_1 = require("ol/style");
var simplestyle_1 = require("@/geo/simplestyle");
var props = withDefaults(defineProps(), {
    marker: "circle",
    size: 10,
    color: "red",
});
var canvasRef = (0, vue_1.ref)();
(0, vue_1.watchEffect)(function () {
    drawSymbol(canvasRef.value, props.color);
}, { flush: "post" });
function drawSymbol(el, color) {
    if (!el)
        return;
    var vectorContext = (0, render_1.toContext)(canvasRef.value.getContext("2d"), {
        size: [props.size * 2, props.size * 2],
    });
    var style = new style_1.Style({
        image: (0, simplestyle_1.createMarkerSymbol)(props.marker, "medium", color),
    });
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(new Point_1.default([10, 10]));
}
var __VLS_defaults = {
    marker: "circle",
    size: 10,
    color: "red",
};
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.canvas)(__assign({ ref: "canvasRef" }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
