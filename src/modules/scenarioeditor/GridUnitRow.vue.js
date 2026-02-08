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
var solid_1 = require("@heroicons/vue/20/solid");
var GridEditableCell_vue_1 = require("@/modules/scenarioeditor/GridEditableCell.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var props = defineProps();
var emit = defineEmits([
    "toggle",
    "expand",
    "updateUnit",
    "nextCell",
    "activeItem",
    "edit",
]);
var getCombinedSymbolOptions = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).unitActions.getCombinedSymbolOptions;
function toggleOpen() {
    props.unit._isOpen = !props.unit._isOpen;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ id: ("item-".concat(__VLS_ctx.unit.id)) }, { class: "divide-border hover:bg-muted/50 divide-x" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "relative" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
if (__VLS_ctx.isActive) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-primary absolute inset-y-0 right-0 w-0.5" }));
    /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign({ onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [unit, isActive, toggleOpen,];
    } }, { onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [toggleOpen,];
    } }), { id: ("cell-".concat(__VLS_ctx.itemIndex, "-0")) }), { class: "border-card text-foreground focus-within:border-ring flex items-center border-2 py-3 text-sm whitespace-nowrap outline-0" }), { style: ("padding-left: ".concat(__VLS_ctx.level + 1, "rem")) }), { tabindex: "0" }));
/** @type {__VLS_StyleScopedClasses['border-card']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-0']} */ ;
if (__VLS_ctx.unit.subUnits.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.unit.subUnits.length))
                return;
            __VLS_ctx.toggleOpen();
            // @ts-ignore
            [unit, toggleOpen, itemIndex, level,];
        } }));
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
    solid_1.ChevronRightIcon;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
            'rotate-90': __VLS_ctx.unit._isOpen,
        }) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
                'rotate-90': __VLS_ctx.unit._isOpen,
            }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
}
var __VLS_5 = UnitSymbol_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign(__assign({ sidc: (__VLS_ctx.unit.sidc) }, { class: "ml-2 max-w-10" }), { class: ({ 'ml-8': !__VLS_ctx.unit.subUnits.length }) }), { options: (__assign(__assign({}, __VLS_ctx.getCombinedSymbolOptions(__VLS_ctx.unit)), { outlineColor: 'rgba(255, 255, 255, 0.8)', outlineWidth: 10 })) })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign(__assign({ sidc: (__VLS_ctx.unit.sidc) }, { class: "ml-2 max-w-10" }), { class: ({ 'ml-8': !__VLS_ctx.unit.subUnits.length }) }), { options: (__assign(__assign({}, __VLS_ctx.getCombinedSymbolOptions(__VLS_ctx.unit)), { outlineColor: 'rgba(255, 255, 255, 0.8)', outlineWidth: 10 })) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "ml-2 truncate text-sm font-medium hover:underline" }));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
(__VLS_ctx.unit.name);
var _loop_1 = function (column, colIndex) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ key: (column.value) }, { class: "" }));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_10 = GridEditableCell_vue_1.default || GridEditableCell_vue_1.default;
    // @ts-ignore
    var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign(__assign(__assign(__assign({ 'onUpdate': {} }, { 'onNextCell': {} }), { 'onActive': {} }), { 'onEdit': {} }), { value: (__VLS_ctx.unit[column.value]), rowIndex: (__VLS_ctx.itemIndex), colIndex: (colIndex + 1), cellType: (column.type) })));
    var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUpdate': {} }, { 'onNextCell': {} }), { 'onActive': {} }), { 'onEdit': {} }), { value: (__VLS_ctx.unit[column.value]), rowIndex: (__VLS_ctx.itemIndex), colIndex: (colIndex + 1), cellType: (column.type) })], __VLS_functionalComponentArgsRest(__VLS_11), false));
    var __VLS_15 = void 0;
    var __VLS_16 = ({ update: {} },
        { onUpdate: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                __VLS_ctx.emit('updateUnit', __VLS_ctx.unit.id, (_a = {}, _a[column.value] = $event, _a));
                // @ts-ignore
                [unit, unit, unit, unit, unit, unit, unit, itemIndex, getCombinedSymbolOptions, columns, emit,];
            } });
    var __VLS_17 = ({ nextCell: {} },
        { onNextCell: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('nextCell', $event);
                // @ts-ignore
                [emit,];
            } });
    var __VLS_18 = ({ active: {} },
        { onActive: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('activeItem', column.value);
                // @ts-ignore
                [emit,];
            } });
    var __VLS_19 = ({ edit: {} },
        { onEdit: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('edit', __VLS_ctx.unit, column.value, $event);
                // @ts-ignore
                [unit, emit,];
            } });
    // @ts-ignore
    [];
};
var __VLS_13, __VLS_14;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.columns)); _i < _a.length; _i++) {
    var _b = _a[_i], column = _b[0], colIndex = _b[1];
    _loop_1(column, colIndex);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
