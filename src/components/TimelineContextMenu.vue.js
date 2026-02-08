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
var context_menu_1 = require("@/components/ui/context-menu");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var uiStore_1 = require("@/stores/uiStore");
var props = defineProps();
var emit = defineEmits();
var uiSettings = (0, uiStore_1.useUiStore)();
function onContextMenuUpdate(open) { }
function onContextMenu(e) { }
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ContextMenu | typeof __VLS_components.ContextMenu} */
context_menu_1.ContextMenu;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:open': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:open': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:open': {} },
    { 'onUpdate:open': (__VLS_ctx.onContextMenuUpdate) });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
var __VLS_9;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuTrigger | typeof __VLS_components.ContextMenuTrigger} */
context_menu_1.ContextMenuTrigger;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    asChild: true,
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = __VLS_12.slots.default;
var __VLS_15 = {
    onContextMenu: (__VLS_ctx.onContextMenu),
};
// @ts-ignore
[onContextMenuUpdate, onContextMenu,];
var __VLS_12;
var __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuContent | typeof __VLS_components.ContextMenuContent} */
context_menu_1.ContextMenuContent;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_22 = __VLS_20.slots.default;
var __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuLabel | typeof __VLS_components.ContextMenuLabel} */
context_menu_1.ContextMenuLabel;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "flex items-center" })));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "flex items-center" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_28 = __VLS_26.slots.default;
var __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.IconClockOutline} */
vue_mdi_1.IconClockOutline;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign({ class: "mr-2 size-5" })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ class: "mr-2 size-5" })], __VLS_functionalComponentArgsRest(__VLS_30), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
(__VLS_ctx.formattedHoveredDate);
// @ts-ignore
[formattedHoveredDate,];
var __VLS_26;
var __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({}));
var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_35), false));
var __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ 'onSelect': {} })));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_40), false));
var __VLS_44;
var __VLS_45 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'zoomIn');
            // @ts-ignore
            [emit,];
        } });
var __VLS_46 = __VLS_42.slots.default;
var __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.IconZoomInOutline} */
vue_mdi_1.IconZoomInOutline;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47(__assign({ class: "mr-2 size-5" })));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([__assign({ class: "mr-2 size-5" })], __VLS_functionalComponentArgsRest(__VLS_48), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_42;
var __VLS_43;
var __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign({ 'onSelect': {} })));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_53), false));
var __VLS_57;
var __VLS_58 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'zoomOut');
            // @ts-ignore
            [emit,];
        } });
var __VLS_59 = __VLS_55.slots.default;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.IconZoomOutOutline} */
vue_mdi_1.IconZoomOutOutline;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ class: "mr-2 size-5" })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ class: "mr-2 size-5" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_55;
var __VLS_56;
var __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuSeparator} */
context_menu_1.ContextMenuSeparator;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70(__assign({ 'onSelect': {} })));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_71), false));
var __VLS_75;
var __VLS_76 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'addScenarioEvent');
            // @ts-ignore
            [emit,];
        } });
var __VLS_77 = __VLS_73.slots.default;
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.AddEventIcon} */
vue_mdi_1.IconAddCircleOutline;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ class: "mr-2 size-5" })));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ class: "mr-2 size-5" })], __VLS_functionalComponentArgsRest(__VLS_79), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_73;
var __VLS_74;
var __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.ContextMenuItem | typeof __VLS_components.ContextMenuItem} */
context_menu_1.ContextMenuItem;
// @ts-ignore
var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_84), false));
var __VLS_88;
var __VLS_89 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.uiSettings.showTimeline = false;
            // @ts-ignore
            [uiSettings,];
        } });
var __VLS_90 = __VLS_86.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-1" }));
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
// @ts-ignore
[];
var __VLS_86;
var __VLS_87;
// @ts-ignore
[];
var __VLS_20;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_16 = __VLS_15;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
