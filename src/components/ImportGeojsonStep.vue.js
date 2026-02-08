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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var helpers_1 = require("@/components/helpers");
var sidc_1 = require("@/symbology/sidc");
var meta_1 = require("@turf/meta");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var InputRadio_vue_1 = require("@/components/InputRadio.vue");
var MRadioGroup_vue_1 = require("@/components/MRadioGroup.vue");
var DataGrid_vue_1 = require("@/modules/grid/DataGrid.vue");
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var AlertWarning_vue_1 = require("@/components/AlertWarning.vue");
var scenarioUtils_ts_1 = require("@/composables/scenarioUtils.ts");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, scnStore = _a.store, geo = _a.geo;
var importMode = (0, vue_1.ref)("features");
var isFeatureMode = (0, vue_1.computed)(function () { return importMode.value === "features"; });
var selectedFeatures = (0, vue_1.ref)([]);
var propertyNames = (0, vue_1.computed)(function () {
    return (0, meta_1.propReduce)(props.data, function (acc, properties) {
        if (properties)
            Object.keys(properties).forEach(function (key) { return acc.add(key); });
        return acc;
    }, new Set());
});
var propertyNameItems = (0, vue_1.computed)(function () {
    return Array.from(propertyNames.value).map(function (key) { return ({ label: key, value: key }); });
});
var computedColumns = (0, vue_1.computed)(function () {
    var items = Array.from(propertyNames.value).map(function (key) { return ({
        accessorFn: function (f) { var _a, _b; return (_b = (_a = f.properties) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : ""; },
        header: key,
    }); });
    return [
        { accessorKey: "geometry.type", id: "geometryType", header: "Geometry" },
        importMode.value === "units" && {
            size: 80,
            header: "Icon",
            enableSorting: false,
            accessorFn: function (f) { var _a, _b; return ((_b = (_a = f.properties) === null || _a === void 0 ? void 0 : _a[symbolColumn.value]) === null || _b === void 0 ? void 0 : _b.trim()) || "10031000000000000000"; },
            id: "sidc",
            cell: function (_a) {
                var getValue = _a.getValue;
                return (0, vue_1.h)(MilitarySymbol_vue_1.default, {
                    sidc: getValue(),
                    size: 20,
                    "data-sidc": getValue(),
                });
            },
        },
        {
            accessorFn: function (f) { var _a, _b; return (_b = (_a = f.properties) === null || _a === void 0 ? void 0 : _a[nameColumn.value]) !== null && _b !== void 0 ? _b : "Feature"; },
            id: "name",
            header: "Name",
        },
        { header: "Feature properties", columns: __spreadArray([], items, true) },
    ];
});
var _b = (0, scenarioUtils_ts_1.useRootUnits)(), rootUnitItems = _b.rootUnitItems, groupedRootUnitItems = _b.groupedRootUnitItems;
var geoJSONFeatures = (0, vue_1.computed)(function () {
    var extractedFeatures = [];
    (0, meta_1.featureEach)(props.data, function (f) {
        extractedFeatures.push(f);
    });
    // This is a hack to force the computed to re-run when we change column assignments
    // See https://github.com/TanStack/table/issues/5363
    nameColumn.value;
    symbolColumn.value;
    return extractedFeatures;
});
var geoJSONPointFeatures = (0, vue_1.computed)(function () {
    return geoJSONFeatures.value.filter(function (f) { return f.geometry.type === "Point"; });
});
var existingLayers = (0, vue_1.computed)(function () {
    return geo.layers.value.map(function (l) { return ({ label: l.name, value: l.id }); });
});
function findLikelyNameColumn(columnNames) {
    // List of common name field variations
    var nameVariations = ["name", "title"];
    // Find and return the first column name that matches any of the name variations
    for (var _i = 0, columnNames_1 = columnNames; _i < columnNames_1.length; _i++) {
        var columnName = columnNames_1[_i];
        if (nameVariations.includes(columnName.trim().toLowerCase())) {
            return columnName;
        }
    }
    for (var _a = 0, columnNames_2 = columnNames; _a < columnNames_2.length; _a++) {
        var columnName = columnNames_2[_a];
        if (columnName.toLowerCase().includes("name")) {
            return columnName;
        }
    }
    // Fallback: return the first column name if no common name field is found
    return columnNames[0];
}
function findLikelySymbolColumn(columnNames) {
    // List of common symbol field variations
    var symbolVariations = ["symbol", "sidc"];
    // Find and return the first column name that matches any of the symbol variations
    for (var _i = 0, columnNames_3 = columnNames; _i < columnNames_3.length; _i++) {
        var columnName = columnNames_3[_i];
        if (symbolVariations.includes(columnName.trim().toLowerCase())) {
            return columnName;
        }
    }
    for (var _a = 0, columnNames_4 = columnNames; _a < columnNames_4.length; _a++) {
        var columnName = columnNames_4[_a];
        if (columnName.toLowerCase().includes("symbol")) {
            return columnName;
        }
    }
    // Fallback: return the first column name if no common symbol field is found
    return columnNames[0];
}
var activeLayer = (0, vue_1.ref)(existingLayers.value[0].value);
var nameColumn = (0, vue_1.ref)(findLikelyNameColumn(__spreadArray([], propertyNames.value, true)));
var symbolColumn = (0, vue_1.ref)(findLikelySymbolColumn(__spreadArray([], propertyNames.value, true)));
var parentUnitId = (0, vue_1.ref)(rootUnitItems.value[0].code);
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (importMode.value === "units") {
                loadAsUnits();
            }
            else {
                loadAsFeatures();
            }
            emit("loaded");
            return [2 /*return*/];
        });
    });
}
function loadAsUnits() {
    var side = unitActions.getUnitHierarchy(parentUnitId.value).side;
    var units = selectedFeatures.value.map(function (f) {
        var _a, _b, _c;
        var sidc = ((_b = (_a = f.properties) === null || _a === void 0 ? void 0 : _a[symbolColumn.value]) === null || _b === void 0 ? void 0 : _b.trim()) || "10031000000000000000";
        return {
            id: (0, utils_1.nanoid)(),
            name: ((_c = f.properties) === null || _c === void 0 ? void 0 : _c[nameColumn.value]) || "New unit",
            sidc: (0, helpers_1.setCharAt)(sidc, sidc_1.SID_INDEX, side.standardIdentity),
            subUnits: [],
            _pid: "",
            _gid: "",
            _sid: "",
            location: f.geometry.coordinates,
            equipment: [],
            personnel: [],
        };
    });
    scnStore.groupUpdate(function () {
        units.forEach(function (unit) { return unitActions.addUnit(unit, parentUnitId.value); });
    });
}
function loadAsFeatures() {
    if (!activeLayer.value)
        return;
    var features = selectedFeatures.value.map(function (f) {
        var _a;
        return __assign(__assign({}, f), { _pid: activeLayer.value, id: (0, utils_1.nanoid)(), meta: {
                type: f.geometry.type,
                name: ((_a = f.properties) === null || _a === void 0 ? void 0 : _a[nameColumn.value]) || "New feature",
            }, style: {}, properties: {
            // ...(f.properties ?? {}),
            } });
    });
    scnStore.groupUpdate(function () {
        features.forEach(function (feature) { return geo.addFeature(feature, feature._pid); });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import GeoJSON",
    subtitle: "Import units and features from GeoJSON",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import GeoJSON",
        subtitle: "Import units and features from GeoJSON",
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
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-foreground text-sm leading-6 font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    var __VLS_25 = MRadioGroup_vue_1.default || MRadioGroup_vue_1.default;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "flex flex-col gap-2" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_30 = __VLS_28.slots.default;
    var __VLS_31 = InputRadio_vue_1.default || InputRadio_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        modelValue: (__VLS_ctx.importMode),
        value: "features",
    }));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.importMode),
            value: "features",
        }], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = __VLS_34.slots.default;
    // @ts-ignore
    [importMode,];
    var __VLS_34;
    var __VLS_37 = InputRadio_vue_1.default || InputRadio_vue_1.default;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        modelValue: (__VLS_ctx.importMode),
        value: "units",
    }));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.importMode),
            value: "units",
        }], __VLS_functionalComponentArgsRest(__VLS_38), false));
    var __VLS_42 = __VLS_40.slots.default;
    // @ts-ignore
    [importMode,];
    var __VLS_40;
    // @ts-ignore
    [];
    var __VLS_28;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_43 = SimpleSelect_vue_1.default;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        label: "Name column",
        items: (__VLS_ctx.propertyNameItems),
        modelValue: (__VLS_ctx.nameColumn),
    }));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
            label: "Name column",
            items: (__VLS_ctx.propertyNameItems),
            modelValue: (__VLS_ctx.nameColumn),
        }], __VLS_functionalComponentArgsRest(__VLS_44), false));
    if (!__VLS_ctx.isFeatureMode) {
        var __VLS_48 = SimpleSelect_vue_1.default;
        // @ts-ignore
        var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            label: "Symbol column",
            items: (__VLS_ctx.propertyNameItems),
            modelValue: (__VLS_ctx.symbolColumn),
        }));
        var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
                label: "Symbol column",
                items: (__VLS_ctx.propertyNameItems),
                modelValue: (__VLS_ctx.symbolColumn),
            }], __VLS_functionalComponentArgsRest(__VLS_49), false));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    if (__VLS_ctx.isFeatureMode) {
        var __VLS_53 = SimpleSelect_vue_1.default;
        // @ts-ignore
        var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            label: "Layer",
            description: "Which layer should the features be added to?",
            items: (__VLS_ctx.existingLayers),
            modelValue: (__VLS_ctx.activeLayer),
        }));
        var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([{
                label: "Layer",
                description: "Which layer should the features be added to?",
                items: (__VLS_ctx.existingLayers),
                modelValue: (__VLS_ctx.activeLayer),
            }], __VLS_functionalComponentArgsRest(__VLS_54), false));
    }
    else {
        var __VLS_58 = SymbolCodeSelect_vue_1.default;
        // @ts-ignore
        var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            label: "Parent unit",
            items: (__VLS_ctx.rootUnitItems),
            groups: (__VLS_ctx.groupedRootUnitItems),
            modelValue: (__VLS_ctx.parentUnitId),
        }));
        var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([{
                label: "Parent unit",
                items: (__VLS_ctx.rootUnitItems),
                groups: (__VLS_ctx.groupedRootUnitItems),
                modelValue: (__VLS_ctx.parentUnitId),
            }], __VLS_functionalComponentArgsRest(__VLS_59), false));
    }
    // @ts-ignore
    [propertyNameItems, propertyNameItems, nameColumn, isFeatureMode, isFeatureMode, symbolColumn, existingLayers, activeLayer, rootUnitItems, groupedRootUnitItems, parentUnitId,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full min-h-0 flex-col p-6" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mb-4 shrink-0 text-sm leading-6" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
var __VLS_63 = DataGrid_vue_1.default;
// @ts-ignore
var __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63(__assign({ data: (__VLS_ctx.isFeatureMode ? __VLS_ctx.geoJSONFeatures : __VLS_ctx.geoJSONPointFeatures), columns: (__VLS_ctx.computedColumns), rowHeight: (40), select: true, selectAll: true, showGlobalFilter: true, selected: (__VLS_ctx.selectedFeatures) }, { class: "flex-1" })));
var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.isFeatureMode ? __VLS_ctx.geoJSONFeatures : __VLS_ctx.geoJSONPointFeatures), columns: (__VLS_ctx.computedColumns), rowHeight: (40), select: true, selectAll: true, showGlobalFilter: true, selected: (__VLS_ctx.selectedFeatures) }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_64), false));
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
if (!__VLS_ctx.isFeatureMode && __VLS_ctx.geoJSONPointFeatures.length === 0) {
    var __VLS_68 = AlertWarning_vue_1.default || AlertWarning_vue_1.default;
    // @ts-ignore
    var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ title: "No point geometries found" }, { class: "mt-4 shrink-0" })));
    var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ title: "No point geometries found" }, { class: "mt-4 shrink-0" })], __VLS_functionalComponentArgsRest(__VLS_69), false));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    var __VLS_73 = __VLS_71.slots.default;
    // @ts-ignore
    [isFeatureMode, isFeatureMode, geoJSONFeatures, geoJSONPointFeatures, geoJSONPointFeatures, computedColumns, selectedFeatures,];
    var __VLS_71;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
