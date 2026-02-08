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
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
exports.default = {};
;
var __VLS_ctx = {};
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_export = (0, vue_1.defineComponent)({
    name: "MilSymbol",
    props: {
        sidc: { type: String },
        size: {
            type: Number,
            default: 15,
        },
        modifiers: {
            type: Object,
        },
    },
    render: function () {
        var _a;
        var symb = (0, milsymbwrapper_1.symbolGenerator)(this.sidc || "", __assign({ size: this.size, simpleStatusModifier: true }, ((_a = this.modifiers) !== null && _a !== void 0 ? _a : {})));
        return (0, vue_1.h)("span", {
            class: "milsymbol",
            innerHTML: symb.asSVG(),
        });
    },
});
