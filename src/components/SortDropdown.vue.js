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
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_vue_next_1 = require("lucide-vue-next");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits(["action"]);
var onItemClick = function (item) {
    if (item.action instanceof Function)
        item.action();
    else
        emit("action", item.action);
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
dropdown_menu_1.DropdownMenu;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
dropdown_menu_1.DropdownMenuTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onClick': {} }, { as: "child" }), { class: "" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { as: "child" }), { class: "" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () { } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign({ variant: "ghost" }, { class: "" })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign({ variant: "ghost" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_16), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_20 = __VLS_18.slots.default;
var __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
lucide_vue_next_1.ChevronDown;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_18;
var __VLS_10;
var __VLS_11;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    align: "end",
}));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{
        align: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_27), false));
var __VLS_31 = __VLS_29.slots.default;
var _loop_1 = function (item) {
    var __VLS_32 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ 'onSelect': {} }, { disabled: (item.disabled) })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { disabled: (item.disabled) })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    var __VLS_37 = void 0;
    var __VLS_38 = ({ select: {} },
        { onSelect: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onItemClick(item);
                // @ts-ignore
                [options, onItemClick,];
            } });
    var __VLS_39 = __VLS_35.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.label);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
};
var __VLS_35, __VLS_36;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.options)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    _loop_1(item);
}
// @ts-ignore
[];
var __VLS_29;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
