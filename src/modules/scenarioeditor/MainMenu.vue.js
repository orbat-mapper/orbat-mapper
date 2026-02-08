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
var uiStore_1 = require("@/stores/uiStore");
var names_1 = require("@/router/names");
var vue_router_1 = require("vue-router");
var mapSettingsStore_1 = require("@/stores/mapSettingsStore");
var pinia_1 = require("pinia");
var geoStore_1 = require("@/stores/geoStore");
var core_1 = require("@vueuse/core");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var scenarioShare_1 = require("@/composables/scenarioShare");
var lucide_vue_next_1 = require("lucide-vue-next");
var dayjs_1 = require("dayjs");
var relativeTime_1 = require("dayjs/plugin/relativeTime");
dayjs_1.default.extend(relativeTime_1.default);
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var emit = defineEmits();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store, undo = _a.undo, redo = _a.redo, canRedo = _a.canRedo, canUndo = _a.canUndo;
var route = (0, vue_router_1.useRoute)();
var uiSettings = (0, uiStore_1.useUiStore)();
var mapSettings = (0, mapSettingsStore_1.useMapSettingsStore)();
var _b = (0, pinia_1.storeToRefs)((0, mapSettingsStore_1.useMapSettingsStore)()), coordinateFormat = _b.coordinateFormat, showLocation = _b.showLocation, showScaleLine = _b.showScaleLine, showDayNightTerminator = _b.showDayNightTerminator;
var measurementUnit = (0, pinia_1.storeToRefs)((0, geoStore_1.useMeasurementsStore)()).measurementUnit;
var _c = (0, scenarioShare_1.useShareHistory)(), shareHistory = _c.history, clearShareHistory = _c.clearHistory;
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
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ as: "div" }, { class: "relative" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ as: "div" }, { class: "relative" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_12 = __VLS_10.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "group flex items-center" }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign({ class: "block h-7 w-auto shrink-0 fill-[#aab074]/90 stroke-gray-900 dark:fill-gray-700 dark:stroke-gray-300" }, { stroke: "currentColor", viewBox: "41 41 118 118" }));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['w-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-[#aab074]/90']} */ ;
/** @type {__VLS_StyleScopedClasses['stroke-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:fill-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:stroke-gray-300']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m100 45 55 25v60l-55 25-55-25V70z",
    'stroke-width': "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m45 70 110 60m-110 0 110-60",
    'stroke-width': "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)(__assign({ cx: "100", cy: "70", r: "10" }, { class: "fill-gray-900 dark:fill-gray-300" }));
/** @type {__VLS_StyleScopedClasses['fill-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:fill-gray-300']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-2 hidden font-medium tracking-tight sm:inline-flex" }));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
var __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.ChevronDownIcon} */
solid_1.ChevronDownIcon;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "text-muted-foreground group-hover:text-muted-foreground/80 ml-1 h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-muted-foreground/80 ml-1 h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-muted-foreground/80']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
var __VLS_10;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "" }, { align: "start", sideOffset: (10) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "" }, { align: "start", sideOffset: (10) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    asChild: true,
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ to: ({ name: __VLS_ctx.LANDING_PAGE_ROUTE }) }, { class: "font-medium" })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.LANDING_PAGE_ROUTE }) }, { class: "font-medium" })], __VLS_functionalComponentArgsRest(__VLS_31), false));
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_35 = __VLS_33.slots.default;
// @ts-ignore
[names_1.LANDING_PAGE_ROUTE,];
var __VLS_33;
// @ts-ignore
[];
var __VLS_27;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ 'onSelect': {} })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46;
var __VLS_47 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('uiAction', 'showSearch');
            // @ts-ignore
            [emit,];
        } });
var __VLS_48 = __VLS_44.slots.default;
var __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ class: "ml-4" })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "ml-4" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
var __VLS_54 = __VLS_52.slots.default;
// @ts-ignore
[];
var __VLS_52;
// @ts-ignore
[];
var __VLS_44;
var __VLS_45;
var __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_56), false));
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_65 = __VLS_63.slots.default;
var __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_67), false));
var __VLS_71 = __VLS_69.slots.default;
// @ts-ignore
[];
var __VLS_69;
var __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({}));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77 = __VLS_75.slots.default;
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ 'onSelect': {} })));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_79), false));
var __VLS_83;
var __VLS_84 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'exportJson');
            // @ts-ignore
            [emit,];
        } });
var __VLS_85 = __VLS_81.slots.default;
// @ts-ignore
[];
var __VLS_81;
var __VLS_82;
var __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86(__assign({ 'onSelect': {} })));
var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_87), false));
var __VLS_91;
var __VLS_92 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'exportEncrypted');
            // @ts-ignore
            [emit,];
        } });
var __VLS_93 = __VLS_89.slots.default;
// @ts-ignore
[];
var __VLS_89;
var __VLS_90;
var __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94(__assign({ 'onSelect': {} })));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_95), false));
var __VLS_99;
var __VLS_100 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'save');
            // @ts-ignore
            [emit,];
        } });
var __VLS_101 = __VLS_97.slots.default;
// @ts-ignore
[];
var __VLS_97;
var __VLS_98;
var __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102(__assign({ 'onSelect': {} })));
var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_103), false));
var __VLS_107;
var __VLS_108 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'loadNew');
            // @ts-ignore
            [emit,];
        } });
var __VLS_109 = __VLS_105.slots.default;
// @ts-ignore
[];
var __VLS_105;
var __VLS_106;
var __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110(__assign({ 'onSelect': {} })));
var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_111), false));
var __VLS_115;
var __VLS_116 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'createNew');
            // @ts-ignore
            [emit,];
        } });
var __VLS_117 = __VLS_113.slots.default;
// @ts-ignore
[];
var __VLS_113;
var __VLS_114;
var __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_119), false));
var __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123(__assign({ 'onSelect': {} })));
var __VLS_125 = __VLS_124.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_124), false));
var __VLS_128;
var __VLS_129 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'share');
            // @ts-ignore
            [emit,];
        } });
var __VLS_130 = __VLS_126.slots.default;
// @ts-ignore
[];
var __VLS_126;
var __VLS_127;
var __VLS_131;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131(__assign({ 'onSelect': {} })));
var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_132), false));
var __VLS_136;
var __VLS_137 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'shareAsUrl');
            // @ts-ignore
            [emit,];
        } });
var __VLS_138 = __VLS_134.slots.default;
// @ts-ignore
[];
var __VLS_134;
var __VLS_135;
if (__VLS_ctx.shareHistory.length > 0) {
    var __VLS_139 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
    dropdown_menu_1.DropdownMenuSub;
    // @ts-ignore
    var __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({}));
    var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_140), false));
    var __VLS_144 = __VLS_142.slots.default;
    var __VLS_145 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
    dropdown_menu_1.DropdownMenuSubTrigger;
    // @ts-ignore
    var __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({}));
    var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_146), false));
    var __VLS_150 = __VLS_148.slots.default;
    // @ts-ignore
    [shareHistory,];
    var __VLS_148;
    var __VLS_151 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
    dropdown_menu_1.DropdownMenuSubContent;
    // @ts-ignore
    var __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151(__assign({ class: "w-80" })));
    var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([__assign({ class: "w-80" })], __VLS_functionalComponentArgsRest(__VLS_152), false));
    /** @type {__VLS_StyleScopedClasses['w-80']} */ ;
    var __VLS_156 = __VLS_154.slots.default;
    for (var _i = 0, _d = __VLS_vFor((__VLS_ctx.shareHistory)); _i < _d.length; _i++) {
        var item = _d[_i][0];
        var __VLS_157 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
        dropdown_menu_1.DropdownMenuItem;
        // @ts-ignore
        var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
            key: (item.id),
            asChild: true,
        }));
        var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([{
                key: (item.id),
                asChild: true,
            }], __VLS_functionalComponentArgsRest(__VLS_158), false));
        var __VLS_162 = __VLS_160.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: (item.url), target: "_blank" }, { class: "flex flex-col items-start gap-1 overflow-hidden" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-center gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (item.encrypted) {
            var __VLS_163 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.LockIcon} */
            lucide_vue_next_1.LockIcon;
            // @ts-ignore
            var __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163(__assign({ class: "h-3 w-3 shrink-0" })));
            var __VLS_165 = __VLS_164.apply(void 0, __spreadArray([__assign({ class: "h-3 w-3 shrink-0" })], __VLS_functionalComponentArgsRest(__VLS_164), false));
            /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate" }));
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground ml-auto shrink-0 text-xs" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (__VLS_ctx.dayjs(item.timestamp).fromNow());
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground w-full truncate text-xs" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (item.url);
        // @ts-ignore
        [shareHistory, dayjs_1.default,];
        var __VLS_160;
        // @ts-ignore
        [];
    }
    var __VLS_168 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
    dropdown_menu_1.DropdownMenuSeparator;
    // @ts-ignore
    var __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
    var __VLS_170 = __VLS_169.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_169), false));
    var __VLS_173 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173(__assign({ 'onSelect': {} })));
    var __VLS_175 = __VLS_174.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_174), false));
    var __VLS_178 = void 0;
    var __VLS_179 = ({ select: {} },
        { onSelect: (__VLS_ctx.clearShareHistory) });
    var __VLS_180 = __VLS_176.slots.default;
    // @ts-ignore
    [clearShareHistory,];
    var __VLS_176;
    var __VLS_177;
    // @ts-ignore
    [];
    var __VLS_154;
    // @ts-ignore
    [];
    var __VLS_142;
}
var __VLS_181;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181(__assign({ 'onSelect': {} })));
var __VLS_183 = __VLS_182.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_182), false));
var __VLS_186;
var __VLS_187 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'export');
            // @ts-ignore
            [emit,];
        } });
var __VLS_188 = __VLS_184.slots.default;
// @ts-ignore
[];
var __VLS_184;
var __VLS_185;
var __VLS_189;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189(__assign({ 'onSelect': {} })));
var __VLS_191 = __VLS_190.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_190), false));
var __VLS_194;
var __VLS_195 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'exportToImage');
            // @ts-ignore
            [emit,];
        } });
var __VLS_196 = __VLS_192.slots.default;
// @ts-ignore
[];
var __VLS_192;
var __VLS_193;
var __VLS_197;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197(__assign({ 'onSelect': {} })));
var __VLS_199 = __VLS_198.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_198), false));
var __VLS_202;
var __VLS_203 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'import');
            // @ts-ignore
            [emit,];
        } });
var __VLS_204 = __VLS_200.slots.default;
// @ts-ignore
[];
var __VLS_200;
var __VLS_201;
var __VLS_205;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205(__assign({ 'onSelect': {} })));
var __VLS_207 = __VLS_206.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_206), false));
var __VLS_210;
var __VLS_211 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'exportToClipboard');
            // @ts-ignore
            [emit,];
        } });
var __VLS_212 = __VLS_208.slots.default;
// @ts-ignore
[];
var __VLS_208;
var __VLS_209;
var __VLS_213;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({}));
var __VLS_215 = __VLS_214.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_214), false));
var __VLS_218;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218(__assign({ 'onSelect': {} })));
var __VLS_220 = __VLS_219.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_219), false));
var __VLS_223;
var __VLS_224 = ({ select: {} },
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
var __VLS_225 = __VLS_221.slots.default;
// @ts-ignore
[];
var __VLS_221;
var __VLS_222;
var __VLS_226;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226(__assign({ 'onSelect': {} })));
var __VLS_228 = __VLS_227.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_227), false));
var __VLS_231;
var __VLS_232 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'showInfo');
            // @ts-ignore
            [emit,];
        } });
var __VLS_233 = __VLS_229.slots.default;
// @ts-ignore
[];
var __VLS_229;
var __VLS_230;
// @ts-ignore
[];
var __VLS_75;
// @ts-ignore
[];
var __VLS_63;
var __VLS_234;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({}));
var __VLS_236 = __VLS_235.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_235), false));
var __VLS_239 = __VLS_237.slots.default;
var __VLS_240;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({}));
var __VLS_242 = __VLS_241.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_241), false));
var __VLS_245 = __VLS_243.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_243;
var __VLS_246;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({}));
var __VLS_248 = __VLS_247.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_247), false));
var __VLS_251 = __VLS_249.slots.default;
var __VLS_252;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252(__assign({ 'onSelect': {} }, { disabled: (!__VLS_ctx.canUndo) })));
var __VLS_254 = __VLS_253.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { disabled: (!__VLS_ctx.canUndo) })], __VLS_functionalComponentArgsRest(__VLS_253), false));
var __VLS_257;
var __VLS_258 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.undo();
            // @ts-ignore
            [canUndo, undo,];
        } });
var __VLS_259 = __VLS_255.slots.default;
var __VLS_260;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260(__assign({ class: "ml-4" })));
var __VLS_262 = __VLS_261.apply(void 0, __spreadArray([__assign({ class: "ml-4" })], __VLS_functionalComponentArgsRest(__VLS_261), false));
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
var __VLS_265 = __VLS_263.slots.default;
// @ts-ignore
[];
var __VLS_263;
// @ts-ignore
[];
var __VLS_255;
var __VLS_256;
var __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266(__assign({ 'onSelect': {} }, { disabled: (!__VLS_ctx.canRedo) })));
var __VLS_268 = __VLS_267.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { disabled: (!__VLS_ctx.canRedo) })], __VLS_functionalComponentArgsRest(__VLS_267), false));
var __VLS_271;
var __VLS_272 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [canRedo, redo,];
        } });
var __VLS_273 = __VLS_269.slots.default;
var __VLS_274;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274(__assign({ class: "ml-4" })));
var __VLS_276 = __VLS_275.apply(void 0, __spreadArray([__assign({ class: "ml-4" })], __VLS_functionalComponentArgsRest(__VLS_275), false));
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
var __VLS_279 = __VLS_277.slots.default;
// @ts-ignore
[];
var __VLS_277;
// @ts-ignore
[];
var __VLS_269;
var __VLS_270;
// @ts-ignore
[];
var __VLS_249;
// @ts-ignore
[];
var __VLS_237;
var __VLS_280;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({}));
var __VLS_282 = __VLS_281.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_281), false));
var __VLS_285 = __VLS_283.slots.default;
var __VLS_286;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({}));
var __VLS_288 = __VLS_287.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_287), false));
var __VLS_291 = __VLS_289.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "mr-4" }));
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
// @ts-ignore
[];
var __VLS_289;
var __VLS_292;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({}));
var __VLS_294 = __VLS_293.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_293), false));
var __VLS_297 = __VLS_295.slots.default;
var __VLS_298;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_299 = __VLS_asFunctionalComponent1(__VLS_298, new __VLS_298(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showToolbar) })));
var __VLS_300 = __VLS_299.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showToolbar) })], __VLS_functionalComponentArgsRest(__VLS_299), false));
var __VLS_303;
var __VLS_304 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_305 = __VLS_301.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_301;
var __VLS_302;
var __VLS_306;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showTimeline) })));
var __VLS_308 = __VLS_307.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showTimeline) })], __VLS_functionalComponentArgsRest(__VLS_307), false));
var __VLS_311;
var __VLS_312 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_313 = __VLS_309.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_309;
var __VLS_310;
if (!__VLS_ctx.isMobile) {
    var __VLS_314 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
    dropdown_menu_1.DropdownMenuCheckboxItem;
    // @ts-ignore
    var __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showLeftPanel) })));
    var __VLS_316 = __VLS_315.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showLeftPanel) })], __VLS_functionalComponentArgsRest(__VLS_315), false));
    var __VLS_319 = void 0;
    var __VLS_320 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_321 = __VLS_317.slots.default;
    // @ts-ignore
    [uiSettings, isMobile,];
    var __VLS_317;
    var __VLS_318;
}
var __VLS_322;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_323 = __VLS_asFunctionalComponent1(__VLS_322, new __VLS_322(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs) })));
var __VLS_324 = __VLS_323.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.uiSettings.showOrbatBreadcrumbs) })], __VLS_functionalComponentArgsRest(__VLS_323), false));
var __VLS_327;
var __VLS_328 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_329 = __VLS_325.slots.default;
// @ts-ignore
[uiSettings,];
var __VLS_325;
var __VLS_326;
var __VLS_330;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({}));
var __VLS_332 = __VLS_331.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_331), false));
var __VLS_335;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showScaleLine) })));
var __VLS_337 = __VLS_336.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showScaleLine) })], __VLS_functionalComponentArgsRest(__VLS_336), false));
var __VLS_340;
var __VLS_341 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_342 = __VLS_338.slots.default;
// @ts-ignore
[showScaleLine,];
var __VLS_338;
var __VLS_339;
var __VLS_343;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showLocation) })));
var __VLS_345 = __VLS_344.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showLocation) })], __VLS_functionalComponentArgsRest(__VLS_344), false));
var __VLS_348;
var __VLS_349 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_350 = __VLS_346.slots.default;
// @ts-ignore
[showLocation,];
var __VLS_346;
var __VLS_347;
var __VLS_351;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_352 = __VLS_asFunctionalComponent1(__VLS_351, new __VLS_351(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showDayNightTerminator) })));
var __VLS_353 = __VLS_352.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.showDayNightTerminator) })], __VLS_functionalComponentArgsRest(__VLS_352), false));
var __VLS_356;
var __VLS_357 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_358 = __VLS_354.slots.default;
// @ts-ignore
[showDayNightTerminator,];
var __VLS_354;
var __VLS_355;
var __VLS_359;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_360 = __VLS_asFunctionalComponent1(__VLS_359, new __VLS_359(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapUnitLabelBelow) })));
var __VLS_361 = __VLS_360.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapUnitLabelBelow) })], __VLS_functionalComponentArgsRest(__VLS_360), false));
var __VLS_364;
var __VLS_365 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_366 = __VLS_362.slots.default;
// @ts-ignore
[mapSettings,];
var __VLS_362;
var __VLS_363;
if (__VLS_ctx.mapSettings.mapUnitLabelBelow) {
    var __VLS_367 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
    dropdown_menu_1.DropdownMenuCheckboxItem;
    // @ts-ignore
    var __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapWrapUnitLabels) })));
    var __VLS_369 = __VLS_368.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.mapSettings.mapWrapUnitLabels) })], __VLS_functionalComponentArgsRest(__VLS_368), false));
    var __VLS_372 = void 0;
    var __VLS_373 = ({ select: {} },
        { onSelect: function () { } });
    var __VLS_374 = __VLS_370.slots.default;
    // @ts-ignore
    [mapSettings, mapSettings,];
    var __VLS_370;
    var __VLS_371;
}
var __VLS_375;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_376 = __VLS_asFunctionalComponent1(__VLS_375, new __VLS_375({}));
var __VLS_377 = __VLS_376.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_376), false));
var __VLS_380 = __VLS_378.slots.default;
var __VLS_381;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_382 = __VLS_asFunctionalComponent1(__VLS_381, new __VLS_381({
    inset: true,
}));
var __VLS_383 = __VLS_382.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_382), false));
var __VLS_386 = __VLS_384.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "pr-4" }));
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
// @ts-ignore
[];
var __VLS_384;
var __VLS_387;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_388 = __VLS_asFunctionalComponent1(__VLS_387, new __VLS_387({}));
var __VLS_389 = __VLS_388.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_388), false));
var __VLS_392 = __VLS_390.slots.default;
var __VLS_393;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioGroup | typeof __VLS_components.DropdownMenuRadioGroup} */
dropdown_menu_1.DropdownMenuRadioGroup;
// @ts-ignore
var __VLS_394 = __VLS_asFunctionalComponent1(__VLS_393, new __VLS_393({
    modelValue: (__VLS_ctx.measurementUnit),
}));
var __VLS_395 = __VLS_394.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.measurementUnit),
    }], __VLS_functionalComponentArgsRest(__VLS_394), false));
var __VLS_398 = __VLS_396.slots.default;
var __VLS_399;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_400 = __VLS_asFunctionalComponent1(__VLS_399, new __VLS_399(__assign({ 'onSelect': {} }, { value: "metric" })));
var __VLS_401 = __VLS_400.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "metric" })], __VLS_functionalComponentArgsRest(__VLS_400), false));
var __VLS_404;
var __VLS_405 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_406 = __VLS_402.slots.default;
// @ts-ignore
[measurementUnit,];
var __VLS_402;
var __VLS_403;
var __VLS_407;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_408 = __VLS_asFunctionalComponent1(__VLS_407, new __VLS_407(__assign({ 'onSelect': {} }, { value: "imperial" })));
var __VLS_409 = __VLS_408.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "imperial" })], __VLS_functionalComponentArgsRest(__VLS_408), false));
var __VLS_412;
var __VLS_413 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_414 = __VLS_410.slots.default;
// @ts-ignore
[];
var __VLS_410;
var __VLS_411;
var __VLS_415;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_416 = __VLS_asFunctionalComponent1(__VLS_415, new __VLS_415(__assign({ 'onSelect': {} }, { value: "nautical" })));
var __VLS_417 = __VLS_416.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "nautical" })], __VLS_functionalComponentArgsRest(__VLS_416), false));
var __VLS_420;
var __VLS_421 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_422 = __VLS_418.slots.default;
// @ts-ignore
[];
var __VLS_418;
var __VLS_419;
// @ts-ignore
[];
var __VLS_396;
// @ts-ignore
[];
var __VLS_390;
// @ts-ignore
[];
var __VLS_378;
var __VLS_423;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_424 = __VLS_asFunctionalComponent1(__VLS_423, new __VLS_423({}));
var __VLS_425 = __VLS_424.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_424), false));
var __VLS_428 = __VLS_426.slots.default;
var __VLS_429;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_430 = __VLS_asFunctionalComponent1(__VLS_429, new __VLS_429({
    inset: true,
}));
var __VLS_431 = __VLS_430.apply(void 0, __spreadArray([{
        inset: true,
    }], __VLS_functionalComponentArgsRest(__VLS_430), false));
var __VLS_434 = __VLS_432.slots.default;
// @ts-ignore
[];
var __VLS_432;
var __VLS_435;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_436 = __VLS_asFunctionalComponent1(__VLS_435, new __VLS_435({}));
var __VLS_437 = __VLS_436.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_436), false));
var __VLS_440 = __VLS_438.slots.default;
var __VLS_441;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioGroup | typeof __VLS_components.DropdownMenuRadioGroup} */
dropdown_menu_1.DropdownMenuRadioGroup;
// @ts-ignore
var __VLS_442 = __VLS_asFunctionalComponent1(__VLS_441, new __VLS_441({
    modelValue: (__VLS_ctx.coordinateFormat),
}));
var __VLS_443 = __VLS_442.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.coordinateFormat),
    }], __VLS_functionalComponentArgsRest(__VLS_442), false));
var __VLS_446 = __VLS_444.slots.default;
var __VLS_447;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_448 = __VLS_asFunctionalComponent1(__VLS_447, new __VLS_447(__assign({ 'onSelect': {} }, { value: "dms" })));
var __VLS_449 = __VLS_448.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "dms" })], __VLS_functionalComponentArgsRest(__VLS_448), false));
var __VLS_452;
var __VLS_453 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_454 = __VLS_450.slots.default;
// @ts-ignore
[coordinateFormat,];
var __VLS_450;
var __VLS_451;
var __VLS_455;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_456 = __VLS_asFunctionalComponent1(__VLS_455, new __VLS_455(__assign({ 'onSelect': {} }, { value: "dd" })));
var __VLS_457 = __VLS_456.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "dd" })], __VLS_functionalComponentArgsRest(__VLS_456), false));
var __VLS_460;
var __VLS_461 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_462 = __VLS_458.slots.default;
// @ts-ignore
[];
var __VLS_458;
var __VLS_459;
var __VLS_463;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuRadioItem | typeof __VLS_components.DropdownMenuRadioItem} */
dropdown_menu_1.DropdownMenuRadioItem;
// @ts-ignore
var __VLS_464 = __VLS_asFunctionalComponent1(__VLS_463, new __VLS_463(__assign({ 'onSelect': {} }, { value: "MGRS" })));
var __VLS_465 = __VLS_464.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { value: "MGRS" })], __VLS_functionalComponentArgsRest(__VLS_464), false));
var __VLS_468;
var __VLS_469 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_470 = __VLS_466.slots.default;
// @ts-ignore
[];
var __VLS_466;
var __VLS_467;
// @ts-ignore
[];
var __VLS_444;
// @ts-ignore
[];
var __VLS_438;
// @ts-ignore
[];
var __VLS_426;
// @ts-ignore
[];
var __VLS_295;
// @ts-ignore
[];
var __VLS_283;
var __VLS_471;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_472 = __VLS_asFunctionalComponent1(__VLS_471, new __VLS_471({}));
var __VLS_473 = __VLS_472.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_472), false));
var __VLS_476;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_477 = __VLS_asFunctionalComponent1(__VLS_476, new __VLS_476({}));
var __VLS_478 = __VLS_477.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_477), false));
var __VLS_481 = __VLS_479.slots.default;
var __VLS_482;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({}));
var __VLS_484 = __VLS_483.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_483), false));
var __VLS_487 = __VLS_485.slots.default;
// @ts-ignore
[];
var __VLS_485;
var __VLS_488;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({}));
var __VLS_490 = __VLS_489.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_489), false));
var __VLS_493 = __VLS_491.slots.default;
var __VLS_494;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_495 = __VLS_asFunctionalComponent1(__VLS_494, new __VLS_494(__assign({ 'onSelect': {} })));
var __VLS_496 = __VLS_495.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_495), false));
var __VLS_499;
var __VLS_500 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('action', 'browseSymbols');
            // @ts-ignore
            [emit,];
        } });
var __VLS_501 = __VLS_497.slots.default;
// @ts-ignore
[];
var __VLS_497;
var __VLS_498;
// @ts-ignore
[];
var __VLS_491;
// @ts-ignore
[];
var __VLS_479;
var __VLS_502;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSub | typeof __VLS_components.DropdownMenuSub} */
dropdown_menu_1.DropdownMenuSub;
// @ts-ignore
var __VLS_503 = __VLS_asFunctionalComponent1(__VLS_502, new __VLS_502({}));
var __VLS_504 = __VLS_503.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_503), false));
var __VLS_507 = __VLS_505.slots.default;
var __VLS_508;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubTrigger | typeof __VLS_components.DropdownMenuSubTrigger} */
dropdown_menu_1.DropdownMenuSubTrigger;
// @ts-ignore
var __VLS_509 = __VLS_asFunctionalComponent1(__VLS_508, new __VLS_508({}));
var __VLS_510 = __VLS_509.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_509), false));
var __VLS_513 = __VLS_511.slots.default;
// @ts-ignore
[];
var __VLS_511;
var __VLS_514;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSubContent | typeof __VLS_components.DropdownMenuSubContent} */
dropdown_menu_1.DropdownMenuSubContent;
// @ts-ignore
var __VLS_515 = __VLS_asFunctionalComponent1(__VLS_514, new __VLS_514({}));
var __VLS_516 = __VLS_515.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_515), false));
var __VLS_519 = __VLS_517.slots.default;
var __VLS_520;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_521 = __VLS_asFunctionalComponent1(__VLS_520, new __VLS_520({
    asChild: true,
}));
var __VLS_522 = __VLS_521.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_521), false));
var __VLS_525 = __VLS_523.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: (__VLS_ctx.route.meta.helpUrl ||
        'https://docs.orbat-mapper.app/guide/about-orbat-mapper'),
    target: "_blank",
});
// @ts-ignore
[route,];
var __VLS_523;
var __VLS_526;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_527 = __VLS_asFunctionalComponent1(__VLS_526, new __VLS_526(__assign({ 'onSelect': {} })));
var __VLS_528 = __VLS_527.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_527), false));
var __VLS_531;
var __VLS_532 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('uiAction', 'showKeyboardShortcuts');
            // @ts-ignore
            [emit,];
        } });
var __VLS_533 = __VLS_529.slots.default;
var __VLS_534;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_535 = __VLS_asFunctionalComponent1(__VLS_534, new __VLS_534(__assign({ class: "ml-4" })));
var __VLS_536 = __VLS_535.apply(void 0, __spreadArray([__assign({ class: "ml-4" })], __VLS_functionalComponentArgsRest(__VLS_535), false));
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
var __VLS_539 = __VLS_537.slots.default;
// @ts-ignore
[];
var __VLS_537;
// @ts-ignore
[];
var __VLS_529;
var __VLS_530;
// @ts-ignore
[];
var __VLS_517;
// @ts-ignore
[];
var __VLS_505;
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
});
exports.default = {};
