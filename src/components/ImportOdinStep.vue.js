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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var odinDragon_1 = require("@/importexport/spreadsheets/odinDragon");
var vue_1 = require("vue");
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var convertUtils_1 = require("@/importexport/convertUtils");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var DataGrid_vue_1 = require("@/modules/grid/DataGrid.vue");
var OrbatCellRenderer_vue_1 = require("@/components/OrbatCellRenderer.vue");
var solid_1 = require("@heroicons/vue/20/solid");
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var scenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var expandTemplates = (0, vue_1.ref)(true);
var includeEquipment = (0, vue_1.ref)(true);
var includePersonnel = (0, vue_1.ref)(true);
var _d = (0, scenarioUtils_1.useRootUnits)(), rootUnitItems = _d.rootUnitItems, groupedRootUnitItems = _d.groupedRootUnitItems;
var parentUnitId = (0, vue_1.ref)((_a = rootUnitItems.value[0]) === null || _a === void 0 ? void 0 : _a.code);
function renderExpandCell(_a) {
    var _b;
    var getValue = _a.getValue, row = _a.row;
    return (0, vue_1.h)(OrbatCellRenderer_vue_1.default, {
        value: (_b = getValue()) !== null && _b !== void 0 ? _b : "",
        sidc: row.original.sidc,
        expanded: row.getIsExpanded(),
        level: row.depth,
        canExpand: row.getCanExpand(),
        onToggle: row.getToggleExpandedHandler(),
        symbolOptions: {},
    });
}
var columns = [
    {
        accessorFn: function (f) { return f.name; },
        id: "name",
        cell: renderExpandCell,
        header: function (_a) {
            var table = _a.table;
            return (0, vue_1.h)("button", {
                type: "button",
                title: "Expand/collapse all",
                onClick: table.getToggleAllRowsExpandedHandler(),
                class: "flex items-center gap-2",
            }, [
                (0, vue_1.h)(solid_1.ChevronRightIcon, {
                    class: [
                        "size-6 transform transition-transform text-muted-foreground",
                        table.getIsAllRowsExpanded() ? "rotate-90" : "",
                    ],
                }),
                "Unit",
            ]);
        },
        enableGlobalFilter: true,
        size: 450,
        enableSorting: false,
    },
    {
        accessorKey: "TEMPLATE NAME",
        header: "Template",
        size: 300,
        accessorFn: function (u) { var _a, _b; return (_b = (_a = rowMapTest.value) === null || _a === void 0 ? void 0 : _a.get(+u.id)) === null || _b === void 0 ? void 0 : _b["TEMPLATE NAME"]; },
    },
];
var initialTableState = {
    //grouping: ["PARENT NAME"],
    expanded: true,
};
var importedUnits = (0, vue_1.shallowRef)([]);
var rowMapTest = (0, vue_1.shallowRef)();
var _e = (0, odinDragon_1.parseOdinDragon)(props.workbook, {
    rowsOnly: false,
    expandTemplates: false,
}), rootUnits = _e.rootUnits, rowMap = _e.rowMap;
importedUnits.value = rootUnits;
rowMapTest.value = rowMap;
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var rootUnits;
        return __generator(this, function (_a) {
            rootUnits = (0, odinDragon_1.parseOdinDragon)(props.workbook, {
                expandTemplates: expandTemplates.value,
                includeEquipment: includeEquipment.value,
                includePersonnel: includePersonnel.value,
            }).rootUnits;
            rootUnits.forEach(function (unit) {
                (0, convertUtils_1.addUnitHierarchy)(unit, parentUnitId.value, scenario);
            });
            emit("loaded");
            return [2 /*return*/];
        });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import units from ODIN",
    subtitle: "Import units from ODIN DRAGON export",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import units from ODIN",
        subtitle: "Import units from ODIN DRAGON export",
        helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
        hasSidebar: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.actions;
    var __VLS_8 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = void 0;
    var __VLS_14 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('cancel');
                // @ts-ignore
                [emit,];
            } });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_15 = __VLS_11.slots.default;
    // @ts-ignore
    [];
    var __VLS_11;
    var __VLS_12;
    var __VLS_16 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ click: {} },
        { onClick: (__VLS_ctx.onLoad) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_23 = __VLS_19.slots.default;
    // @ts-ignore
    [onLoad,];
    var __VLS_19;
    var __VLS_20;
    // @ts-ignore
    [];
}
{
    var __VLS_24 = __VLS_3.slots.sidebar;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert max-w-none" }));
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://odin.tradoc.army.mil/DATEWORLD",
        target: "_blank",
        rel: "noopener noreferrer",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_25 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        label: "Expand unit templates",
        description: "This will create a lot of units!",
        modelValue: (__VLS_ctx.expandTemplates),
    }));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
            label: "Expand unit templates",
            description: "This will create a lot of units!",
            modelValue: (__VLS_ctx.expandTemplates),
        }], __VLS_functionalComponentArgsRest(__VLS_26), false));
    if (__VLS_ctx.expandTemplates) {
        var __VLS_30 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
            label: "Include equipment",
            modelValue: (__VLS_ctx.includeEquipment),
            disabled: (!__VLS_ctx.expandTemplates),
        }));
        var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
                label: "Include equipment",
                modelValue: (__VLS_ctx.includeEquipment),
                disabled: (!__VLS_ctx.expandTemplates),
            }], __VLS_functionalComponentArgsRest(__VLS_31), false));
        var __VLS_35 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            label: "Include personnel",
            modelValue: (__VLS_ctx.includePersonnel),
            disabled: (!__VLS_ctx.expandTemplates),
        }));
        var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{
                label: "Include personnel",
                modelValue: (__VLS_ctx.includePersonnel),
                disabled: (!__VLS_ctx.expandTemplates),
            }], __VLS_functionalComponentArgsRest(__VLS_36), false));
    }
    var __VLS_40 = SymbolCodeSelect_vue_1.default;
    // @ts-ignore
    var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        label: "Select parent unit",
        items: (__VLS_ctx.rootUnitItems),
        groups: (__VLS_ctx.groupedRootUnitItems),
        modelValue: (__VLS_ctx.parentUnitId),
    }));
    var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([{
            label: "Select parent unit",
            items: (__VLS_ctx.rootUnitItems),
            groups: (__VLS_ctx.groupedRootUnitItems),
            modelValue: (__VLS_ctx.parentUnitId),
        }], __VLS_functionalComponentArgsRest(__VLS_41), false));
    // @ts-ignore
    [expandTemplates, expandTemplates, expandTemplates, expandTemplates, includeEquipment, includePersonnel, rootUnitItems, groupedRootUnitItems, parentUnitId,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full min-h-0 flex-col p-6" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
var __VLS_45 = DataGrid_vue_1.default;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45(__assign(__assign({ data: (__VLS_ctx.importedUnits), columns: (__VLS_ctx.columns), rowCount: ((_b = __VLS_ctx.rowMapTest) === null || _b === void 0 ? void 0 : _b.size), rowHeight: (40) }, { class: "flex-1" }), { showGlobalFilter: true, initialState: (__VLS_ctx.initialTableState), getSubRows: (function (row) { return row.subUnits; }) })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign(__assign({ data: (__VLS_ctx.importedUnits), columns: (__VLS_ctx.columns), rowCount: ((_c = __VLS_ctx.rowMapTest) === null || _c === void 0 ? void 0 : _c.size), rowHeight: (40) }, { class: "flex-1" }), { showGlobalFilter: true, initialState: (__VLS_ctx.initialTableState), getSubRows: (function (row) { return row.subUnits; }) })], __VLS_functionalComponentArgsRest(__VLS_46), false));
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
// @ts-ignore
[importedUnits, columns, rowMapTest, initialTableState,];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
