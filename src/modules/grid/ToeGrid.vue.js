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
var vue_table_1 = require("@tanstack/vue-table");
var helpers_1 = require("@/modules/grid/helpers");
var core_1 = require("@vueuse/core");
var ToeGridTableMenu_vue_1 = require("@/modules/scenarioeditor/ToeGridTableMenu.vue");
var pinia_1 = require("pinia");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {
    select: false,
    selectAll: false,
    showGlobalFilter: false,
    noIndeterminate: false,
    dense: true,
    editMode: true,
});
var selected = defineModel("selected", { default: function () { return []; } });
var editedId = defineModel("editedId");
var editMode = defineModel("editMode");
var emit = defineEmits(["action"]);
var query = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(query, 200);
var rowSelection = (0, vue_1.ref)({});
var _c = props.tableStore
    ? (0, pinia_1.storeToRefs)(props.tableStore)
    : {
        columnVisibility: (0, vue_1.ref)({}),
        columnSizing: (0, vue_1.ref)({}),
        columnSorting: (0, vue_1.ref)([]),
    }, columnVisibility = _c.columnVisibility, columnSizing = _c.columnSizing, columnSorting = _c.columnSorting;
var selectColumn = {
    id: "select",
    size: 40,
    enableResizing: false,
    header: function (_a) {
        var table = _a.table;
        return (0, vue_1.h)("input", {
            type: "checkbox",
            checked: table.getIsAllRowsSelected(),
            indeterminate: selected.value.length,
            class: "rounded border-gray-300 text-primary focus:ring-ring",
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
            class: "rounded border-gray-300 text-primary focus:ring-ring",
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
(0, vue_1.watch)(editMode, function (newValue) {
    if (newValue === false) {
        editedId.value = null;
    }
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
        get columnVisibility() {
            return columnVisibility.value;
        },
        get columnSizing() {
            return columnSizing.value;
        },
        get sorting() {
            return columnSorting.value;
        },
    },
    getRowId: function (row) { return row.id; },
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
    onColumnVisibilityChange: function (updateOrValue) {
        return (0, helpers_1.valueUpdater)(updateOrValue, columnVisibility);
    },
    onColumnSizingChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, columnSizing); },
    onSortingChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, columnSorting); },
    getSubRows: props.getSubRows,
    filterFromLeafRows: true,
});
var rows = (0, vue_1.computed)(function () {
    return table.getRowModel().rows;
});
(0, vue_1.watch)([rowSelection, debouncedQuery], function () {
    var sel = [];
    table.getFilteredSelectedRowModel().flatRows.forEach(function (row) {
        sel.push(row.original);
    });
    selected.value = sel;
});
function onDblClick(row, e) {
    if (props.isLocked)
        return;
    editMode.value = true;
    editedId.value = row.original.id;
}
(0, vue_1.watch)(function () { return props.select; }, function (newValue) {
    if (!newValue) {
        table.toggleAllRowsSelected(false);
    }
});
var __VLS_defaultModels = {
    'selected': function () { return []; },
};
var __VLS_modelEmit;
var __VLS_defaults = {
    select: false,
    selectAll: false,
    showGlobalFilter: false,
    noIndeterminate: false,
    dense: true,
    editMode: true,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flow-root" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-root']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4 max-h-96 overflow-x-auto whitespace-nowrap" }));
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-96']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "inline-block min-w-full align-middle" }));
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "w-full border-separate border-spacing-0 text-left text-sm/6" }, { tabindex: "0" }));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-separate']} */ ;
/** @type {__VLS_StyleScopedClasses['border-spacing-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm/6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)(__assign({ class: "bg-muted cursor-pointer" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
for (var _i = 0, _d = __VLS_vFor((__VLS_ctx.table.getHeaderGroups())); _i < _d.length; _i++) {
    var headerGroup = _d[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (headerGroup.id) }, { class: "" }));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var _loop_1 = function (header) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign(__assign(__assign({ onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                (_a = header.column.getToggleSortingHandler()) === null || _a === void 0 ? void 0 : _a($event);
                // @ts-ignore
                [table,];
            } }, { key: (header.id), role: "columnheader" }), { class: "bg-muted sticky top-0 z-10 max-w-0 min-w-0 truncate border-b border-b-slate-950/10 px-4 py-2 font-medium first:border-l-0 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4)) dark:border-b-white/10" }), { style: ({
                width: "".concat(header.getSize(), "px"),
            }) }));
        /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b-slate-950/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['first:border-l-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['first:pl-(--gutter,--spacing(4))']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:pr-(--gutter,--spacing(4))']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:border-b-white/10']} */ ;
        if (!header.isPlaceholder) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }, { class: ([
                    ((_a = header.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.align) === 'right'
                        ? 'flex-row-reverse'
                        : '',
                ]) }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            var __VLS_0 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                render: (header.column.columnDef.header),
                props: (header.getContext()),
            }));
            var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
                    render: (header.column.columnDef.header),
                    props: (header.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_1), false));
            if (header.column.getCanSort() && header.column.getIsSorted()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground dark:text-muted-foreground group-hover:bg-muted flex-none px-1" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['dark:text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:bg-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
                (header.column.getIsSorted() === "asc" ? "&darr;" : "&uarr;");
            }
            if (header.column.getCanResize()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign({ onDblclick: function () {
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
                    } }), { onClick: function () { } }), { role: "separator" }), { class: "absolute top-0 right-0 z-5 h-full w-2 cursor-col-resize border-r-2 border-r-slate-950/5 select-none hover:bg-red-100 dark:border-r-white/10" }), { class: (header.column.getIsResizing() ? 'bg-red-100' : '') }));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['z-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-col-resize']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-r-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-r-slate-950/5']} */ ;
                /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-red-100']} */ ;
                /** @type {__VLS_StyleScopedClasses['dark:border-r-white/10']} */ ;
            }
        }
        // @ts-ignore
        [];
    };
    for (var _e = 0, _f = __VLS_vFor((headerGroup.headers)); _e < _f.length; _e++) {
        var header = _f[_e][0];
        _loop_1(header);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)(__assign({ class: "bg-muted sticky top-0 right-0 z-10 truncate border-b border-b-slate-950/10 px-4 py-2 text-right font-medium first:border-l-0 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4)) dark:border-b-white/10" }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-slate-950/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['first:border-l-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['first:pl-(--gutter,--spacing(4))']} */ ;
    /** @type {__VLS_StyleScopedClasses['last:pr-(--gutter,--spacing(4))']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:border-b-white/10']} */ ;
    var __VLS_5 = ToeGridTableMenu_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        table: (__VLS_ctx.table),
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            table: (__VLS_ctx.table),
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    // @ts-ignore
    [table,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "text-wrap break-words" }));
/** @type {__VLS_StyleScopedClasses['text-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['break-words']} */ ;
var _loop_2 = function (row) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign(__assign({ onDblclick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onDblClick(row, $event);
            // @ts-ignore
            [rows, onDblClick,];
        } }, { key: (row.id), 'data-index': (row.index) }), { class: "dark:even:bg-foreground/[2.5%] even:bg-zinc-950/[2.5%]" }));
    /** @type {__VLS_StyleScopedClasses['dark:even:bg-foreground/[2.5%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['even:bg-zinc-950/[2.5%]']} */ ;
    if (row.original.id === __VLS_ctx.editedId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "" }, { colspan: (row.getVisibleCells().length + 1) }));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        __VLS_10 = {
            row: (row.original),
        };
    }
    else {
        for (var _j = 0, _k = __VLS_vFor((row.getVisibleCells())); _j < _k.length; _j++) {
            var _l = _k[_j], cell = _l[0], idx = _l[1];
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign(__assign(__assign(__assign({ key: (cell.id), id: (cell.id) }, { class: "max-w-0 min-w-0 px-4 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4))" }), { class: ([
                    __VLS_ctx.dense ? 'py-2.5' : 'py-4',
                    ((_b = cell.column.columnDef.meta) === null || _b === void 0 ? void 0 : _b.align) === 'right' ? 'text-right' : '',
                ]) }), { 'data-index': (idx) }), { style: ({
                    width: "".concat(cell.column.getSize(), "px"),
                    minWidth: "".concat(cell.column.getSize(), "px"),
                }) }));
            /** @type {__VLS_StyleScopedClasses['max-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['first:pl-(--gutter,--spacing(4))']} */ ;
            /** @type {__VLS_StyleScopedClasses['last:pr-(--gutter,--spacing(4))']} */ ;
            if (!cell.getIsPlaceholder()) {
                var __VLS_12 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
                vue_table_1.FlexRender;
                // @ts-ignore
                var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                    render: (cell.column.columnDef.cell),
                    props: (cell.getContext()),
                }));
                var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
                        render: (cell.column.columnDef.cell),
                        props: (cell.getContext()),
                    }], __VLS_functionalComponentArgsRest(__VLS_13), false));
            }
            // @ts-ignore
            [editedId, dense,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "bg-card sticky right-0" }));
        /** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        if (__VLS_ctx.editMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex grow-0 items-center justify-end pr-4" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['grow-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
            var __VLS_17 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
            var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
            var __VLS_22 = void 0;
            var __VLS_23 = ({ click: {} },
                { onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!!(row.original.id === __VLS_ctx.editedId))
                            return;
                        if (!(__VLS_ctx.editMode))
                            return;
                        __VLS_ctx.editedId = row.original.id;
                        // @ts-ignore
                        [editedId, editMode,];
                    } });
            var __VLS_24 = __VLS_20.slots.default;
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
};
var __VLS_10, __VLS_20, __VLS_21;
for (var _g = 0, _h = __VLS_vFor((__VLS_ctx.rows)); _g < _h.length; _g++) {
    var row = _h[_g][0];
    _loop_2(row);
}
// @ts-ignore
var __VLS_11 = __VLS_10;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
