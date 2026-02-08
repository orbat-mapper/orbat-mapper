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
var solid_1 = require("@heroicons/vue/20/solid");
var vue_1 = require("vue");
var props = defineProps();
var cols = (0, vue_1.computed)(function () { return props.table.getAllLeafColumns(); });
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    asChild: true,
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "z-10" }));
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ type: "button" }, { class: "text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground focus:ring-ring rounded-full p-2 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-offset-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.EllipsisVerticalIcon} */
solid_1.EllipsisVerticalIcon;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
var __VLS_10;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "" }, { align: "end" })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "" }, { align: "end" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuLabel | typeof __VLS_components.DropdownMenuLabel} */
dropdown_menu_1.DropdownMenuLabel;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
var __VLS_27;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_40 = __VLS_38.slots.default;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = __VLS_44.slots.default;
var __VLS_44;
var __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_48), false));
var __VLS_52 = __VLS_50.slots.default;
var _loop_1 = function (col) {
    var __VLS_53 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
    dropdown_menu_1.DropdownMenuCheckboxItem;
    // @ts-ignore
    var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign(__assign({ 'onUpdate:modelValue': {} }, { 'onSelect': {} }), { modelValue: (col.getIsVisible()), disabled: (!col.getCanHide()) })));
    var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { 'onSelect': {} }), { modelValue: (col.getIsVisible()), disabled: (!col.getCanHide()) })], __VLS_functionalComponentArgsRest(__VLS_54), false));
    var __VLS_58 = void 0;
    var __VLS_59 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                col.toggleVisibility($event);
                // @ts-ignore
                [cols,];
            } });
    var __VLS_60 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_61 = __VLS_56.slots.default;
    (col.columnDef.header);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
};
var __VLS_56, __VLS_57;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.cols.filter(function (c) { return typeof c.columnDef.header === 'string'; }))); _i < _a.length; _i++) {
    var col = _a[_i][0];
    _loop_1(col);
}
// @ts-ignore
[];
var __VLS_50;
// @ts-ignore
[];
var __VLS_38;
var __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62(__assign({ 'onSelect': {} })));
var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_63), false));
var __VLS_67;
var __VLS_68 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.table.resetColumnSizing();
            // @ts-ignore
            [table,];
        } });
var __VLS_69 = __VLS_65.slots.default;
// @ts-ignore
[];
var __VLS_65;
var __VLS_66;
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
