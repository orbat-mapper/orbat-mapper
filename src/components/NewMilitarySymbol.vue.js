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
var settingsStore_1 = require("@/stores/settingsStore");
exports.default = {};
;
var __VLS_ctx = {};
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_export = (0, vue_1.defineComponent)({
    name: "NewMilitarySymbol",
    props: {
        sidc: { type: String },
        size: {
            type: Number,
            default: 15,
        },
        modifiers: {
            type: Object,
        },
        options: {
            type: Object,
        },
    },
    setup: function (props) {
        var settings = (0, settingsStore_1.useSymbolSettingsStore)();
        var symb = (0, vue_1.computed)(function () {
            var _a, _b;
            return (0, milsymbwrapper_1.symbolGenerator)(props.sidc || "", __assign(__assign(__assign({ size: props.size }, settings.symbolOptions), ((_a = props.options) !== null && _a !== void 0 ? _a : {})), ((_b = props.modifiers) !== null && _b !== void 0 ? _b : {})));
        });
        return function () {
            var node = symb.value.asDOM();
            return (0, vue_1.h)(node.tagName, __assign(__assign({ class: "milsymbol" }, getAttributes(node)), { innerHTML: node.innerHTML }));
        };
    },
});
function getAttributes(node) {
    return Array.from(node.attributes).reduce(function (attrs, attr) {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});
}
