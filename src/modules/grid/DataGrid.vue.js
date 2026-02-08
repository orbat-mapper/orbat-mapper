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
var solid_1 = require("@heroicons/vue/20/solid");
var vue_table_1 = require("@tanstack/vue-table");
var vue_virtual_1 = require("@tanstack/vue-virtual");
var helpers_1 = require("@/modules/grid/helpers");
var core_1 = require("@vueuse/core");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var props = withDefaults(defineProps(), {
    rowHeight: 48,
    select: false,
    selected: function () { return []; },
    selectAll: false,
    showGlobalFilter: false,
    noIndeterminate: false,
});
var emit = defineEmits(["action", "update:selected"]);
var parentRef = (0, vue_1.ref)(null);
var query = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(query, 200);
var rowSelection = (0, vue_1.ref)({});
var selectColumn = {
    id: "select",
    size: 60,
    enableResizing: false,
    header: function (_a) {
        var table = _a.table;
        return (0, vue_1.h)("input", {
            type: "checkbox",
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            class: "m-2 rounded border-input accent-primary focus:ring-primary sm:left-6",
            onChange: table.getToggleAllRowsSelectedHandler(),
        });
    },
    cell: function (_a) {
        var row = _a.row;
        return (0, vue_1.h)("input", {
            type: "checkbox",
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: !props.noIndeterminate ? row.getIsSomeSelected() : undefined,
            class: "m-2 rounded border-input accent-primary focus:ring-primary sm:left-6",
            onChange: row.getToggleSelectedHandler(),
        });
    },
};
(0, vue_1.onMounted)(function () {
    if (props.selectAll)
        table.toggleAllRowsSelected(true);
});
(0, vue_1.watch)(function () { return props.data; }, function () {
    if (props.selectAll)
        table.toggleAllRowsSelected(true);
});
var computedColumns = (0, vue_1.computed)(function () {
    return __spreadArray([props.select && __assign({}, selectColumn)], props.columns, true).filter(function (e) { return e; });
});
var table = (0, vue_table_1.useVueTable)({
    get data() {
        return props.data;
    },
    initialState: props.initialState,
    state: {
        get rowSelection() {
            return rowSelection.value;
        },
        get globalFilter() {
            return debouncedQuery.value;
        },
    },
    enableRowSelection: true,
    columnResizeMode: "onChange",
    get columns() {
        return computedColumns.value;
    },
    getCoreRowModel: (0, vue_table_1.getCoreRowModel)(),
    getSortedRowModel: (0, vue_table_1.getSortedRowModel)(),
    getGroupedRowModel: (0, vue_table_1.getGroupedRowModel)(),
    getExpandedRowModel: (0, vue_table_1.getExpandedRowModel)(),
    getFilteredRowModel: (0, vue_table_1.getFilteredRowModel)(),
    autoResetExpanded: false,
    onRowSelectionChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, rowSelection); },
    // onGroupingChange: (updateOrValue) => valueUpdater(updateOrValue, grouping),
    onGlobalFilterChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, query); },
    getSubRows: props.getSubRows,
    filterFromLeafRows: true,
});
var rowVirtualizerOptions = (0, vue_1.computed)(function () {
    return {
        count: rows.value.length,
        getScrollElement: function () { return parentRef.value; },
        estimateSize: function () { return props.rowHeight; },
        overscan: 20,
    };
});
var rows = (0, vue_1.computed)(function () {
    return table.getRowModel().rows;
});
var rowVirtualizer = (0, vue_virtual_1.useVirtualizer)(rowVirtualizerOptions);
var virtualRows = (0, vue_1.computed)(function () { return rowVirtualizer.value.getVirtualItems(); });
(0, vue_1.watch)([rowSelection, debouncedQuery], function () {
    var sel = [];
    table.getFilteredSelectedRowModel().flatRows.forEach(function (row) {
        sel.push(row.original);
    });
    emit("update:selected", sel);
});
function onEsc(e) {
    if (query.value.length) {
        e.stopPropagation();
        query.value = "";
    }
}
var filteredRowCount = (0, vue_1.computed)(function () {
    var isGrouped = table.getState().grouping.length > 0;
    if (isGrouped) {
        return table.getRowCount() - table.getGroupedRowModel().rows.length;
    }
    return table.getRowCount();
});
var __VLS_defaults = {
    rowHeight: 48,
    select: false,
    selected: function () { return []; },
    selectAll: false,
    showGlobalFilter: false,
    noIndeterminate: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full min-h-0 flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
if (__VLS_ctx.showGlobalFilter) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex flex-none items-center justify-between pb-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    var __VLS_0 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.query), placeholder: "Filter rows" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.query), placeholder: "Filter rows" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.onEsc) });
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.filteredRowCount);
    (__VLS_ctx.rowCount === undefined ? __VLS_ctx.data.length : __VLS_ctx.rowCount);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "border-border relative min-h-0 flex-1 overflow-auto rounded-lg border shadow-sm" }, { ref: "parentRef", tabindex: "0" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "grid" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)(__assign({ class: "sticky top-0 z-10" }));
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.table.getHeaderGroups())); _i < _a.length; _i++) {
    var headerGroup = _a[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (headerGroup.id) }, { class: "divide-border flex divide-x" }));
    /** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
    var _loop_1 = function (header) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                (_a = header.column.getToggleSortingHandler()) === null || _a === void 0 ? void 0 : _a($event);
                // @ts-ignore
                [showGlobalFilter, query, onEsc, filteredRowCount, rowCount, rowCount, data, table,];
            } }, { key: (header.id) }), { style: ({
                width: "".concat(header.getSize(), "px"),
            }) }), { role: "columnheader" }), { class: "bg-muted text-foreground relative flex items-center justify-between overflow-hidden border-b px-4 py-3.5 text-left text-sm font-semibold select-none" }), { class: ({ 'cursor-pointer': header.column.getCanSort() }) }));
        /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        if (!header.isPlaceholder) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate" }));
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            var __VLS_7 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                render: (header.column.columnDef.header),
                props: (header.getContext()),
            }));
            var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
                    render: (header.column.columnDef.header),
                    props: (header.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_8), false));
            if (header.column.getCanSort() && header.column.getIsSorted()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground group-hover:bg-muted flex-none rounded" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:bg-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                if (header.column.getIsSorted() === 'asc') {
                    var __VLS_12 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.ArrowSmallDownIcon} */
                    solid_1.ArrowSmallDownIcon;
                    // @ts-ignore
                    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                else if (header.column.getIsSorted() === 'desc') {
                    var __VLS_17 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.ArrowSmallUpIcon} */
                    solid_1.ArrowSmallUpIcon;
                    // @ts-ignore
                    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
            }
            if (header.column.getCanResize()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign({ onDblclick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!header.isPlaceholder))
                            return;
                        if (!(header.column.getCanResize()))
                            return;
                        header.column.resetSize();
                        // @ts-ignore
                        [];
                    } }, { onMousedown: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!header.isPlaceholder))
                            return;
                        if (!(header.column.getCanResize()))
                            return;
                        header.getResizeHandler()($event);
                        // @ts-ignore
                        [];
                    } }), { onTouchstart: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!header.isPlaceholder))
                            return;
                        if (!(header.column.getCanResize()))
                            return;
                        header.getResizeHandler()($event);
                        // @ts-ignore
                        [];
                    } }), { onClick: function () { } }), { role: "separator" }), { class: "absolute top-0 right-0 z-5 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2" }));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['z-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-col-resize']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-red-100']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:w-2']} */ ;
            }
        }
        // @ts-ignore
        [];
    };
    for (var _b = 0, _c = __VLS_vFor((headerGroup.headers)); _b < _c.length; _b++) {
        var header = _c[_b][0];
        _loop_1(header);
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "relative" }, { style: ({ height: "".concat(__VLS_ctx.rowVirtualizer.getTotalSize(), "px") }) }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
for (var _d = 0, _e = __VLS_vFor((__VLS_ctx.virtualRows)); _d < _e.length; _d++) {
    var row = _e[_d][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign(__assign(__assign({ key: row.key }, { style: ({ transform: "translateY(".concat(row.start, "px)") }) }), { class: "group divide-border hover:bg-muted absolute flex h-10 w-full divide-x text-sm" }), { 'data-index': (row.index) }));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var _loop_2 = function (cell, idx) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign(__assign(__assign({ key: (cell.id), id: (cell.id) }, { style: ({
                width: "".concat(cell.column.getSize(), "px"),
            }) }), { class: "cell" }), { 'data-index': (idx) }));
        /** @type {__VLS_StyleScopedClasses['cell']} */ ;
        if (cell.getIsGrouped()) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(cell.getIsGrouped()))
                        return;
                    cell.row.toggleExpanded();
                    // @ts-ignore
                    [rowVirtualizer, virtualRows, rows,];
                } }, { type: "button" }), { class: "flex items-center" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            var __VLS_22 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
            solid_1.ChevronRightIcon;
            // @ts-ignore
            var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transition-transform" }, { class: ({
                    'rotate-90': cell.row.getIsExpanded(),
                }) })));
            var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transition-transform" }, { class: ({
                        'rotate-90': cell.row.getIsExpanded(),
                    }) })], __VLS_functionalComponentArgsRest(__VLS_23), false));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
            var __VLS_27 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                render: (cell.column.columnDef.cell),
                props: (cell.getContext()),
            }));
            var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([{
                    render: (cell.column.columnDef.cell),
                    props: (cell.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_28), false));
            (cell.row.subRows.length);
        }
        else if (!cell.getIsPlaceholder()) {
            var __VLS_32 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
                render: (cell.column.columnDef.cell),
                props: (cell.getContext()),
            }));
            var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
                    render: (cell.column.columnDef.cell),
                    props: (cell.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_33), false));
        }
        // @ts-ignore
        [];
    };
    for (var _f = 0, _g = __VLS_vFor((__VLS_ctx.rows[row.index].getVisibleCells())); _f < _g.length; _f++) {
        var _h = _g[_f], cell = _h[0], idx = _h[1];
        _loop_2(cell, idx);
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
