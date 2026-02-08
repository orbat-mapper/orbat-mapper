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
var tabs_1 = require("@/components/ui/tabs");
var OrbatPanel_vue_1 = require("@/modules/scenarioeditor/OrbatPanel.vue");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var chartSettingsStore_1 = require("@/modules/charteditor/chartSettingsStore");
var sizes_1 = require("@/modules/charteditor/orbatchart/sizes");
var OrbatChart_vue_1 = require("@/modules/charteditor/OrbatChart.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var SimpleBreadcrumbs_vue_1 = require("@/components/SimpleBreadcrumbs.vue");
var OrbatChartSettings_vue_1 = require("@/modules/charteditor/OrbatChartSettings.vue");
var constants_1 = require("@/modules/charteditor/constants");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var ResizablePanel_vue_1 = require("@/components/ResizablePanel.vue");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var core_1 = require("@vueuse/core");
var searchActions_1 = require("@/composables/searchActions");
var selectedStore_1 = require("@/stores/selectedStore");
var files_1 = require("@/utils/files");
var rootUnitStore = (0, chartSettingsStore_1.useRootUnitStore)();
var options = (0, chartSettingsStore_1.useChartSettingsStore)();
var specificOptions = (0, chartSettingsStore_1.useSpecificChartOptionsStore)();
var activeUnitId = (0, selectedStore_1.useSelectedItems)().activeUnitId;
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, state = _a.store.state, getUnitById = _a.helpers.getUnitById;
var activeUnit = (0, vue_1.computed)(function () {
    return (activeUnitId.value &&
        unitActions.expandUnitWithSymbolOptions(getUnitById(activeUnitId.value))) ||
        null;
});
var onUnitSelect = (0, searchActions_1.useSearchActions)().onUnitSelect;
onUnitSelect(function (_a) {
    var unitId = _a.unitId;
    activeUnitId.value = unitId;
});
var breadcrumbItems = (0, vue_1.computed)(function () {
    var _a, _b;
    if (!activeUnitId.value)
        return [];
    var _c = unitActions.getUnitHierarchy(activeUnitId.value), side = _c.side, sideGroup = _c.sideGroup, parents = _c.parents;
    return __spreadArray(__spreadArray([
        { name: side.name, static: true },
        { name: (_a = sideGroup === null || sideGroup === void 0 ? void 0 : sideGroup.name) !== null && _a !== void 0 ? _a : "Root", static: true }
    ], parents.map(function (e) { return ({ name: e.name, static: true }); }), true), [
        { name: (_b = activeUnit.value) === null || _b === void 0 ? void 0 : _b.name, static: true },
    ], false);
});
rootUnitStore.unit = null;
var ORBAT_TAB = 0;
var SETTINGS_TAB = 1;
var selectedTab = (0, vue_1.ref)(ORBAT_TAB);
var selectedTabString = (0, vue_1.computed)({
    get: function () { return selectedTab.value.toString(); },
    set: function (v) { return (selectedTab.value = parseInt(v)); },
});
var isInteractive = (0, vue_1.ref)(true);
function changeTab(index) {
    selectedTab.value = index;
}
var panelWidth = (0, vue_1.ref)();
var debug = (0, vue_1.ref)(false);
var currentTab = (0, vue_1.ref)(constants_1.ChartTabs.Chart);
var currentChartElements = (0, chartSettingsStore_1.useSelectedChartElementStore)();
var width = (0, vue_1.computed)(function () { return (0, sizes_1.sizeToWidthHeight)(options.paperSize).width; });
var height = (0, vue_1.computed)(function () { return (0, sizes_1.sizeToWidthHeight)(options.paperSize).height; });
var onUnitClick = function (unitNode) {
    currentChartElements.selectUnit(unitNode);
    changeTab(SETTINGS_TAB);
    (0, vue_1.nextTick)(function () { return (currentTab.value = constants_1.ChartTabs.Unit); });
};
var onLevelClick = function (levelNumber) {
    currentChartElements.selectLevel(levelNumber);
    changeTab(SETTINGS_TAB);
    currentTab.value = constants_1.ChartTabs.Level;
};
var onBranchClick = function (parentId, levelNumber) {
    currentChartElements.selectBranch(parentId, levelNumber);
    changeTab(SETTINGS_TAB);
    currentTab.value = constants_1.ChartTabs.Branch;
};
var doSVGDownload = function () { return __awaiter(void 0, void 0, void 0, function () {
    var origValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                origValue = isInteractive.value;
                isInteractive.value = false;
                return [4 /*yield*/, (0, vue_1.nextTick)()];
            case 1:
                _a.sent();
                downloadElementAsSVG("chartId");
                return [4 /*yield*/, (0, core_1.promiseTimeout)(1000)];
            case 2:
                _a.sent();
                isInteractive.value = origValue;
                return [2 /*return*/];
        }
    });
}); };
var doPNGDownload = function () { return __awaiter(void 0, void 0, void 0, function () {
    var origValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                origValue = isInteractive.value;
                isInteractive.value = false;
                return [4 /*yield*/, (0, vue_1.nextTick)()];
            case 1:
                _a.sent();
                downloadSvgAsPng("chartId", width.value, height.value);
                return [4 /*yield*/, (0, core_1.promiseTimeout)(1000)];
            case 2:
                _a.sent();
                isInteractive.value = origValue;
                return [2 /*return*/];
        }
    });
}); };
function downloadSvgAsPng(elementId, width, height) {
    var svgElement = document.getElementById(elementId);
    if (!svgElement)
        return;
    // need this for Firefox (https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage)
    var savedWidth = svgElement.getAttribute("width") || "";
    var savedHeight = svgElement.getAttribute("height") || "";
    var scaleFactor = 2;
    svgElement.setAttribute("width", "".concat(width * scaleFactor, "px"));
    svgElement.setAttribute("height", "".concat(height * scaleFactor, "px"));
    var svgBlob = new Blob([new XMLSerializer().serializeToString(svgElement)], {
        type: "image/svg+xml",
    });
    var canvas = document.createElement("canvas");
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    var ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    var objectURL = URL.createObjectURL(svgBlob);
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(function (blob) { return blob && (0, files_1.saveBlobToLocalFile)(blob, "orbat-chart.png"); });
        URL.revokeObjectURL(objectURL);
        svgElement === null || svgElement === void 0 ? void 0 : svgElement.setAttribute("width", savedWidth);
        svgElement === null || svgElement === void 0 ? void 0 : svgElement.setAttribute("height", savedHeight);
    };
    image.src = objectURL;
}
function downloadElementAsSVG(elementId) {
    return __awaiter(this, void 0, void 0, function () {
        var svgElement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    svgElement = document.getElementById(elementId);
                    if (!svgElement)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([new XMLSerializer().serializeToString(svgElement)], {
                            type: "image/svg+xml",
                        }), "orbat-chart.svg")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var menuItems = [
    { label: "Download as SVG", action: doSVGDownload },
    { label: "Download as PNG", action: doPNGDownload },
];
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex min-h-0 flex-auto" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_0 = ResizablePanel_vue_1.default || ResizablePanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ width: (__VLS_ctx.panelWidth) }, { class: "bg-muted dark:bg-background relative z-10 flex h-full flex-col justify-between overflow-auto overflow-visible border-r-2 print:hidden" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ width: (__VLS_ctx.panelWidth) }, { class: "bg-muted dark:bg-background relative z-10 flex h-full flex-col justify-between overflow-auto overflow-visible border-r-2 print:hidden" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-visible']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r-2']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ modelValue: (__VLS_ctx.selectedTabString) }, { class: "flex h-full flex-col" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.selectedTabString) }, { class: "flex h-full flex-col" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
var __VLS_11 = __VLS_9.slots.default;
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "flex w-full rounded-none border-b border-gray-200 bg-transparent p-0" })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "flex w-full rounded-none border-b border-gray-200 bg-transparent p-0" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0']} */ ;
var __VLS_17 = __VLS_15.slots.default;
for (var _i = 0, _b = __VLS_vFor((['ORBAT', 'Chart settings'])); _i < _b.length; _i++) {
    var _c = _b[_i], tab = _c[0], index = _c[1];
    var __VLS_18 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ key: (tab), value: (index.toString()) }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-center text-sm font-medium shadow-none transition-none hover:border-gray-300 focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none" })));
    var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ key: (tab), value: (index.toString()) }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-center text-sm font-medium shadow-none transition-none hover:border-gray-300 focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=active]:border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=active]:text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=active]:bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['data-[state=active]:shadow-none']} */ ;
    var __VLS_23 = __VLS_21.slots.default;
    (tab);
    // @ts-ignore
    [panelWidth, selectedTabString,];
    var __VLS_21;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-0 flex-auto overflow-auto" }));
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ value: "0" }, { class: "mt-0 h-full" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mt-0 h-full" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30 = OrbatPanel_vue_1.default || OrbatPanel_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ class: "space-y-1" }, { hideFilter: true })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ class: "space-y-1" }, { hideFilter: true })], __VLS_functionalComponentArgsRest(__VLS_31), false));
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
var __VLS_35 = __VLS_33.slots.default;
{
    var __VLS_36 = __VLS_33.slots.header;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_33;
// @ts-ignore
[];
var __VLS_27;
var __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ value: "1" }, { class: "mt-0 h-full" })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mt-0 h-full" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
var __VLS_42 = __VLS_40.slots.default;
var __VLS_43 = OrbatChartSettings_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    chartMode: true,
    tab: (__VLS_ctx.currentTab),
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        chartMode: true,
        tab: (__VLS_ctx.currentTab),
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
// @ts-ignore
[currentTab,];
var __VLS_40;
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "bg-muted/50 relative h-full flex-auto" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_48 = SimpleBreadcrumbs_vue_1.default;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign({ class: "bg-opacity-80 bg-background absolute top-2 left-2 z-10 print:hidden" }, { items: (__VLS_ctx.breadcrumbItems) })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ class: "bg-opacity-80 bg-background absolute top-2 left-2 z-10 print:hidden" }, { items: (__VLS_ctx.breadcrumbItems) })], __VLS_functionalComponentArgsRest(__VLS_49), false));
/** @type {__VLS_StyleScopedClasses['bg-opacity-80']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "bg-background absolute top-2 right-4 z-10 rounded-full print:hidden" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
var __VLS_53 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    items: (__VLS_ctx.menuItems),
}));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.menuItems),
    }], __VLS_functionalComponentArgsRest(__VLS_54), false));
var __VLS_58 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ class: "absolute right-2 bottom-2 z-10 print:hidden" }, { modelValue: (__VLS_ctx.debug) })));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ class: "absolute right-2 bottom-2 z-10 print:hidden" }, { modelValue: (__VLS_ctx.debug) })], __VLS_functionalComponentArgsRest(__VLS_59), false));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-2']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
var __VLS_63 = __VLS_61.slots.default;
// @ts-ignore
[breadcrumbItems, menuItems, debug,];
var __VLS_61;
if (!__VLS_ctx.activeUnit) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "p-8 text-center" }));
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
}
var __VLS_64 = OrbatChart_vue_1.default;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64(__assign(__assign(__assign({ 'onUnitclick': {} }, { 'onLevelclick': {} }), { 'onBranchclick': {} }), { unit: (__VLS_ctx.activeUnit), width: (__VLS_ctx.width), height: (__VLS_ctx.height), symbolGenerator: (__VLS_ctx.symbolGenerator), chartId: "chartId", options: (__VLS_ctx.options.$state), specificOptions: (__VLS_ctx.specificOptions.$state), enablePanZoom: true, interactive: (__VLS_ctx.isInteractive), debug: (__VLS_ctx.debug) })));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUnitclick': {} }, { 'onLevelclick': {} }), { 'onBranchclick': {} }), { unit: (__VLS_ctx.activeUnit), width: (__VLS_ctx.width), height: (__VLS_ctx.height), symbolGenerator: (__VLS_ctx.symbolGenerator), chartId: "chartId", options: (__VLS_ctx.options.$state), specificOptions: (__VLS_ctx.specificOptions.$state), enablePanZoom: true, interactive: (__VLS_ctx.isInteractive), debug: (__VLS_ctx.debug) })], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_69;
var __VLS_70 = ({ unitclick: {} },
    { onUnitclick: (__VLS_ctx.onUnitClick) });
var __VLS_71 = ({ levelclick: {} },
    { onLevelclick: (__VLS_ctx.onLevelClick) });
var __VLS_72 = ({ branchclick: {} },
    { onBranchclick: (__VLS_ctx.onBranchClick) });
var __VLS_67;
var __VLS_68;
// @ts-ignore
[debug, activeUnit, activeUnit, width, height, milsymbwrapper_1.symbolGenerator, options, specificOptions, isInteractive, onUnitClick, onLevelClick, onBranchClick,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
