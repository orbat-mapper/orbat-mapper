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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var playbackStore_1 = require("@/stores/playbackStore");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var button_1 = require("@/components/ui/button");
var store = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store;
var tm = (0, timeFormatStore_1.useTimeFormatStore)();
var playback = (0, playbackStore_1.usePlaybackStore)();
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted-foreground/20 dark:bg-muted-foreground/30 items-center rounded-lg px-1 sm:flex" }));
/** @type {__VLS_StyleScopedClasses['bg-muted-foreground/20']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-muted-foreground/30']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Undo action (ctrl+z)" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Undo action (ctrl+z)" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.togglePlayback();
            // @ts-ignore
            [playback,];
        } });
var __VLS_7 = __VLS_3.slots.default;
if (__VLS_ctx.playback.playbackRunning) {
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPause} */
    vue_mdi_1.IconPause;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "size-6" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
}
else {
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPlay} */
    vue_mdi_1.IconPlay;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "size-6" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
}
// @ts-ignore
[playback,];
var __VLS_3;
var __VLS_4;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
dropdown_menu_1.DropdownMenu;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
dropdown_menu_1.DropdownMenuTrigger;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ class: "text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-ring items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset disabled:opacity-50 sm:block" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-ring items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset disabled:opacity-50 sm:block" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.IconChevronDown} */
vue_mdi_1.IconChevronDown;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ class: "block size-6" })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ class: "block size-6" })], __VLS_functionalComponentArgsRest(__VLS_31), false));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_27;
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    sideOffset: (10),
}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{
        sideOffset: (10),
    }], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_40 = __VLS_38.slots.default;
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
            __VLS_ctx.playback.togglePlayback();
            // @ts-ignore
            [playback,];
        } });
var __VLS_48 = __VLS_44.slots.default;
if (__VLS_ctx.playback.playbackRunning) {
    var __VLS_49 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPause} */
    vue_mdi_1.IconPause;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
}
else {
    var __VLS_54 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconPlay} */
    vue_mdi_1.IconPlay;
    // @ts-ignore
    var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_55), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.playback.playbackRunning ? "Pause" : "Play");
var __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_64 = __VLS_62.slots.default;
// @ts-ignore
[playback, playback,];
var __VLS_62;
// @ts-ignore
[];
var __VLS_44;
var __VLS_45;
var __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65(__assign({ 'onSelect': {} })));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_70;
var __VLS_71 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.increaseSpeed();
            // @ts-ignore
            [playback,];
        } });
var __VLS_72 = __VLS_68.slots.default;
var __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.IconSpeedometer} */
vue_mdi_1.IconSpeedometer;
// @ts-ignore
var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign({ class: "mr-2 h-4 w-4" })));
var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_74), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_79), false));
var __VLS_83 = __VLS_81.slots.default;
// @ts-ignore
[];
var __VLS_81;
// @ts-ignore
[];
var __VLS_68;
var __VLS_69;
var __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84(__assign({ 'onSelect': {} })));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ 'onSelect': {} })], __VLS_functionalComponentArgsRest(__VLS_85), false));
var __VLS_89;
var __VLS_90 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.decreaseSpeed();
            // @ts-ignore
            [playback,];
        } });
var __VLS_91 = __VLS_87.slots.default;
var __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.IconSpeedometerSlow} */
vue_mdi_1.IconSpeedometerSlow;
// @ts-ignore
var __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92(__assign({ class: "mr-2 h-4 w-4" })));
var __VLS_94 = __VLS_93.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_93), false));
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
var __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuShortcut | typeof __VLS_components.DropdownMenuShortcut} */
dropdown_menu_1.DropdownMenuShortcut;
// @ts-ignore
var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({}));
var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_98), false));
var __VLS_102 = __VLS_100.slots.default;
// @ts-ignore
[];
var __VLS_100;
// @ts-ignore
[];
var __VLS_87;
var __VLS_88;
var __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuSeparator} */
dropdown_menu_1.DropdownMenuSeparator;
// @ts-ignore
var __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_104), false));
var __VLS_108;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuCheckboxItem | typeof __VLS_components.DropdownMenuCheckboxItem} */
dropdown_menu_1.DropdownMenuCheckboxItem;
// @ts-ignore
var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108(__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.playback.playbackLooping) })));
var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { modelValue: (__VLS_ctx.playback.playbackLooping) })], __VLS_functionalComponentArgsRest(__VLS_109), false));
var __VLS_113;
var __VLS_114 = ({ select: {} },
    { onSelect: function () { } });
var __VLS_115 = __VLS_111.slots.default;
// @ts-ignore
[playback,];
var __VLS_111;
var __VLS_112;
var __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116(__assign({ 'onSelect': {} }, { inset: true })));
var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true })], __VLS_functionalComponentArgsRest(__VLS_117), false));
var __VLS_121;
var __VLS_122 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.addMarker(__VLS_ctx.store.state.currentTime);
            // @ts-ignore
            [playback, store,];
        } });
var __VLS_123 = __VLS_119.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-1" }));
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
(__VLS_ctx.playback.startMarker && __VLS_ctx.playback.endMarker
    ? 2
    : __VLS_ctx.playback.startMarker || __VLS_ctx.playback.endMarker
        ? 1
        : 0);
// @ts-ignore
[playback, playback, playback, playback,];
var __VLS_119;
var __VLS_120;
var __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124(__assign({ 'onSelect': {} }, { inset: true, disabled: (!__VLS_ctx.playback.startMarker && !__VLS_ctx.playback.endMarker) })));
var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { inset: true, disabled: (!__VLS_ctx.playback.startMarker && !__VLS_ctx.playback.endMarker) })], __VLS_functionalComponentArgsRest(__VLS_125), false));
var __VLS_129;
var __VLS_130 = ({ select: {} },
    { onSelect: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.playback.clearMarkers();
            // @ts-ignore
            [playback, playback, playback,];
        } });
var __VLS_131 = __VLS_127.slots.default;
// @ts-ignore
[];
var __VLS_127;
var __VLS_128;
if (__VLS_ctx.playback.startMarker !== undefined) {
    var __VLS_132 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
        disabled: true,
    }));
    var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([{
            disabled: true,
        }], __VLS_functionalComponentArgsRest(__VLS_133), false));
    var __VLS_137 = __VLS_135.slots.default;
    var __VLS_138 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClockStart} */
    vue_mdi_1.IconClockStart;
    // @ts-ignore
    var __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_140 = __VLS_139.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_139), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.tm.scenarioFormatter.format(__VLS_ctx.playback.startMarker));
    // @ts-ignore
    [playback, playback, tm,];
    var __VLS_135;
}
if (__VLS_ctx.playback.endMarker !== undefined) {
    var __VLS_143 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
    dropdown_menu_1.DropdownMenuItem;
    // @ts-ignore
    var __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
        disabled: true,
    }));
    var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([{
            disabled: true,
        }], __VLS_functionalComponentArgsRest(__VLS_144), false));
    var __VLS_148 = __VLS_146.slots.default;
    var __VLS_149 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClockEnd} */
    vue_mdi_1.IconClockEnd;
    // @ts-ignore
    var __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149(__assign({ class: "mr-2 h-4 w-4" })));
    var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([__assign({ class: "mr-2 h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_150), false));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.tm.scenarioFormatter.format(__VLS_ctx.playback.endMarker));
    // @ts-ignore
    [playback, playback, tm,];
    var __VLS_146;
}
// @ts-ignore
[];
var __VLS_38;
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
