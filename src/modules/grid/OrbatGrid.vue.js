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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var OrbatGridHeader_vue_1 = require("@/modules/grid/OrbatGridHeader.vue");
var core_1 = require("@vueuse/core");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var OrbatGridGroupRow_vue_1 = require("@/modules/grid/OrbatGridGroupRow.vue");
var helpers_1 = require("./helpers");
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var props = withDefaults(defineProps(), {
    rowHeight: 48,
    select: false,
    selectAll: false,
});
var selectedRows = defineModel("selected", { default: function () { return []; } });
var emit = defineEmits(["action"]);
var sortDirection = (0, vue_1.ref)("asc");
var sortField = (0, vue_1.ref)(null);
var isDragging = (0, vue_1.ref)(false);
var columnDefs = (0, vue_1.ref)(props.columns.map(function (column) {
    var _a, _b, _c, _d, _e;
    return (__assign(__assign({}, column), { label: column.label || column.field, id: column.id || (0, utils_1.nanoid)(), width: column.width || 300, type: column.type || "text", menu: column.menu || [], resizable: (_a = column.resizable) !== null && _a !== void 0 ? _a : true, sortable: (_b = column.sortable) !== null && _b !== void 0 ? _b : false, sorted: null, rowGroup: (_c = column.rowGroup) !== null && _c !== void 0 ? _c : false, hide: (_d = column.hide) !== null && _d !== void 0 ? _d : false, groupOpen: (_e = column.groupOpen) !== null && _e !== void 0 ? _e : true, objectPath: column.field.split(".") }));
}));
var visibleColumnDefs = (0, vue_1.computed)(function () { return columnDefs.value.filter(function (c) { return !c.hide; }); });
var columnWidths = (0, vue_1.ref)(Object.fromEntries(columnDefs.value.map(function (e) { return [e.id, e.width]; })));
function ascending(a, b) {
    return (a || "") > (b || "") ? 1 : -1;
}
function descending(a, b) {
    return (a || "") < (b || "") ? 1 : -1;
}
var sortedData = (0, vue_1.computed)(function () {
    if (sortField.value) {
        return __spreadArray([], props.data, true).sort(function (a, b) {
            return sortDirection.value === "asc"
                ? ascending(a[sortField.value], b[sortField.value])
                : descending(a[sortField.value], b[sortField.value]);
        });
    }
    return __spreadArray([], props.data, true);
});
var groupField = (0, vue_1.computed)(function () { var _a; return (_a = columnDefs.value.filter(function (c) { return c.rowGroup; })[0]) === null || _a === void 0 ? void 0 : _a.field; });
var groupedData = (0, vue_1.computed)(function () {
    if (groupField.value)
        return (0, utils_1.groupBy)(sortedData.value, groupField.value);
    return sortedData.value;
});
var openMap = (0, vue_1.ref)(new Map());
var visibleData = (0, vue_1.computed)(function () {
    if (groupField.value) {
        return __spreadArray([], groupedData.value.entries(), true).map(function (_a) {
            var g = _a[0], v = _a[1];
            return [
                { type: "group", item: g },
                openMap.value.get(g) === false
                    ? []
                    : v.map(function (e) { return ({ type: "row", item: e }); }),
            ];
        })
            .flat(2);
    }
    else if (Array.isArray(groupedData.value))
        return groupedData.value.map(function (e) { return ({ type: "row", item: e }); });
    return [];
});
var _c = (0, core_1.useVirtualList)(visibleData, {
    itemHeight: props.rowHeight,
    overscan: 10,
}), list = _c.list, containerProps = _c.containerProps, wrapperProps = _c.wrapperProps, scrollTo = _c.scrollTo;
var indeterminate = (0, vue_1.computed)(function () { return selectedRows.value.length > 0 && selectedRows.value.length < props.data.length; });
var checkedState = (0, vue_1.computed)(function () {
    if (selectedRows.value.length > 0 && selectedRows.value.length < props.data.length)
        return "indeterminate";
    if (selectedRows.value.length === props.data.length)
        return "checked";
    return false;
});
function toggleSelectAll(isChecked) {
    if (isChecked) {
        selectedRows.value = __spreadArray([], props.data, true);
    }
    else {
        selectedRows.value = [];
    }
}
function onColumnSort(column) {
    if (isDragging.value)
        return;
    if (sortField.value === column.field) {
        sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
    }
    else {
        sortField.value = column.field;
        sortDirection.value = "asc";
    }
    columnDefs.value.forEach(function (c) {
        c.sorted = sortField.value === c.field ? sortDirection.value : null;
    });
}
function onDragging(value) {
    isDragging.value = value;
}
(0, vue_1.onMounted)(function () {
    if (props.selectAll && props.select) {
        toggleSelectAll(true);
    }
});
function getGroupChecked(item) {
    if (props.select) {
        var groupItems = groupedData.value.get(item);
        var checked = groupItems.every(function (e) { return selectedRows.value.includes(e); });
        return {
            checked: checked,
            indeterminate: !checked && groupItems.some(function (e) { return selectedRows.value.includes(e); }),
        };
    }
    else {
        return { checked: false, indeterminate: false };
    }
}
function toggleGroupSelect(item, event) {
    var isChecked = event.target.checked;
    var groupItems = groupedData.value.get(item);
    if (isChecked) {
        selectedRows.value = __spreadArray([], new Set(__spreadArray(__spreadArray([], selectedRows.value, true), groupItems, true)), true);
    }
    else {
        selectedRows.value = selectedRows.value.filter(function (id) { return !groupItems.includes(id); });
    }
}
var __VLS_defaultModels = {
    'selected': function () { return []; },
};
var __VLS_modelEmit;
var __VLS_defaults = {
    rowHeight: 48,
    select: false,
    selectAll: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign({}, (__VLS_ctx.containerProps)), { class: "relative h-full rounded-lg border shadow-sm" }), { class: ({ 'touch-none': __VLS_ctx.isDragging }) }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['touch-none']} */ ;
var __VLS_0 = OrbatGridHeader_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign(__assign(__assign(__assign({ 'onToggleSelect': {} }, { 'onSort': {} }), { 'onDragging': {} }), { columnDefs: (__VLS_ctx.visibleColumnDefs), rowHeight: (__VLS_ctx.rowHeight) }), { class: "" }), { select: (__VLS_ctx.select), checkedState: (__VLS_ctx.checkedState), columnWidths: (__VLS_ctx.columnWidths) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onToggleSelect': {} }, { 'onSort': {} }), { 'onDragging': {} }), { columnDefs: (__VLS_ctx.visibleColumnDefs), rowHeight: (__VLS_ctx.rowHeight) }), { class: "" }), { select: (__VLS_ctx.select), checkedState: (__VLS_ctx.checkedState), columnWidths: (__VLS_ctx.columnWidths) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ toggleSelect: {} },
    { onToggleSelect: (__VLS_ctx.toggleSelectAll) });
var __VLS_7 = ({ sort: {} },
    { onSort: (__VLS_ctx.onColumnSort) });
var __VLS_8 = ({ dragging: {} },
    { onDragging: (__VLS_ctx.onDragging) });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({}, (__VLS_ctx.wrapperProps)));
var _loop_1 = function (index, item, type) {
    (index);
    if (type === 'row') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ style: ({
                height: "".concat(__VLS_ctx.rowHeight, "px"),
            }) }, { class: "group hover:bg-muted/50 flex w-full divide-x divide-gray-200" }));
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
        if (__VLS_ctx.select) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-foreground flex w-10 shrink-0 items-center justify-center overflow-hidden border-b px-4 py-3.5" }));
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
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign({ type: "checkbox", id: (item.id), value: (item) }, { class: "text-primary focus:ring-ring rounded border-gray-300 sm:left-6" }));
            (__VLS_ctx.selectedRows);
            /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:left-6']} */ ;
        }
        var _loop_2 = function (column) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ style: ({
                    width: "".concat(__VLS_ctx.columnWidths[column.id], "px"),
                    minWidth: "".concat(__VLS_ctx.columnWidths[column.id], "px"),
                }) }, { class: "group flex flex-0 items-center overflow-hidden border-b p-4" }), { tabindex: "0" }));
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            if (column.type === 'sidc') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
                /** @type {__VLS_StyleScopedClasses['']} */ ;
                var __VLS_9 = MilitarySymbol_vue_1.default;
                // @ts-ignore
                var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
                    sidc: (__VLS_ctx.getValue(item, column.objectPath)),
                    size: (20),
                }));
                var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
                        sidc: (__VLS_ctx.getValue(item, column.objectPath)),
                        size: (20),
                    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
            }
            else if (column.type === 'dots') {
                var __VLS_14 = DotsMenu_vue_1.default;
                // @ts-ignore
                var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign({ 'onAction': {} }, { items: (column.menu) }), { class: "opacity-0 group-hover:opacity-100 group-focus:opacity-100" })));
                var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { items: (column.menu) }), { class: "opacity-0 group-hover:opacity-100 group-focus:opacity-100" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
                var __VLS_19 = void 0;
                var __VLS_20 = ({ action: {} },
                    { onAction: function () {
                            var _a = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                _a[_i] = arguments[_i];
                            }
                            var $event = _a[0];
                            if (!(type === 'row'))
                                return;
                            if (!!(column.type === 'sidc'))
                                return;
                            if (!(column.type === 'dots'))
                                return;
                            __VLS_ctx.emit('action', $event, { data: item, index: index });
                            // @ts-ignore
                            [containerProps, isDragging, visibleColumnDefs, visibleColumnDefs, rowHeight, rowHeight, select, select, checkedState, columnWidths, columnWidths, columnWidths, toggleSelectAll, onColumnSort, onDragging, wrapperProps, list, selectedRows, helpers_1.getValue, emit,];
                        } });
                /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-focus:opacity-100']} */ ;
            }
            else if (column.type === 'text') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground truncate text-sm whitespace-nowrap" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
                (__VLS_ctx.getValue(item, column.objectPath));
            }
            // @ts-ignore
            [helpers_1.getValue,];
        };
        for (var _g = 0, _h = __VLS_vFor((__VLS_ctx.visibleColumnDefs)); _g < _h.length; _g++) {
            var column = _h[_g][0];
            _loop_2(column);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "" }));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
    }
    else if (type === 'group') {
        var __VLS_21 = OrbatGridGroupRow_vue_1.default;
        // @ts-ignore
        var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign(__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onChange': {} }), { item: (item), select: (__VLS_ctx.select) }), { style: ({
                height: "".concat(__VLS_ctx.rowHeight, "px"),
            }) }), { open: ((_a = __VLS_ctx.openMap.get(item)) !== null && _a !== void 0 ? _a : true) }), (__VLS_ctx.getGroupChecked(item)))));
        var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onChange': {} }), { item: (item), select: (__VLS_ctx.select) }), { style: ({
                    height: "".concat(__VLS_ctx.rowHeight, "px"),
                }) }), { open: ((_b = __VLS_ctx.openMap.get(item)) !== null && _b !== void 0 ? _b : true) }), (__VLS_ctx.getGroupChecked(item)))], __VLS_functionalComponentArgsRest(__VLS_22), false));
        var __VLS_26 = void 0;
        var __VLS_27 = ({ toggle: {} },
            { onToggle: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(type === 'row'))
                        return;
                    if (!(type === 'group'))
                        return;
                    __VLS_ctx.openMap.set(item, !!$event);
                    // @ts-ignore
                    [rowHeight, select, openMap, openMap, getGroupChecked,];
                } });
        var __VLS_28 = ({ change: {} },
            { onChange: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(type === 'row'))
                        return;
                    if (!(type === 'group'))
                        return;
                    __VLS_ctx.toggleGroupSelect(item, $event);
                    // @ts-ignore
                    [toggleGroupSelect,];
                } });
    }
    // @ts-ignore
    [];
};
var __VLS_17, __VLS_18, __VLS_24, __VLS_25;
for (var _i = 0, _d = __VLS_vFor((__VLS_ctx.list)); _i < _d.length; _i++) {
    var _e = _d[_i][0], index = _e.index, _f = _e.data, item = _f.item, type = _f.type;
    _loop_1(index, item, type);
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
