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
var button_1 = require("@/components/ui/button");
var lucide_vue_next_1 = require("lucide-vue-next");
var emit = defineEmits();
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ as: "child" }, { class: "" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ as: "child" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ variant: "ghost", size: "sm" }, { class: "text-muted-foreground" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ variant: "ghost", size: "sm" }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_18 = __VLS_16.slots.default;
var __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.EllipsisVertical} */
lucide_vue_next_1.EllipsisVertical;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_16;
var __VLS_10;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ class: "min-w-52" }, { align: "end" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ class: "min-w-52" }, { align: "end" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
/** @type {__VLS_StyleScopedClasses['min-w-52']} */ ;
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
var __VLS_36 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'zoom');
            // @ts-ignore
            [emit,];
        } });
var __VLS_37 = __VLS_33.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_33;
var __VLS_34;
var __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_39), false));
var __VLS_43;
var __VLS_44 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'duplicate');
            // @ts-ignore
            [emit,];
        } });
var __VLS_45 = __VLS_41.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_41;
var __VLS_42;
var __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51;
var __VLS_52 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'delete');
            // @ts-ignore
            [emit,];
        } });
var __VLS_53 = __VLS_49.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_55), false));
var __VLS_59 = __VLS_57.slots.default;
// @ts-ignore
[];
var __VLS_57;
// @ts-ignore
[];
var __VLS_49;
var __VLS_50;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_65;
var __VLS_66 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'removeMedia');
            // @ts-ignore
            [emit,];
        } });
var __VLS_67 = __VLS_63.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_63;
var __VLS_64;
// @ts-ignore
[];
var __VLS_27;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
});
exports.default = {};
