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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var scenariostore_1 = require("@/scenariostore");
var constants_1 = require("@/types/constants");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var vue_table_1 = require("@tanstack/vue-table");
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var solid_1 = require("@heroicons/vue/20/solid");
var vue_virtual_1 = require("@tanstack/vue-virtual");
var helpers_1 = require("@/modules/grid/helpers");
var core_1 = require("@vueuse/core");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var scenario = (0, scenariostore_1.useScenario)().scenario;
var doSelect = (0, vue_1.ref)(true);
var rowSelection = (0, vue_1.ref)({});
var grouping = (0, vue_1.ref)([]);
var query = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(query, 200);
var sorting = (0, vue_1.ref)([]);
var parentRef = (0, vue_1.ref)(null);
var columnHelper = (0, vue_table_1.createColumnHelper)();
var selected = (0, vue_1.ref)([]);
var data = (0, vue_1.ref)([]);
var columns = (0, vue_1.ref)([
    columnHelper.display({
        id: "select",
        size: 80,
        enableResizing: false,
        header: function (_a) {
            var table = _a.table;
            return (0, vue_1.h)("input", {
                type: "checkbox",
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                class: "m-2 rounded border-gray-300 text-primary focus:ring-ring sm:left-6",
                onChange: table.getToggleAllRowsSelectedHandler(),
            });
        },
        cell: function (_a) {
            var row = _a.row;
            return (0, vue_1.h)("input", {
                type: "checkbox",
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                class: "m-2 rounded border-gray-300 text-primary focus:ring-ring sm:left-6",
                onChange: row.getToggleSelectedHandler(),
            });
        },
    }),
    columnHelper.accessor("sidc", {
        size: 80,
        header: "Icon",
        enableSorting: false,
        cell: function (_a) {
            var row = _a.row, getValue = _a.getValue, cell = _a.cell;
            return (0, vue_1.h)(MilitarySymbol_vue_1.default, {
                sidc: getValue(),
                size: 20,
                modifiers: row.original.symbolOptions,
            });
        },
    }),
    {
        header: "Meta",
        columns: [
            columnHelper.accessor("name", { header: "Name" }),
            columnHelper.accessor("shortName", { header: "Short name" }),
            columnHelper.accessor("externalUrl", { header: "URL" }),
        ],
    },
    columnHelper.accessor("sideName", { header: "Side" }),
    columnHelper.accessor("sideGroupName", { header: "Side group" }),
    columnHelper.accessor("id", { header: "id", enableGlobalFilter: false }),
    {
        header: "Position",
        enableSorting: false,
        accessorFn: function (r) { var _a; return (_a = r._state) === null || _a === void 0 ? void 0 : _a.location; },
    },
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: function (props) {
            return (0, vue_1.h)(DotsMenu_vue_1.default, {
                class: "text-wrap",
                items: sideMenuItems,
                onAction: function (action) { return onAction(action, props); },
                portal: true,
            });
        },
    }),
]);
var table = (0, vue_table_1.useVueTable)({
    get data() {
        return data.value;
    },
    state: {
        get rowSelection() {
            return rowSelection.value;
        },
        get grouping() {
            return grouping.value;
        },
        get globalFilter() {
            return debouncedQuery.value;
        },
    },
    enableRowSelection: true,
    columnResizeMode: "onChange",
    columns: columns.value,
    getCoreRowModel: (0, vue_table_1.getCoreRowModel)(),
    getSortedRowModel: (0, vue_table_1.getSortedRowModel)(),
    getGroupedRowModel: (0, vue_table_1.getGroupedRowModel)(),
    getExpandedRowModel: (0, vue_table_1.getExpandedRowModel)(),
    getFilteredRowModel: (0, vue_table_1.getFilteredRowModel)(),
    autoResetAll: false,
    autoResetExpanded: false,
    getRowId: function (row) { return row.id; },
    onRowSelectionChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, rowSelection); },
    onGroupingChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, grouping); },
    onGlobalFilterChange: function (updateOrValue) { return (0, helpers_1.valueUpdater)(updateOrValue, query); },
});
var rowVirtualizerOptions = (0, vue_1.computed)(function () {
    return {
        count: rows.value.length,
        getScrollElement: function () { return parentRef.value; },
        estimateSize: function () { return 40; },
        overscan: 5,
    };
});
var rows = (0, vue_1.computed)(function () {
    return table.getRowModel().rows;
});
var rowVirtualizer = (0, vue_virtual_1.useVirtualizer)(rowVirtualizerOptions);
var virtualRows = (0, vue_1.computed)(function () { return rowVirtualizer.value.getVirtualItems(); });
var totalSize = (0, vue_1.computed)(function () { return rowVirtualizer.value.getTotalSize(); });
var sideMenuItems = [
    // { label: "Expand", action: SideActions.Expand },
    { label: "Edit", action: constants_1.SideActions.Edit },
    { label: "Add group", action: constants_1.SideActions.AddGroup },
    { label: "Delete side", action: constants_1.SideActions.Delete },
    { label: "Move up", action: constants_1.SideActions.MoveUp },
    { label: "Move down", action: constants_1.SideActions.MoveDown },
];
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitMap, sideGroupMap, sideMap, unitActions, unitData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, scenario.value.io.loadDemoScenario("falkland82")];
            case 1:
                _b.sent();
                _a = scenario.value.store.state, unitMap = _a.unitMap, sideGroupMap = _a.sideGroupMap, sideMap = _a.sideMap;
                unitActions = scenario.value.unitActions;
                unitData = [];
                Object.keys(sideMap).forEach(function (sideId) {
                    return scenario.value.unitActions.walkSide(sideId, function (unit, level, parent, sideGroup, side) {
                        var _a;
                        unitData.push(__assign(__assign({}, unit), { sideId: side.id, sideName: side === null || side === void 0 ? void 0 : side.name, sideGroupName: (_a = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.name) !== null && _a !== void 0 ? _a : "", symbolOptions: unitActions.getCombinedSymbolOptions(unit) }));
                    });
                });
                data.value = unitData;
                return [2 /*return*/];
        }
    });
}); });
function onAction(action, props) {
    console.log("on action", action, props);
}
function mutateData() {
    // data.value.splice(10, 5);
    var copy = __spreadArray([], data.value, true);
    copy[0].name = "Mutated";
    data.value = copy;
    // data.value = data.value.slice().reverse();
}
(0, vue_1.watch)(rowSelection, function () {
    console.log(table.getState().rowSelection); //get the row selection state - { 1: true, 2: false, etc... }
    console.log(table.getSelectedRowModel().rows); //get full client-side selected rows
    console.log(table.getFilteredSelectedRowModel().rows); //get filtered client-side selected rows
    console.log(table.getGroupedSelectedRowModel().rows); //g
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "flex h-full flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex shrink-0 items-center gap-4 p-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.selected.length);
(Object.keys(__VLS_ctx.rowSelection));
(__VLS_ctx.grouping);
var __VLS_0 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.mutateData();
            // @ts-ignore
            [selected, rowSelection, grouping, mutateData,];
        } });
var __VLS_7 = __VLS_3.slots.default;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
var __VLS_8 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.query),
    placeholder: "Search",
}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.query),
        placeholder: "Search",
    }], __VLS_functionalComponentArgsRest(__VLS_9), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "relative h-full overflow-auto rounded-lg border shadow-sm" }, { ref: "parentRef" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (headerGroup.id) }, { class: "flex divide-x divide-gray-200" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
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
                [query, table,];
            } }, { key: (header.id) }), { style: ({
                width: "".concat(header.getSize(), "px"),
            }) }), { role: "columnheader" }), { class: "text-foreground bg-muted relative flex items-center justify-between overflow-hidden border-b px-4 py-3.5 text-left text-sm font-semibold select-none" }), { class: ({ 'cursor-pointer': header.column.getCanSort() }) }));
        /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
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
            var __VLS_13 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                render: (header.column.columnDef.header),
                props: (header.getContext()),
            }));
            var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
                    render: (header.column.columnDef.header),
                    props: (header.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_14), false));
            if (header.column.getCanGroup()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!header.isPlaceholder))
                            return;
                        if (!(header.column.getCanGroup()))
                            return;
                        header.column.getToggleGroupingHandler()();
                        // @ts-ignore
                        [];
                    } }));
            }
            if (header.column.getCanSort() && header.column.getIsSorted()) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground group-hover:bg-muted flex-none rounded" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:bg-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                if (header.column.getIsSorted() === 'asc') {
                    var __VLS_18 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.ArrowSmallDownIcon} */
                    solid_1.ArrowSmallDownIcon;
                    // @ts-ignore
                    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
                    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                }
                else if (header.column.getIsSorted() === 'desc') {
                    var __VLS_23 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.ArrowSmallUpIcon} */
                    solid_1.ArrowSmallUpIcon;
                    // @ts-ignore
                    var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
                    var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_24), false));
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign(__assign(__assign({ key: row.key }, { style: ({ transform: "translateY(".concat(row.start, "px)") }) }), { class: "group hover:bg-muted/50 absolute flex h-10 w-full divide-x divide-gray-200" }), { 'data-index': (row.index) }));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-muted/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-gray-200']} */ ;
    var _loop_2 = function (cell, idx) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign(__assign(__assign({ key: (cell.id), id: (cell.id) }, { style: ({
                width: "".concat(cell.column.getSize(), "px"),
            }) }), { class: "cell" }), { 'data-index': (idx) }));
        /** @type {__VLS_StyleScopedClasses['cell']} */ ;
        if (cell.getIsGrouped()) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
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
                } }, { class: "flex items-center" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            var __VLS_28 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
            solid_1.ChevronRightIcon;
            // @ts-ignore
            var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 text-red-800 transition-transform" }, { class: ({
                    'rotate-90': cell.row.getIsExpanded(),
                }) })));
            var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 text-red-800 transition-transform" }, { class: ({
                        'rotate-90': cell.row.getIsExpanded(),
                    }) })], __VLS_functionalComponentArgsRest(__VLS_29), false));
            /** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['dark:text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['dark:group-hover:text-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
            var __VLS_33 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                render: (cell.column.columnDef.cell),
                props: (cell.getContext()),
            }));
            var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
                    render: (cell.column.columnDef.cell),
                    props: (cell.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_34), false));
            (cell.row.subRows.length);
        }
        else if (!cell.getIsPlaceholder()) {
            var __VLS_38 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FlexRender} */
            vue_table_1.FlexRender;
            // @ts-ignore
            var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                render: (cell.column.columnDef.cell),
                props: (cell.getContext()),
            }));
            var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([{
                    render: (cell.column.columnDef.cell),
                    props: (cell.getContext()),
                }], __VLS_functionalComponentArgsRest(__VLS_39), false));
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
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
