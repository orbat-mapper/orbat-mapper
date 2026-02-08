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
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var vue_1 = require("vue");
var props = withDefaults(defineProps(), {
    hideEdit: false,
});
var emit = defineEmits();
var items = (0, vue_1.computed)(function () {
    var base = [
        { label: "Modify time", action: "changeTime" },
    ];
    if (!props.hideEdit) {
        base.push({ label: "Edit", action: "editMeta" });
        base.push({ label: "Edit media", action: "editMedia" });
    }
    base.push({ label: "Delete", action: "delete" });
    return base;
});
var onAction = function (value) {
    if (typeof value === "function")
        value();
    else
        emit("action", value);
};
var __VLS_defaults = {
    hideEdit: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onAction': {} }, { items: (__VLS_ctx.items) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { items: (__VLS_ctx.items) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ action: {} },
    { onAction: (__VLS_ctx.onAction) });
var __VLS_7 = {};
var __VLS_3;
var __VLS_4;
// @ts-ignore
[items, onAction,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
