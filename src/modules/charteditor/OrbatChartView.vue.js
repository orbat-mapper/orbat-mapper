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
var OrbatChart_vue_1 = require("./OrbatChart.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var orbatchart_1 = require("./orbatchart");
var testorbats_1 = require("./orbatchart/test/testorbats");
var milsymbwrapper_1 = require("@/symbology/milsymbwrapper");
var solid_1 = require("@heroicons/vue/24/solid");
var core_1 = require("@vueuse/core");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var SlideOver_vue_1 = require("@/components/SlideOver.vue");
var OrbatChartSettings_vue_1 = require("./OrbatChartSettings.vue");
var chartSettingsStore_1 = require("./chartSettingsStore");
var sizes_1 = require("./orbatchart/sizes");
var injects_1 = require("@/components/injects");
var constants_1 = require("@/modules/charteditor/constants");
var files_1 = require("@/utils/files");
var props = defineProps();
(0, vue_1.provide)(injects_1.activeScenarioKey, props.activeScenario);
var debug = (0, vue_1.ref)(false);
var isInteractive = (0, vue_1.ref)(true);
var chartId = "OrbatChart";
var isMenuOpen = (0, vue_1.ref)(false);
var currentTab = (0, vue_1.ref)(constants_1.ChartTabs.Chart);
var rootUnitStore = (0, chartSettingsStore_1.useRootUnitStore)();
var options = (0, chartSettingsStore_1.useChartSettingsStore)();
var specificOptions = (0, chartSettingsStore_1.useSpecificChartOptionsStore)();
var currentChartElements = (0, chartSettingsStore_1.useSelectedChartElementStore)();
rootUnitStore.unit =
    props.activeScenario.unitActions.getUnitByName("TG 317.1 LG") || testorbats_1.ORBAT1;
var lastLevelLayout = orbatchart_1.LevelLayouts.TreeRight;
var width = (0, vue_1.computed)(function () { return (0, sizes_1.sizeToWidthHeight)(options.paperSize).width; });
var height = (0, vue_1.computed)(function () { return (0, sizes_1.sizeToWidthHeight)(options.paperSize).height; });
var onUnitClick = function (unitNode) {
    currentChartElements.selectUnit(unitNode);
    currentTab.value = constants_1.ChartTabs.Unit;
};
var onLevelClick = function (levelNumber) {
    currentChartElements.selectLevel(levelNumber);
    currentTab.value = constants_1.ChartTabs.Level;
};
var onBranchClick = function (parentId, levelNumber) {
    currentChartElements.selectBranch(parentId, levelNumber);
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
                downloadElementAsSVG(chartId);
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
                downloadSvgAsPng(chartId, width.value, height.value);
                return [4 /*yield*/, (0, core_1.promiseTimeout)(1000)];
            case 2:
                _a.sent();
                isInteractive.value = origValue;
                return [2 /*return*/];
        }
    });
}); };
var menuItems = [
    { label: "Download SVG", action: doSVGDownload },
    { label: "Download PNG", action: doPNGDownload },
];
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
    var svgElement = document.getElementById(elementId);
    if (!svgElement)
        return;
    (0, files_1.saveBlobToLocalFile)(new Blob([new XMLSerializer().serializeToString(svgElement)], {
        type: "image/svg+xml",
    }), "orbat-chart.svg");
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex h-full w-screen overflow-hidden" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)(__assign({ class: "bg-muted/50 hidden lg:flex lg:w-[20rem] lg:shrink-0 lg:border-r lg:border-gray-200 print:hidden" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-[20rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
var __VLS_0 = OrbatChartSettings_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ tab: (__VLS_ctx.currentTab) }, { class: "print:hidden" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ tab: (__VLS_ctx.currentTab) }, { class: "print:hidden" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
var __VLS_5 = SlideOver_vue_1.default || SlideOver_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.isMenuOpen),
    left: true,
    title: "Chart layout settings",
}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.isMenuOpen),
        left: true,
        title: "Chart layout settings",
    }], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10 = __VLS_8.slots.default;
if (__VLS_ctx.isMenuOpen) {
    var __VLS_11 = OrbatChartSettings_vue_1.default;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        tab: (__VLS_ctx.currentTab),
    }));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
            tab: (__VLS_ctx.currentTab),
        }], __VLS_functionalComponentArgsRest(__VLS_12), false));
}
// @ts-ignore
[currentTab, currentTab, isMenuOpen, isMenuOpen,];
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "relative min-w-0 flex-auto print:block" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['print:block']} */ ;
var __VLS_16 = OrbatChart_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign(__assign({ 'onUnitclick': {} }, { 'onLevelclick': {} }), { 'onBranchclick': {} }), { unit: (__VLS_ctx.rootUnitStore.unit), debug: (__VLS_ctx.debug), width: (__VLS_ctx.width), height: (__VLS_ctx.height), symbolGenerator: (__VLS_ctx.symbolGenerator), interactive: (__VLS_ctx.isInteractive), chartId: (__VLS_ctx.chartId), options: (__VLS_ctx.options.$state), specificOptions: (__VLS_ctx.specificOptions.$state), enablePanZoom: true })));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUnitclick': {} }, { 'onLevelclick': {} }), { 'onBranchclick': {} }), { unit: (__VLS_ctx.rootUnitStore.unit), debug: (__VLS_ctx.debug), width: (__VLS_ctx.width), height: (__VLS_ctx.height), symbolGenerator: (__VLS_ctx.symbolGenerator), interactive: (__VLS_ctx.isInteractive), chartId: (__VLS_ctx.chartId), options: (__VLS_ctx.options.$state), specificOptions: (__VLS_ctx.specificOptions.$state), enablePanZoom: true })], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_21;
var __VLS_22 = ({ unitclick: {} },
    { onUnitclick: (__VLS_ctx.onUnitClick) });
var __VLS_23 = ({ levelclick: {} },
    { onLevelclick: (__VLS_ctx.onLevelClick) });
var __VLS_24 = ({ branchclick: {} },
    { onBranchclick: (__VLS_ctx.onBranchClick) });
var __VLS_19;
var __VLS_20;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute top-4 left-4 flex items-center space-x-4 print:hidden" }));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['print:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.isMenuOpen = true;
        // @ts-ignore
        [isMenuOpen, rootUnitStore, debug, width, height, milsymbwrapper_1.symbolGenerator, isInteractive, chartId, options, specificOptions, onUnitClick, onLevelClick, onBranchClick,];
    } }, { type: "button" }), { class: "text-muted-foreground focus:ring-ring border-r border-gray-200 p-4 focus:ring-2 focus:outline-hidden focus:ring-inset lg:hidden" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.MenuAlt2Icon} */
solid_1.Bars3BottomLeftIcon;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "h-6 w-6" }, { 'aria-hidden': "true" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "h-6 w-6" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
var __VLS_30 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.debug),
}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.debug),
    }], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
// @ts-ignore
[debug,];
var __VLS_33;
var __VLS_36 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.isInteractive),
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.isInteractive),
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_41 = __VLS_39.slots.default;
// @ts-ignore
[isInteractive,];
var __VLS_39;
var __VLS_42 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    items: (__VLS_ctx.menuItems),
}));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.menuItems),
    }], __VLS_functionalComponentArgsRest(__VLS_43), false));
// @ts-ignore
[menuItems,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
