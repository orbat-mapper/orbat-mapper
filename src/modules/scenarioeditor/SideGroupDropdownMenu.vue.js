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
var constants_1 = require("@/types/constants");
var vue_1 = require("vue");
var lucide_vue_next_1 = require("lucide-vue-next");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits();
var sideGroupMenuItems = (0, vue_1.computed)(function () { return [
    {
        label: "Add root unit",
        action: constants_1.SideActions.AddSubordinate,
        disabled: props.isLocked,
    },
    { label: "Edit group", action: constants_1.SideActions.Edit, disabled: props.isLocked },
    { label: "Delete group", action: constants_1.SideActions.Delete, disabled: props.isLocked },
    { label: "Move up", action: constants_1.SideActions.MoveUp, disabled: props.isLocked },
    { label: "Move down", action: constants_1.SideActions.MoveDown, disabled: props.isLocked },
    { label: "Duplicate", action: constants_1.SideActions.Clone, disabled: props.isLocked },
    {
        label: "Duplicate (with state)",
        action: constants_1.SideActions.CloneWithState,
        disabled: props.isLocked,
    },
    props.isSideGroupLocked
        ? { label: "Unlock group", action: constants_1.SideActions.Unlock, disabled: props.isSideLocked }
        : { label: "Lock group", action: constants_1.SideActions.Lock, disabled: props.isSideLocked },
    props.isSideGroupHidden
        ? { label: "Show group", action: constants_1.SideActions.Show, disabled: props.isSideHidden }
        : { label: "Hide group", action: constants_1.SideActions.Hide, disabled: props.isSideHidden },
]; });
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ as: "child" }, { class: "mr-2" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ as: "child" }, { class: "mr-2" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
var __VLS_12 = __VLS_10.slots.default;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ variant: "ghost", size: "icon" }, { class: "text-muted-foreground" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ variant: "ghost", size: "icon" }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
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
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuLabel | typeof __VLS_components.DropdownMenuLabel} */
dropdown_menu_1.DropdownMenuLabel;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
var __VLS_33;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_37), false));
var _loop_1 = function (item) {
    var __VLS_41 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ 'onSelect': {} }, { key: (item.action), disabled: (item.disabled) })));
    var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { key: (item.action), disabled: (item.disabled) })], __VLS_functionalComponentArgsRest(__VLS_42), false));
    var __VLS_46 = void 0;
    var __VLS_47 = ({ select: {} },
        { onSelect: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('action', item.action);
                // @ts-ignore
                [sideGroupMenuItems, emit,];
            } });
    var __VLS_48 = __VLS_44.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.label);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
};
var __VLS_44, __VLS_45;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.sideGroupMenuItems)); _i < _a.length; _i++) {
    var item = _a[_i][0];
    _loop_1(item);
}
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
    __typeProps: {},
});
exports.default = {};
