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
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_vue_next_1 = require("lucide-vue-next");
var utils_ts_1 = require("@/lib/utils.ts");
var props = withDefaults(defineProps(), { static: false });
var emit = defineEmits(["update:activeItem"]);
var _activeItem = (0, vue_1.ref)(props.items[0]);
var activeItemRef = (0, vue_1.computed)({
    get: function () {
        return props.activeItem || _activeItem.value;
    },
    set: function (v) {
        _activeItem.value = v;
        emit("update:activeItem", v);
    },
});
var menuItems = (0, vue_1.computed)(function () {
    return props.items.filter(function (e) { var _a; return e.label !== ((_a = activeItemRef.value) === null || _a === void 0 ? void 0 : _a.label); });
});
var onClick = function (item) {
    if (!props.static)
        activeItemRef.value = item;
    item.onClick();
};
var __VLS_defaults = { static: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign(__assign({ 'onClick': {} }, { variant: "outline", disabled: (__VLS_ctx.activeItemRef.disabled) }), { class: "rounded-r-none text-left ring-inset" }), { title: (__VLS_ctx.activeItemRef.label) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "outline", disabled: (__VLS_ctx.activeItemRef.disabled) }), { class: "rounded-r-none text-left ring-inset" }), { title: (__VLS_ctx.activeItemRef.label) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onClick(__VLS_ctx.activeItemRef);
            // @ts-ignore
            [activeItemRef, activeItemRef, activeItemRef, onClick,];
        } });
/** @type {__VLS_StyleScopedClasses['rounded-r-none']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-inset']} */ ;
var __VLS_7 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: (__VLS_ctx.cn('truncate', __VLS_ctx.triggerClass)) }));
(__VLS_ctx.activeItemRef.label);
// @ts-ignore
[activeItemRef, utils_ts_1.cn, triggerClass,];
var __VLS_3;
var __VLS_4;
var __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
dropdown_menu_1.DropdownMenu;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_13 = __VLS_11.slots.default;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
dropdown_menu_1.DropdownMenuTrigger;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    asChild: true,
}));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19 = __VLS_17.slots.default;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ variant: "outline", size: "icon" }, { class: "rounded-l-none border-l-0 px-2 ring-inset" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ variant: "outline", size: "icon" }, { class: "rounded-l-none border-l-0 px-2 ring-inset" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
/** @type {__VLS_StyleScopedClasses['rounded-l-none']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-0']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-inset']} */ ;
var __VLS_25 = __VLS_23.slots.default;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
lucide_vue_next_1.ChevronDown;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_27), false));
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_17;
var __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    align: "end",
}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
        align: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_32), false));
var __VLS_36 = __VLS_34.slots.default;
var _loop_1 = function (item) {
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ 'onSelect': {} }, { key: (item.label), disabled: (item.disabled) })));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { key: (item.label), disabled: (item.disabled) })], __VLS_functionalComponentArgsRest(__VLS_38), false));
    var __VLS_42 = void 0;
    var __VLS_43 = ({ select: {} },
        { onSelect: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onClick(item);
                // @ts-ignore
                [onClick, menuItems,];
            } });
    var __VLS_44 = __VLS_40.slots.default;
    (item.label);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
};
var __VLS_40, __VLS_41;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.menuItems)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    _loop_1(item);
}
// @ts-ignore
[];
var __VLS_34;
// @ts-ignore
[];
var __VLS_11;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
