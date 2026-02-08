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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var PanelSymbolButton_vue_1 = require("@/components/PanelSymbolButton.vue");
var popover_1 = require("@/components/ui/popover");
var tabs_1 = require("@/components/ui/tabs");
var vue_1 = require("vue");
var mainToolbarData_1 = require("@/composables/mainToolbarData");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var button_1 = require("@/components/ui/button");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var props = defineProps();
var getModalSidc = (0, utils_1.injectStrict)(injects_1.sidcModalKey).getModalSidc;
var _a = (0, mainToolbarData_1.useToolbarUnitSymbolData)(), iconItems = _a.iconItems, customIcon = _a.customIcon, customSidc = _a.customSidc, symbolPage = _a.symbolPage;
var store = (0, mainToolbarStore_1.useMainToolbarStore)();
var isOpen = (0, vue_1.ref)(false);
var symbolTabs = (0, vue_1.ref)([
    { title: "Land", sidc: "30031000001211000000", id: "land" },
    { title: "Sea", sidc: "10033000001201000000", id: "sea" },
    { title: "Air", sidc: "30030100001101000000", id: "air" },
]);
var panelItems = [
    { label: "Add symbol to panel", action: function () { return handleChangeSymbol(); } },
];
function handleChangeSymbol() {
    return __awaiter(this, void 0, void 0, function () {
        var newSidcValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getModalSidc(customSidc.value, {
                        title: "Select symbol",
                        hideModifiers: true,
                        hideSymbolColor: true,
                        symbolOptions: props.symbolOptions,
                    })];
                case 1:
                    newSidcValue = _a.sent();
                    if (newSidcValue !== undefined) {
                        customIcon.value.code = newSidcValue.sidc;
                        props.addUnit(customSidc.value);
                        isOpen.value = false;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function onAddUnit(sidc) {
    props.addUnit(sidc);
    isOpen.value = false;
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
popover_1.Popover;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.isOpen),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.isOpen),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.PopoverTrigger | typeof __VLS_components.PopoverTrigger} */
popover_1.PopoverTrigger;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { title: "Select icons", asChild: true })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Select icons", asChild: true })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.clearToolbar();
            // @ts-ignore
            [isOpen, store,];
        } });
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    variant: "ghost",
    size: "icon",
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        variant: "ghost",
        size: "icon",
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20 = __VLS_18.slots.default;
var __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.IconChevronUp} */
vue_mdi_1.IconChevronUp;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ class: "size-6" }, { class: ({ 'scale-150 text-red-800': __VLS_ctx.isOpen }) })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ class: "size-6" }, { class: ({ 'scale-150 text-red-800': __VLS_ctx.isOpen }) })], __VLS_functionalComponentArgsRest(__VLS_22), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-150']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-800']} */ ;
// @ts-ignore
[isOpen,];
var __VLS_18;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.PopoverContent | typeof __VLS_components.PopoverContent} */
popover_1.PopoverContent;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign(__assign({ 'onKeydown': {} }, { class: "p-2 px-1" }), { align: "center", side: "top", sideOffset: (10) })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign(__assign({ 'onKeydown': {} }, { class: "p-2 px-1" }), { align: "center", side: "top", sideOffset: (10) })], __VLS_functionalComponentArgsRest(__VLS_27), false));
var __VLS_31;
var __VLS_32 = ({ keydown: {} },
    { onKeydown: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.isOpen = false;
            // @ts-ignore
            [isOpen,];
        } });
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
var __VLS_33 = __VLS_29.slots.default;
var __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign({ modelValue: (__VLS_ctx.symbolPage) }, { class: "w-full" })));
var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.symbolPage) }, { class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_35), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_39 = __VLS_37.slots.default;
var __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign({ class: "border-border flex h-10 w-full" })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ class: "border-border flex h-10 w-full" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_45 = __VLS_43.slots.default;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.symbolTabs)); _i < _b.length; _i++) {
    var _c = _b[_i][0], id = _c.id, title = _c.title, sidc = _c.sidc;
    var __VLS_46 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        key: (id),
        value: (id),
        title: (title),
    }));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
            key: (id),
            value: (id),
            title: (title),
        }], __VLS_functionalComponentArgsRest(__VLS_47), false));
    var __VLS_51 = __VLS_49.slots.default;
    var __VLS_52 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign(__assign({ sidc: (sidc), title: (title), size: (15) }, { class: "size-6" }), { options: ({
            monoColor: 'currentColor',
            strokeWidth: 8,
        }) })));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign(__assign({ sidc: (sidc), title: (title), size: (15) }, { class: "size-6" }), { options: ({
                monoColor: 'currentColor',
                strokeWidth: 8,
            }) })], __VLS_functionalComponentArgsRest(__VLS_53), false));
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    // @ts-ignore
    [symbolPage, symbolTabs,];
    var __VLS_49;
    // @ts-ignore
    [];
}
var __VLS_57 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign({ items: (__VLS_ctx.panelItems) }, { class: "" })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ items: (__VLS_ctx.panelItems) }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
// @ts-ignore
[panelItems,];
var __VLS_43;
// @ts-ignore
[];
var __VLS_37;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-3 grid h-20 grid-cols-5 place-items-center items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-5']} */ ;
/** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var _loop_1 = function (sidc, text) {
    var __VLS_62 = PanelSymbolButton_vue_1.default;
    // @ts-ignore
    var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62(__assign(__assign({ 'onClick': {} }, { class: "" }), { key: (sidc), sidc: (sidc), title: (text), symbolOptions: (__VLS_ctx.symbolOptions) })));
    var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { class: "" }), { key: (sidc), sidc: (sidc), title: (text), symbolOptions: (__VLS_ctx.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_63), false));
    var __VLS_67 = void 0;
    var __VLS_68 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onAddUnit(sidc);
                // @ts-ignore
                [iconItems, symbolOptions, onAddUnit,];
            } });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    // @ts-ignore
    [];
};
var __VLS_65, __VLS_66;
for (var _d = 0, _e = __VLS_vFor((__VLS_ctx.iconItems)); _d < _e.length; _d++) {
    var _f = _e[_d][0], sidc = _f.sidc, text = _f.text;
    _loop_1(sidc, text);
}
var __VLS_69 = PanelSymbolButton_vue_1.default;
// @ts-ignore
var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69(__assign(__assign({ 'onClick': {} }, { class: "" }), { sidc: (__VLS_ctx.customSidc), title: (__VLS_ctx.customIcon.text), symbolOptions: (__VLS_ctx.symbolOptions) })));
var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { class: "" }), { sidc: (__VLS_ctx.customSidc), title: (__VLS_ctx.customIcon.text), symbolOptions: (__VLS_ctx.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_70), false));
var __VLS_74;
var __VLS_75 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onAddUnit(__VLS_ctx.customSidc);
            // @ts-ignore
            [symbolOptions, onAddUnit, customSidc, customSidc, customIcon,];
        } });
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_72;
var __VLS_73;
var __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", type: "button", title: "Add symbol" })));
var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", type: "button", title: "Add symbol" })], __VLS_functionalComponentArgsRest(__VLS_77), false));
var __VLS_81;
var __VLS_82 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.handleChangeSymbol();
            // @ts-ignore
            [handleChangeSymbol,];
        } });
var __VLS_83 = __VLS_79.slots.default;
var __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.AddSymbolIcon} */
vue_mdi_1.IconPlus;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84(__assign({ class: "size-5" })));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_85), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_79;
var __VLS_80;
// @ts-ignore
[];
var __VLS_29;
var __VLS_30;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
