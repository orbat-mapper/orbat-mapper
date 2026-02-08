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
var reka_ui_1 = require("reka-ui");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var utils_ts_1 = require("@/lib/utils.ts");
var lucide_vue_next_1 = require("lucide-vue-next");
var props = defineProps();
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var tabItems = (0, vue_1.computed)(function () {
    return props.items.map(function (tab, index) {
        var _a, _b;
        if (typeof tab === "string") {
            return {
                label: tab,
                value: index.toString(),
                disabled: false,
            };
        }
        else
            return {
                label: tab.label,
                value: (_a = tab.value) !== null && _a !== void 0 ? _a : index.toString(),
                disabled: (_b = tab.disabled) !== null && _b !== void 0 ? _b : false,
            };
    });
});
var scrollRef = (0, vue_1.useTemplateRef)({});
var x = (0, core_1.useScroll)(scrollRef, { behavior: "smooth" }).x;
var startTarget = (0, vue_1.useTemplateRef)({});
var startMarkerIsVisible = (0, core_1.useElementVisibility)(startTarget, { initialValue: true });
var endTarget = (0, vue_1.useTemplateRef)({});
var endMarkerIsVisible = (0, core_1.useElementVisibility)(endTarget, { initialValue: true });
(0, vue_1.watch)(function () { return props.modelValue; }, function () { return __awaiter(void 0, void 0, void 0, function () {
    var activeTab, container, containerWidth, scrollLeft, leftBuffer, rightBuffer, tabLeft, tabRight;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, vue_1.nextTick)()];
            case 1:
                _b.sent();
                activeTab = (_a = scrollRef.value) === null || _a === void 0 ? void 0 : _a.querySelector('[data-state="active"]');
                if (!activeTab || !scrollRef.value)
                    return [2 /*return*/];
                container = scrollRef.value;
                containerWidth = container.offsetWidth;
                scrollLeft = container.scrollLeft;
                leftBuffer = 40;
                rightBuffer = 40;
                tabLeft = activeTab.offsetLeft;
                tabRight = tabLeft + activeTab.offsetWidth;
                if (tabLeft < scrollLeft + leftBuffer) {
                    x.value = tabLeft - leftBuffer;
                }
                else if (tabRight > scrollLeft + containerWidth - rightBuffer) {
                    x.value = tabRight - containerWidth + rightBuffer;
                }
                return [2 /*return*/];
        }
    });
}); });
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.TabsRoot | typeof __VLS_components.TabsRoot} */
reka_ui_1.TabsRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "tabs" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('flex h-full flex-col', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "tabs" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('flex h-full flex-col', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var slotProps = __VLS_vSlot(__VLS_6)[0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "border-b-primary/20 flex shrink-0 items-center justify-between border-b" }));
    /** @type {__VLS_StyleScopedClasses['border-b-primary/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex min-w-0 flex-1 overflow-hidden" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.x -= 120;
            // @ts-ignore
            [forwarded, utils_ts_1.cn, x,];
        } }, { class: "hover:text-foreground bg-muted/80 absolute inset-y-0 left-0 z-10 flex cursor-pointer items-center justify-center px-1 disabled:pointer-events-none disabled:opacity-0" }), { disabled: (__VLS_ctx.startMarkerIsVisible), 'aria-label': "Scroll left" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-muted/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-0']} */ ;
    var __VLS_7 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ChevronLeft} */
    lucide_vue_next_1.ChevronLeft;
    // @ts-ignore
    var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: "text-muted-foreground size-6" })));
    var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-6" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "no-scrollbar flex-1 overflow-x-auto" }, { ref: "scrollRef" }));
    /** @type {__VLS_StyleScopedClasses['no-scrollbar']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    var __VLS_12 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
    reka_ui_1.TabsList;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "relative flex w-max gap-0 px-2" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "relative flex w-max gap-0 px-2" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-max']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    var __VLS_17 = __VLS_15.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ ref: "startTarget" }, { class: "absolute top-0 bottom-0 left-0 w-px" }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
    for (var _i = 0, _a = __VLS_vFor((__VLS_ctx.tabItems)); _i < _a.length; _i++) {
        var _b = _a[_i][0], value = _b.value, label = _b.label, disabled = _b.disabled;
        var __VLS_18 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
        reka_ui_1.TabsTrigger;
        // @ts-ignore
        var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign(__assign({ key: (value), value: value }, { class: "data-[state=active]:text-primary hover:text-primary/90 text-muted-foreground data-[state=active]:border-b-primary border-b-2 border-transparent px-3 py-4 text-sm font-medium whitespace-nowrap focus-visible:outline-1 focus-visible:outline-dashed disabled:pointer-events-none disabled:opacity-50 sm:py-3.5" }), { disabled: disabled })));
        var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign(__assign({ key: (value), value: value }, { class: "data-[state=active]:text-primary hover:text-primary/90 text-muted-foreground data-[state=active]:border-b-primary border-b-2 border-transparent px-3 py-4 text-sm font-medium whitespace-nowrap focus-visible:outline-1 focus-visible:outline-dashed disabled:pointer-events-none disabled:opacity-50 sm:py-3.5" }), { disabled: disabled })], __VLS_functionalComponentArgsRest(__VLS_19), false));
        /** @type {__VLS_StyleScopedClasses['data-[state=active]:text-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-primary/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['data-[state=active]:border-b-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:outline-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:outline-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:py-3.5']} */ ;
        var __VLS_23 = __VLS_21.slots.default;
        (label);
        // @ts-ignore
        [startMarkerIsVisible, tabItems,];
        var __VLS_21;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ ref: "endTarget" }, { class: "w-4 flex-none" }));
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    // @ts-ignore
    [];
    var __VLS_15;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.x += 120;
            // @ts-ignore
            [x,];
        } }, { class: "hover:text-foreground bg-muted/80 absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center justify-center px-1 disabled:pointer-events-none disabled:opacity-0" }), { disabled: (__VLS_ctx.endMarkerIsVisible), 'aria-label': "Scroll right" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-muted/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-0']} */ ;
    var __VLS_24 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ChevronRight} */
    lucide_vue_next_1.ChevronRight;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ class: "text-muted-foreground size-6" })));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-6" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    var __VLS_29 = {};
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-auto overflow-y-auto" }));
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    var __VLS_31 = __assign({}, (slotProps));
    // @ts-ignore
    [endMarkerIsVisible,];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_30 = __VLS_29, __VLS_32 = __VLS_31;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
