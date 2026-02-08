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
var GridHeaderResizeHandle_vue_1 = require("@/modules/grid/GridHeaderResizeHandle.vue");
var props = withDefaults(defineProps(), { select: false, checkedState: false });
var emit = defineEmits(["toggleSelect", "sort", "dragging"]);
var widths = defineModel("columnWidths", { required: true });
function toggleSelectAll(event) {
    var isChecked = event.target.checked;
    emit("toggleSelect", isChecked);
}
function updateWidth(columnId, newWidth) {
    widths.value[columnId] = newWidth;
}
function resetWidth(columnId) {
    var _a;
    widths.value[columnId] =
        ((_a = props.columnDefs.filter(function (c) { return c.id === columnId; })[0]) === null || _a === void 0 ? void 0 : _a.width) || 300;
}
function onColumnClick(column) {
    if (column.sortable) {
        emit("sort", column);
    }
}
var __VLS_modelEmit;
var __VLS_defaults = { select: false, checkedState: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "sticky top-0 z-10" }));
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex divide-x divide-gray-200" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
if (__VLS_ctx.select) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted text-foreground flex w-10 shrink-0 items-center justify-center overflow-hidden border-b px-4 py-3.5" }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign({ onChange: (__VLS_ctx.toggleSelectAll) }, { type: "checkbox" }), { class: "text-primary focus:ring-ring rounded border-gray-300 sm:left-6" }), { checked: (__VLS_ctx.checkedState === 'checked' || __VLS_ctx.checkedState === 'indeterminate'), indeterminate: (__VLS_ctx.checkedState === 'indeterminate') }));
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:left-6']} */ ;
}
var _loop_1 = function (column) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onColumnClick(column);
            // @ts-ignore
            [select, toggleSelectAll, checkedState, checkedState, checkedState, columnDefs, onColumnClick,];
        } }, { key: (column.id) }), { style: ({
            width: "".concat(__VLS_ctx.widths[column.id], "px"),
            minWidth: "".concat(__VLS_ctx.widths[column.id], "px"),
        }) }), { role: "columnheader" }), { class: "bg-muted text-foreground relative flex w-full flex-0 items-center justify-between overflow-hidden border-b px-4 py-3.5 text-left text-sm font-semibold" }), { class: ({ 'cursor-pointer': column.sortable }) }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate" }));
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (column.label);
    if (column.sortable && column.sorted) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground group-hover:bg-accent flex-none rounded" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:bg-accent']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        if (column.sorted === 'asc') {
            var __VLS_0 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ArrowSmallDownIcon} */
            solid_1.ArrowSmallDownIcon;
            // @ts-ignore
            var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
            var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
        else {
            var __VLS_5 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ArrowSmallUpIcon} */
            solid_1.ArrowSmallUpIcon;
            // @ts-ignore
            var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
            var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
    }
    if (column.resizable) {
        var __VLS_10 = GridHeaderResizeHandle_vue_1.default;
        // @ts-ignore
        var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign(__assign(__assign(__assign({ 'onUpdate': {} }, { 'onDblclick': {} }), { 'onDragging': {} }), { width: (__VLS_ctx.columnWidths[column.id]) }), { class: "z-5" })));
        var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUpdate': {} }, { 'onDblclick': {} }), { 'onDragging': {} }), { width: (__VLS_ctx.columnWidths[column.id]) }), { class: "z-5" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
        var __VLS_15 = void 0;
        var __VLS_16 = ({ update: {} },
            { onUpdate: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(column.resizable))
                        return;
                    __VLS_ctx.updateWidth(column.id, $event);
                    // @ts-ignore
                    [widths, widths, columnWidths, updateWidth,];
                } });
        var __VLS_17 = ({ dblclick: {} },
            { onDblclick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(column.resizable))
                        return;
                    __VLS_ctx.resetWidth(column.id);
                    // @ts-ignore
                    [resetWidth,];
                } });
        var __VLS_18 = ({ dragging: {} },
            { onDragging: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(column.resizable))
                        return;
                    __VLS_ctx.emit('dragging', $event);
                    // @ts-ignore
                    [emit,];
                } });
        /** @type {__VLS_StyleScopedClasses['z-5']} */ ;
    }
    // @ts-ignore
    [];
};
var __VLS_13, __VLS_14;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.columnDefs)); _i < _a.length; _i++) {
    var column = _a[_i][0];
    _loop_1(column);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
