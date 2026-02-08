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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var reka_ui_1 = require("reka-ui");
var PrimaryButton_vue_1 = require("./PrimaryButton.vue");
var SymbolCodeSelect_vue_1 = require("./SymbolCodeSelect.vue");
var core_1 = require("@vueuse/core");
var SymbolCodeMultilineSelect_vue_1 = require("./SymbolCodeMultilineSelect.vue");
var symbolData_1 = require("@/composables/symbolData");
var nprogress_1 = require("nprogress");
var ScrollTabs_vue_1 = require("./ScrollTabs.vue");
var TabsContent_vue_1 = require("@/components/ui/tabs/TabsContent.vue");
var SymbolBrowseTab_vue_1 = require("./SymbolBrowseTab.vue");
var SecondaryButton_vue_1 = require("./SecondaryButton.vue");
var MilitarySymbol_vue_1 = require("@/components/MilitarySymbol.vue");
var scenarioModels_1 = require("@/types/scenarioModels");
var SymbolFillColorSelect_vue_1 = require("@/components/SymbolFillColorSelect.vue");
var SymbolCodeViewer_vue_1 = require("@/components/SymbolCodeViewer.vue");
var sidc_1 = require("@/symbology/sidc");
var symbolSearching_1 = require("@/composables/symbolSearching");
var solid_1 = require("@heroicons/vue/20/solid");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var button_1 = require("@/components/ui/button");
var PopoverColorPicker_vue_1 = require("@/components/PopoverColorPicker.vue");
var utils_1 = require("@/utils");
var injects_ts_1 = require("@/components/injects.ts");
var SymbolPickerCustomSymbol_vue_1 = require("@/components/SymbolPickerCustomSymbol.vue");
var constants_ts_1 = require("@/config/constants.ts");
var helpers_ts_1 = require("@/symbology/helpers.ts");
var LegacyConverter = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/LegacyConverter.vue"); }); });
var props = withDefaults(defineProps(), {
    dialogTitle: "Symbol picker",
    hideModifiers: false,
    hideSymbolColor: false,
});
var open = defineModel("isVisible", { default: true });
var emit = defineEmits(["update:sidc", "cancel"]);
var scn = (0, utils_1.injectStrict)(injects_ts_1.activeScenarioKey);
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var customSymbolId = (0, vue_1.ref)(((_a = props.initialSidc) === null || _a === void 0 ? void 0 : _a.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX))
    ? props.initialSidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE)
    : null);
var customSymbol = (0, vue_1.computed)(function () {
    if (!customSymbolId.value)
        return null;
    return scn.store.state.customSymbolMap[customSymbolId.value];
});
var searchInputRef = (0, vue_1.ref)();
var searchQuery = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(searchQuery, 100);
var currentTab = (0, vue_1.ref)(((_b = props.initialTab) !== null && _b !== void 0 ? _b : 0).toString());
var tabItems = (0, vue_1.computed)(function () {
    var items = ["Select", "Browse"];
    if (!props.hideCustomSymbols)
        items.push("Custom symbol");
    items.push("Legacy convert");
    return items;
});
var groupedHits = (0, vue_1.ref)();
var hitCount = (0, vue_1.ref)(0);
var internalSymbolOptions = (0, vue_1.ref)(__assign({}, (props.symbolOptions || {})));
var combinedSymbolOptions = (0, vue_1.computed)(function () { return (__assign(__assign({ outlineWidth: 8, outlineColor: "rgba(255,255,255,0.80)" }, (props.inheritedSymbolOptions || {})), cleanObject(internalSymbolOptions.value || {}))); });
var finalSymbolOptions = (0, vue_1.computed)(function () { return (__assign(__assign({}, combinedSymbolOptions.value), cleanObject({
    reinforcedReduced: (0, scenarioModels_1.mapReinforcedStatus2Field)(reinforcedReducedValue.value),
}))); });
// remove empty values in object
var cleanObject = function (obj) {
    Object.keys(obj).forEach(function (key) {
        if (obj[key] && typeof obj[key] === "object")
            cleanObject(obj[key]);
        else if (obj[key] === "" || obj[key] === null || obj[key] === undefined)
            delete obj[key];
    });
    return obj;
};
var _e = (0, symbolData_1.useSymbolItems)((0, vue_1.computed)(function () {
    return (0, helpers_ts_1.getFullUnitSidc)(props.initialSidc || "10031000001211000000");
}), props.reinforcedStatus), csidc = _e.csidc, loadData = _e.loadData, isLoaded = _e.isLoaded, sidValue = _e.sidValue, symbolSetValue = _e.symbolSetValue, iconValue = _e.iconValue, statusValue = _e.statusValue, statusItems = _e.statusItems, hqtfdItems = _e.hqtfdItems, hqtfdValue = _e.hqtfdValue, emtValue = _e.emtValue, emtItems = _e.emtItems, mod1Value = _e.mod1Value, mod2Value = _e.mod2Value, mod1Items = _e.mod1Items, mod2Items = _e.mod2Items, icons = _e.icons, symbolSets = _e.symbolSets, reinforcedReducedItems = _e.reinforcedReducedItems, reinforcedReducedValue = _e.reinforcedReducedValue;
loadData();
(0, core_1.whenever)(isLoaded, function () { return nprogress_1.default.done(); }, { immediate: true });
var search = (0, symbolSearching_1.useSymbologySearch)(sidValue).search;
var showReinforcedStatus = (0, vue_1.computed)(function () {
    return symbolSetValue.value === "10" || symbolSetValue.value === "11";
});
(0, vue_1.watchEffect)(function () {
    var _a = search(debouncedQuery.value), numberOfHits = _a.numberOfHits, groups = _a.groups;
    hitCount.value = numberOfHits;
    groupedHits.value = groups;
});
var onSubmit = function () {
    if (customSymbolId.value) {
        emit("update:sidc", {
            sidc: "".concat(constants_ts_1.CUSTOM_SYMBOL_PREFIX).concat(csidc.value, ":").concat(customSymbolId.value),
        });
    }
    else {
        emit("update:sidc", {
            sidc: csidc.value,
            reinforcedStatus: reinforcedReducedValue.value,
            symbolOptions: internalSymbolOptions.value.fillColor
                ? { fillColor: internalSymbolOptions.value.fillColor }
                : {},
        });
        if (internalSymbolOptions.value.fillColor)
            scn.settings.addColorIfAbsent(internalSymbolOptions.value.fillColor);
    }
    open.value = false;
};
function onSelect(value) {
    if (!value || typeof value !== "object" || !("sidc" in value))
        return;
    var hit = value;
    var newSidc = new sidc_1.Sidc(hit.sidc);
    symbolSetValue.value = newSidc.symbolSet;
    if (hit.category === "Main icon") {
        iconValue.value = newSidc.mainIcon;
    }
    else if (hit.category === "Modifier 1") {
        mod1Value.value = newSidc.modifierOne;
    }
    else if (hit.category === "Modifier 2") {
        mod2Value.value = newSidc.modifierTwo;
    }
}
function clearModifiers() {
    mod1Value.value = "00";
    mod2Value.value = "00";
    emtValue.value = "00";
    hqtfdValue.value = "0";
}
function updateFromBrowseTab(sidc) {
    customSymbolId.value = null;
    csidc.value = sidc;
}
function updateFromCustomSymbol(symbolId) {
    var customSymbol = scn.store.state.customSymbolMap[symbolId];
    var sidc = new sidc_1.Sidc(customSymbol ? customSymbol.sidc : "10031000001100000000");
    sidc.standardIdentity = sidValue.value;
    csidc.value = sidc.toString();
    customSymbolId.value = symbolId;
}
function updateFromSidcInput(sidc) {
    if (!/^\d+$/.test(sidc)) {
        return;
    }
    var oldSidc = new sidc_1.Sidc(csidc.value);
    var ns = new sidc_1.Sidc(sidc);
    ns.standardIdentity = oldSidc.standardIdentity;
    csidc.value = ns.toString();
}
(0, vue_1.watch)(currentTab, function (v) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(v === "0" && !isMobile.value)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, vue_1.nextTick)()];
            case 1:
                _b.sent();
                (_a = searchInputRef.value) === null || _a === void 0 ? void 0 : _a.el.focus();
                _b.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
var __VLS_defaultModels = {
    'isVisible': true,
};
var __VLS_modelEmit;
var __VLS_defaults = {
    dialogTitle: "Symbol picker",
    hideModifiers: false,
    hideSymbolColor: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = NewSimpleModal_vue_1.default || NewSimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: (__VLS_ctx.dialogTitle) }), { class: "md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg)" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: (__VLS_ctx.dialogTitle) }), { class: "md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg)" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ cancel: {} },
    { onCancel: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [open, dialogTitle, emit,];
        } });
var __VLS_7 = {};
/** @type {__VLS_StyleScopedClasses['md:max-w-(--breakpoint-md)']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:max-w-(--breakpoint-lg)']} */ ;
var __VLS_8 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onKeyup: (__VLS_ctx.onSubmit) }, { class: "flex h-full flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "mt-4 flex h-20 w-full shrink-0 items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
if (!__VLS_ctx.customSymbol) {
    var __VLS_9 = MilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
        sidc: (__VLS_ctx.csidc),
        size: (34),
        options: (__VLS_ctx.finalSymbolOptions),
    }));
    var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
            sidc: (__VLS_ctx.csidc),
            size: (34),
            options: (__VLS_ctx.finalSymbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_10), false));
    var __VLS_14 = SymbolCodeViewer_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ 'onUpdate': {} }, { sidc: (__VLS_ctx.csidc) })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ 'onUpdate': {} }, { sidc: (__VLS_ctx.csidc) })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    var __VLS_19 = void 0;
    var __VLS_20 = ({ update: {} },
        { onUpdate: (__VLS_ctx.updateFromSidcInput) });
    var __VLS_17;
    var __VLS_18;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ src: (__VLS_ctx.customSymbol.src), alt: (__VLS_ctx.customSymbol.name) }, { class: "w-16 object-contain" }));
    /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
}
var __VLS_21 = ScrollTabs_vue_1.default || ScrollTabs_vue_1.default;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ class: "flex-auto" }, { modelValue: (__VLS_ctx.currentTab), items: (__VLS_ctx.tabItems), unmountOnHide: (false) })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ class: "flex-auto" }, { modelValue: (__VLS_ctx.currentTab), items: (__VLS_ctx.tabItems), unmountOnHide: (false) })], __VLS_functionalComponentArgsRest(__VLS_22), false));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
var __VLS_26 = __VLS_24.slots.default;
var __VLS_27 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ value: "0" }, { class: "mt-6 max-h-[50vh] overflow-auto sm:max-h-[60vh]" })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ value: "0" }, { class: "mt-6 max-h-[50vh] overflow-auto sm:max-h-[60vh]" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[50vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:max-h-[60vh]']} */ ;
var __VLS_32 = __VLS_30.slots.default;
var __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.ComboboxRoot | typeof __VLS_components.ComboboxRoot} */
reka_ui_1.ComboboxRoot;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ 'onUpdate:modelValue': {} }, { ignoreFilter: (true), open: (__VLS_ctx.hitCount > 0) })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { ignoreFilter: (true), open: (__VLS_ctx.hitCount > 0) })], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38;
var __VLS_39 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': (__VLS_ctx.onSelect) });
var __VLS_40 = __VLS_36.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.MagnifyingGlassIcon} */
solid_1.MagnifyingGlassIcon;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign({ class: "text-muted-foreground absolute top-3.5 left-4 h-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground absolute top-3.5 left-4 h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_42), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
var __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.ComboboxInput} */
reka_ui_1.ComboboxInput;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign(__assign({ modelValue: (__VLS_ctx.searchQuery) }, { class: "placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-11 focus:ring-0 sm:text-sm" }), { placeholder: "Search...", ref: "searchInputRef", autoFocus: (true) })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign(__assign({ modelValue: (__VLS_ctx.searchQuery) }, { class: "placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-11 focus:ring-0 sm:text-sm" }), { placeholder: "Search...", ref: "searchInputRef", autoFocus: (true) })], __VLS_functionalComponentArgsRest(__VLS_47), false));
var __VLS_51 = {};
/** @type {__VLS_StyleScopedClasses['placeholder:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-11']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
var __VLS_49;
if (__VLS_ctx.groupedHits && __VLS_ctx.hitCount > 0) {
    var __VLS_53 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ComboboxContent | typeof __VLS_components.ComboboxContent} */
    reka_ui_1.ComboboxContent;
    // @ts-ignore
    var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ class: "border-border bg-popover absolute z-50 max-h-80 w-full scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto rounded border p-4 pb-2 shadow-lg" }, { disableOutsidePointerEvents: (false) })));
    var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ class: "border-border bg-popover absolute z-50 max-h-80 w-full scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto rounded border p-4 pb-2 shadow-lg" }, { disableOutsidePointerEvents: (false) })], __VLS_functionalComponentArgsRest(__VLS_54), false));
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-popover']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-80']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-py-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    var __VLS_58 = __VLS_56.slots.default;
    for (var _i = 0, _f = __VLS_vFor((__VLS_ctx.groupedHits)); _i < _f.length; _i++) {
        var _g = _f[_i][0], source = _g[0], hits = _g[1];
        var __VLS_59 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ComboboxGroup | typeof __VLS_components.ComboboxGroup} */
        reka_ui_1.ComboboxGroup;
        // @ts-ignore
        var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            key: (source),
        }));
        var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
                key: (source),
            }], __VLS_functionalComponentArgsRest(__VLS_60), false));
        var __VLS_64 = __VLS_62.slots.default;
        var __VLS_65 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ComboboxLabel | typeof __VLS_components.ComboboxLabel} */
        reka_ui_1.ComboboxLabel;
        // @ts-ignore
        var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65(__assign({ class: "text-xs font-semibold" })));
        var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign({ class: "text-xs font-semibold" })], __VLS_functionalComponentArgsRest(__VLS_66), false));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        var __VLS_70 = __VLS_68.slots.default;
        (source);
        // @ts-ignore
        [onSubmit, customSymbol, customSymbol, customSymbol, csidc, csidc, finalSymbolOptions, updateFromSidcInput, currentTab, tabItems, hitCount, hitCount, onSelect, searchQuery, groupedHits, groupedHits,];
        var __VLS_68;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-4 mt-2 text-sm font-medium" }));
        /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        for (var _h = 0, _j = __VLS_vFor((hits)); _h < _j.length; _h++) {
            var item = _j[_h][0];
            var __VLS_71 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.ComboboxItem | typeof __VLS_components.ComboboxItem} */
            reka_ui_1.ComboboxItem;
            // @ts-ignore
            var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ key: (item.sidc), value: (item) }, { class: "even:bg-muted/40 data-[highlighted]:bg-army flex cursor-default items-center px-4 py-2 select-none data-[highlighted]:text-white" })));
            var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ key: (item.sidc), value: (item) }, { class: "even:bg-muted/40 data-[highlighted]:bg-army flex cursor-default items-center px-4 py-2 select-none data-[highlighted]:text-white" })], __VLS_functionalComponentArgsRest(__VLS_72), false));
            /** @type {__VLS_StyleScopedClasses['even:bg-muted/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['data-[highlighted]:bg-army']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['data-[highlighted]:text-white']} */ ;
            var __VLS_76 = __VLS_74.slots.default;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex w-12 justify-center" }));
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            var __VLS_77 = MilitarySymbol_vue_1.default;
            // @ts-ignore
            var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
                sidc: (item.sidc),
                size: (30),
                'aria-hidden': "true",
                options: (__assign(__assign({}, __VLS_ctx.combinedSymbolOptions), { outlineColor: 'white', outlineWidth: 4 })),
            }));
            var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([{
                    sidc: (item.sidc),
                    size: (30),
                    'aria-hidden': "true",
                    options: (__assign(__assign({}, __VLS_ctx.combinedSymbolOptions), { outlineColor: 'white', outlineWidth: 4 })),
                }], __VLS_functionalComponentArgsRest(__VLS_78), false));
            __VLS_asFunctionalElement1(__VLS_intrinsics.p)(__assign({ class: "ml-3 flex-auto truncate" }));
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (item.highlight ? item.highlight : item.text) }), null, null);
            /** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            // @ts-ignore
            [combinedSymbolOptions,];
            var __VLS_74;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_62;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_56;
}
// @ts-ignore
[];
var __VLS_36;
var __VLS_37;
if (__VLS_ctx.isLoaded) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { onKeydown: (__VLS_ctx.onSubmit) }), { onKeydown: (__VLS_ctx.onSubmit) }), { class: "space-y-4 p-0.5" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-end gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    var __VLS_82 = SymbolCodeSelect_vue_1.default;
    // @ts-ignore
    var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82(__assign({ class: "flex-auto" }, { modelValue: (__VLS_ctx.symbolSetValue), label: "Symbol set", items: (__VLS_ctx.symbolSets), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })));
    var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([__assign({ class: "flex-auto" }, { modelValue: (__VLS_ctx.symbolSetValue), label: "Symbol set", items: (__VLS_ctx.symbolSets), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_83), false));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mr-1 hidden flex-none sm:block" }));
    /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
    var __VLS_87 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87(__assign(__assign({ 'onClick': {} }, { type: "button" }), { class: "h-10" })));
    var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "button" }), { class: "h-10" })], __VLS_functionalComponentArgsRest(__VLS_88), false));
    var __VLS_92 = void 0;
    var __VLS_93 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isLoaded))
                    return;
                __VLS_ctx.currentTab = '1';
                // @ts-ignore
                [onSubmit, onSubmit, onSubmit, currentTab, combinedSymbolOptions, isLoaded, symbolSetValue, symbolSets,];
            } });
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    var __VLS_94 = __VLS_90.slots.default;
    // @ts-ignore
    [];
    var __VLS_90;
    var __VLS_91;
    if (!__VLS_ctx.hideModifiers) {
        if (__VLS_ctx.showReinforcedStatus) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid gap-4 sm:grid-cols-2" }));
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
            var __VLS_95 = SymbolCodeSelect_vue_1.default;
            // @ts-ignore
            var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
                modelValue: (__VLS_ctx.statusValue),
                label: "Status",
                items: (__VLS_ctx.statusItems),
                symbolOptions: (__VLS_ctx.combinedSymbolOptions),
            }));
            var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([{
                    modelValue: (__VLS_ctx.statusValue),
                    label: "Status",
                    items: (__VLS_ctx.statusItems),
                    symbolOptions: (__VLS_ctx.combinedSymbolOptions),
                }], __VLS_functionalComponentArgsRest(__VLS_96), false));
            var __VLS_100 = SymbolCodeSelect_vue_1.default;
            // @ts-ignore
            var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
                modelValue: (__VLS_ctx.reinforcedReducedValue),
                label: "Reinforced / Reduced",
                items: (__VLS_ctx.reinforcedReducedItems),
                symbolOptions: (__VLS_ctx.combinedSymbolOptions),
            }));
            var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([{
                    modelValue: (__VLS_ctx.reinforcedReducedValue),
                    label: "Reinforced / Reduced",
                    items: (__VLS_ctx.reinforcedReducedItems),
                    symbolOptions: (__VLS_ctx.combinedSymbolOptions),
                }], __VLS_functionalComponentArgsRest(__VLS_101), false));
        }
        else {
            var __VLS_105 = SymbolCodeSelect_vue_1.default;
            // @ts-ignore
            var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
                modelValue: (__VLS_ctx.statusValue),
                label: "Status",
                items: (__VLS_ctx.statusItems),
                symbolOptions: (__VLS_ctx.combinedSymbolOptions),
            }));
            var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([{
                    modelValue: (__VLS_ctx.statusValue),
                    label: "Status",
                    items: (__VLS_ctx.statusItems),
                    symbolOptions: (__VLS_ctx.combinedSymbolOptions),
                }], __VLS_functionalComponentArgsRest(__VLS_106), false));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-4 lg:grid-cols-2" }));
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
        var __VLS_110 = SymbolCodeSelect_vue_1.default;
        // @ts-ignore
        var __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
            modelValue: (__VLS_ctx.hqtfdValue),
            label: "Headquaters / Task force / Dummy",
            items: (__VLS_ctx.hqtfdItems),
            symbolOptions: (__VLS_ctx.combinedSymbolOptions),
        }));
        var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.hqtfdValue),
                label: "Headquaters / Task force / Dummy",
                items: (__VLS_ctx.hqtfdItems),
                symbolOptions: (__VLS_ctx.combinedSymbolOptions),
            }], __VLS_functionalComponentArgsRest(__VLS_111), false));
        var __VLS_115 = SymbolCodeSelect_vue_1.default;
        // @ts-ignore
        var __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
            modelValue: (__VLS_ctx.emtValue),
            label: "Echelon / Mobility / Towed array",
            items: (__VLS_ctx.emtItems),
            symbolOptions: (__VLS_ctx.combinedSymbolOptions),
        }));
        var __VLS_117 = __VLS_116.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.emtValue),
                label: "Echelon / Mobility / Towed array",
                items: (__VLS_ctx.emtItems),
                symbolOptions: (__VLS_ctx.combinedSymbolOptions),
            }], __VLS_functionalComponentArgsRest(__VLS_116), false));
    }
    var __VLS_120 = SymbolCodeMultilineSelect_vue_1.default;
    // @ts-ignore
    var __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        modelValue: (__VLS_ctx.iconValue),
        label: "Main icon",
        items: (__VLS_ctx.icons),
        symbolOptions: (__VLS_ctx.combinedSymbolOptions),
    }));
    var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.iconValue),
            label: "Main icon",
            items: (__VLS_ctx.icons),
            symbolOptions: (__VLS_ctx.combinedSymbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_121), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-4 lg:grid-cols-2" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
    var __VLS_125 = SymbolCodeSelect_vue_1.default;
    // @ts-ignore
    var __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
        modelValue: (__VLS_ctx.mod1Value),
        label: "Modifier 1",
        items: (__VLS_ctx.mod1Items),
        symbolOptions: (__VLS_ctx.combinedSymbolOptions),
    }));
    var __VLS_127 = __VLS_126.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.mod1Value),
            label: "Modifier 1",
            items: (__VLS_ctx.mod1Items),
            symbolOptions: (__VLS_ctx.combinedSymbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_126), false));
    var __VLS_130 = SymbolCodeSelect_vue_1.default;
    // @ts-ignore
    var __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        modelValue: (__VLS_ctx.mod2Value),
        label: "Modifier 2",
        items: (__VLS_ctx.mod2Items),
        symbolOptions: (__VLS_ctx.combinedSymbolOptions),
    }));
    var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.mod2Value),
            label: "Modifier 2",
            items: (__VLS_ctx.mod2Items),
            symbolOptions: (__VLS_ctx.combinedSymbolOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_131), false));
    if (!__VLS_ctx.hideSymbolColor && !__VLS_ctx.customSymbolId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-end gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        var __VLS_135 = SymbolFillColorSelect_vue_1.default;
        // @ts-ignore
        var __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135(__assign({ modelValue: (__VLS_ctx.internalSymbolOptions.fillColor), defaultFillColor: ((_c = __VLS_ctx.inheritedSymbolOptions) === null || _c === void 0 ? void 0 : _c.fillColor) }, { class: "flex-auto" })));
        var __VLS_137 = __VLS_136.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.internalSymbolOptions.fillColor), defaultFillColor: ((_d = __VLS_ctx.inheritedSymbolOptions) === null || _d === void 0 ? void 0 : _d.fillColor) }, { class: "flex-auto" })], __VLS_functionalComponentArgsRest(__VLS_136), false));
        /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
        var __VLS_140 = PopoverColorPicker_vue_1.default || PopoverColorPicker_vue_1.default;
        // @ts-ignore
        var __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
            modelValue: (__VLS_ctx.internalSymbolOptions.fillColor),
        }));
        var __VLS_142 = __VLS_141.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.internalSymbolOptions.fillColor),
            }], __VLS_functionalComponentArgsRest(__VLS_141), false));
        var __VLS_145 = __VLS_143.slots.default;
        {
            var __VLS_146 = __VLS_143.slots.trigger;
            var __VLS_147 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
                type: "button",
                variant: "outline",
                size: "lg",
            }));
            var __VLS_149 = __VLS_148.apply(void 0, __spreadArray([{
                    type: "button",
                    variant: "outline",
                    size: "lg",
                }], __VLS_functionalComponentArgsRest(__VLS_148), false));
            var __VLS_152 = __VLS_150.slots.default;
            // @ts-ignore
            [combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, combinedSymbolOptions, hideModifiers, showReinforcedStatus, statusValue, statusValue, statusItems, statusItems, reinforcedReducedValue, reinforcedReducedItems, hqtfdValue, hqtfdItems, emtValue, emtItems, iconValue, icons, mod1Value, mod1Items, mod2Value, mod2Items, hideSymbolColor, customSymbolId, internalSymbolOptions, internalSymbolOptions, inheritedSymbolOptions,];
            var __VLS_150;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_143;
    }
}
// @ts-ignore
[];
var __VLS_30;
var __VLS_153 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153(__assign({ value: "1" }, { class: "mt-6 max-h-[50vh] sm:max-h-[60vh]" })));
var __VLS_155 = __VLS_154.apply(void 0, __spreadArray([__assign({ value: "1" }, { class: "mt-6 max-h-[50vh] sm:max-h-[60vh]" })], __VLS_functionalComponentArgsRest(__VLS_154), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[50vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:max-h-[60vh]']} */ ;
var __VLS_158 = __VLS_156.slots.default;
var __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive | typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive} */
keepAlive;
// @ts-ignore
var __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({}));
var __VLS_161 = __VLS_160.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_160), false));
var __VLS_164 = __VLS_162.slots.default;
if (__VLS_ctx.currentTab === '1') {
    var __VLS_165 = SymbolBrowseTab_vue_1.default;
    // @ts-ignore
    var __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165(__assign({ 'onUpdateSidc': {} }, { initialSidc: (__VLS_ctx.csidc), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })));
    var __VLS_167 = __VLS_166.apply(void 0, __spreadArray([__assign({ 'onUpdateSidc': {} }, { initialSidc: (__VLS_ctx.csidc), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_166), false));
    var __VLS_170 = void 0;
    var __VLS_171 = ({ updateSidc: {} },
        { onUpdateSidc: (__VLS_ctx.updateFromBrowseTab) });
    var __VLS_168;
    var __VLS_169;
}
// @ts-ignore
[csidc, currentTab, combinedSymbolOptions, updateFromBrowseTab,];
var __VLS_162;
// @ts-ignore
[];
var __VLS_156;
if (!__VLS_ctx.hideCustomSymbols) {
    var __VLS_172 = TabsContent_vue_1.default || TabsContent_vue_1.default;
    // @ts-ignore
    var __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172(__assign({ value: "2" }, { class: "px-4 py-6" })));
    var __VLS_174 = __VLS_173.apply(void 0, __spreadArray([__assign({ value: "2" }, { class: "px-4 py-6" })], __VLS_functionalComponentArgsRest(__VLS_173), false));
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    var __VLS_177 = __VLS_175.slots.default;
    var __VLS_178 = SymbolPickerCustomSymbol_vue_1.default;
    // @ts-ignore
    var __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178(__assign({ 'onUpdateSidc': {} }, { initialSidc: (__VLS_ctx.customSymbolId) })));
    var __VLS_180 = __VLS_179.apply(void 0, __spreadArray([__assign({ 'onUpdateSidc': {} }, { initialSidc: (__VLS_ctx.customSymbolId) })], __VLS_functionalComponentArgsRest(__VLS_179), false));
    var __VLS_183 = void 0;
    var __VLS_184 = ({ updateSidc: {} },
        { onUpdateSidc: (__VLS_ctx.updateFromCustomSymbol) });
    var __VLS_181;
    var __VLS_182;
    // @ts-ignore
    [customSymbolId, hideCustomSymbols, updateFromCustomSymbol,];
    var __VLS_175;
}
var __VLS_185 = TabsContent_vue_1.default || TabsContent_vue_1.default;
// @ts-ignore
var __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185(__assign({ value: (!__VLS_ctx.hideCustomSymbols ? '3' : '2') }, { class: "mt-6" })));
var __VLS_187 = __VLS_186.apply(void 0, __spreadArray([__assign({ value: (!__VLS_ctx.hideCustomSymbols ? '3' : '2') }, { class: "mt-6" })], __VLS_functionalComponentArgsRest(__VLS_186), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
var __VLS_190 = __VLS_188.slots.default;
var __VLS_191;
/** @ts-ignore @type {typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive | typeof __VLS_components.keepAlive | typeof __VLS_components.KeepAlive} */
keepAlive;
// @ts-ignore
var __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({}));
var __VLS_193 = __VLS_192.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_192), false));
var __VLS_196 = __VLS_194.slots.default;
if (__VLS_ctx.currentTab === (!__VLS_ctx.hideCustomSymbols ? '3' : '2')) {
    var __VLS_197 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.LegacyConverter} */
    LegacyConverter;
    // @ts-ignore
    var __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({}));
    var __VLS_199 = __VLS_198.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_198), false));
}
// @ts-ignore
[currentTab, hideCustomSymbols, hideCustomSymbols,];
var __VLS_194;
// @ts-ignore
[];
var __VLS_188;
// @ts-ignore
[];
var __VLS_24;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex shrink-0 justify-end space-x-2 pt-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
var __VLS_202 = SecondaryButton_vue_1.default || SecondaryButton_vue_1.default;
// @ts-ignore
var __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202(__assign(__assign({ 'onClick': {} }, { type: "button" }), { class: "" })));
var __VLS_204 = __VLS_203.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "button" }), { class: "" })], __VLS_functionalComponentArgsRest(__VLS_203), false));
var __VLS_207;
var __VLS_208 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.clearModifiers();
            // @ts-ignore
            [clearModifiers,];
        } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_209 = __VLS_205.slots.default;
// @ts-ignore
[];
var __VLS_205;
var __VLS_206;
var __VLS_210 = PrimaryButton_vue_1.default || PrimaryButton_vue_1.default;
// @ts-ignore
var __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210(__assign({ 'onClick': {} }, { class: "" })));
var __VLS_212 = __VLS_211.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_211), false));
var __VLS_215;
var __VLS_216 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onSubmit();
            // @ts-ignore
            [onSubmit,];
        } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_217 = __VLS_213.slots.default;
// @ts-ignore
[];
var __VLS_213;
var __VLS_214;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_52 = __VLS_51;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
