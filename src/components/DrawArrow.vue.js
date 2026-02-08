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
var arrowStyles_1 = require("@/geo/arrowStyles");
var props = withDefaults(defineProps(), {
    arrowType: "arrow",
    size: 24,
    color: "currentColor",
    rotation: 0,
});
var canvasRef = (0, vue_1.ref)();
(0, vue_1.watchEffect)(function () {
    if (canvasRef.value) {
        drawSymbol(canvasRef.value, props.color);
    }
}, { flush: "post" });
function drawSymbol(el, color) {
    var ctx = el.getContext("2d");
    if (!ctx)
        return;
    // Resolve currentColor
    if (color === "currentColor") {
        var style = getComputedStyle(el);
        color = style.color || "black";
        // If the color is transparent (e.g. during fade-in animation), retry
        if (color === "rgba(0, 0, 0, 0)" || color === "transparent") {
            requestAnimationFrame(function () { return drawSymbol(el, "currentColor"); });
            return;
        }
    }
    var ratio = window.devicePixelRatio || 1;
    el.width = props.size * ratio;
    el.height = props.size * ratio;
    el.style.width = "".concat(props.size, "px");
    el.style.height = "".concat(props.size, "px");
    // Check if this arrow type uses SVG (returns a data URI)
    var svgDataUri = (0, arrowStyles_1.getArrowSvgDataUri)(props.arrowType, color);
    if (svgDataUri) {
        // For SVG-based arrows, use direct Image API (simpler and more reliable)
        var img_1 = new Image();
        img_1.onload = function () {
            ctx.clearRect(0, 0, el.width, el.height);
            // Apply rotation around center
            ctx.save();
            ctx.translate(el.width / 2, el.height / 2);
            ctx.rotate(-props.rotation);
            ctx.drawImage(img_1, -el.width / 2, -el.height / 2, el.width, el.height);
            ctx.restore();
        };
        img_1.src = svgDataUri;
    }
    else if (props.arrowType !== "none") {
        // For shape-based arrows (RegularShape, CircleStyle), use OpenLayers
        var image = (0, arrowStyles_1.createArrowMarkerImage)(props.arrowType, color, props.rotation, 1);
        if (image) {
            var style = new style_1.Style({ image: image });
            var vectorContext = (0, render_1.toContext)(ctx, {
                size: [props.size, props.size],
                pixelRatio: ratio,
            });
            ctx.clearRect(0, 0, el.width, el.height);
            vectorContext.setStyle(style);
            vectorContext.drawGeometry(new Point_1.default([props.size / 2, props.size / 2]));
        }
    }
}
var __VLS_defaults = {
    arrowType: "arrow",
    size: 24,
    color: "currentColor",
    rotation: 0,
};
var __VLS_ctx = __assign(__assign(__assign({}, {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.canvas)(__assign({ ref: "canvasRef", width: (__VLS_ctx.size), height: (__VLS_ctx.size) }, { class: "inline-block align-middle" }));
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
// @ts-ignore
[size, size,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
