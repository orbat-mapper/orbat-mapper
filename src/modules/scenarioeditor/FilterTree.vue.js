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
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var reka_ui_1 = require("reka-ui");
var solid_1 = require("@heroicons/vue/20/solid");
var badge_1 = require("@/components/ui/badge");
exports.default = {};
var __VLS_export = await (function () { return __awaiter(void 0, void 0, void 0, function () {
    var props, emit, expandedKeys, __VLS_modelEmit, __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives, __VLS_0, __VLS_1, __VLS_2, __VLS_5, __VLS_6, flattenItems, _loop_1, __VLS_29, __VLS_35, __VLS_10, __VLS_11, _i, _a, item, __VLS_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                props = defineProps();
                emit = defineEmits(["select", "clearByKey", "clear", "exclude", "clearExclude"]);
                expandedKeys = defineModel("expandedKeys");
                __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
                /** @ts-ignore @type {typeof __VLS_components.TreeRoot | typeof __VLS_components.TreeRoot} */
                reka_ui_1.TreeRoot;
                __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "list-none rounded-lg text-sm select-none" }, { items: (__VLS_ctx.tree), getKey: (function (item) { return item.key; }), expanded: (__VLS_ctx.expandedKeys) })));
                __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "list-none rounded-lg text-sm select-none" }, { items: (__VLS_ctx.tree), getKey: (function (item) { return item.key; }), expanded: (__VLS_ctx.expandedKeys) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
                __VLS_5 = {};
                /** @type {__VLS_StyleScopedClasses['list-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
                {
                    __VLS_6 = __VLS_3.slots.default;
                    flattenItems = __VLS_vSlot(__VLS_6)[0].flattenItems;
                    _loop_1 = function (item) {
                        var __VLS_7 = void 0;
                        /** @ts-ignore @type {typeof __VLS_components.TreeItem | typeof __VLS_components.TreeItem} */
                        reka_ui_1.TreeItem;
                        // @ts-ignore
                        var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onToggle': {} }), { key: (item._id) }), { style: ({ 'padding-left': "".concat(item.level - 1, "em") }) }), (item.bind)), { class: "focus:ring-accent-foreground/50 data-selected:bg-accent/50 group even:bg-muted/60 dark:even:bg-muted/50 hover:bg-muted my-0.5 flex items-center rounded px-2 py-1 outline-hidden focus:ring-2" }), { class: ({ 'opacity-50': __VLS_ctx.excludedKeys.has(item._id) }) })));
                        var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onToggle': {} }), { key: (item._id) }), { style: ({ 'padding-left': "".concat(item.level - 1, "em") }) }), (item.bind)), { class: "focus:ring-accent-foreground/50 data-selected:bg-accent/50 group even:bg-muted/60 dark:even:bg-muted/50 hover:bg-muted my-0.5 flex items-center rounded px-2 py-1 outline-hidden focus:ring-2" }), { class: ({ 'opacity-50': __VLS_ctx.excludedKeys.has(item._id) }) })], __VLS_functionalComponentArgsRest(__VLS_8), false));
                        var __VLS_12 = void 0;
                        var __VLS_13 = ({ select: {} },
                            { onSelect: function () {
                                    var _a = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        _a[_i] = arguments[_i];
                                    }
                                    var $event = _a[0];
                                    __VLS_ctx.emit('select', $event);
                                    // @ts-ignore
                                    [tree, expandedKeys, excludedKeys, emit,];
                                } });
                        var __VLS_14 = ({ toggle: {} },
                            { onToggle: (function (event) {
                                    if (event.detail.originalEvent.type === 'click')
                                        event.preventDefault();
                                }) });
                        /** @type {__VLS_StyleScopedClasses['focus:ring-accent-foreground/50']} */ ;
                        /** @type {__VLS_StyleScopedClasses['data-selected:bg-accent/50']} */ ;
                        /** @type {__VLS_StyleScopedClasses['group']} */ ;
                        /** @type {__VLS_StyleScopedClasses['even:bg-muted/60']} */ ;
                        /** @type {__VLS_StyleScopedClasses['dark:even:bg-muted/50']} */ ;
                        /** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
                        /** @type {__VLS_StyleScopedClasses['my-0.5']} */ ;
                        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                        /** @type {__VLS_StyleScopedClasses['outline-hidden']} */ ;
                        /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
                        {
                            var __VLS_15 = __VLS_10.slots.default;
                            var _c = __VLS_vSlot(__VLS_15)[0], isExpanded = _c.isExpanded, handleToggle = _c.handleToggle;
                            if (item.hasChildren) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (handleToggle) }, { type: "button", tabindex: "-1" }), { class: "" }));
                                /** @type {__VLS_StyleScopedClasses['']} */ ;
                                var __VLS_16 = void 0;
                                /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
                                solid_1.ChevronRightIcon;
                                // @ts-ignore
                                var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign({ class: "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 transition hover:font-medium" }, { class: ({
                                        'rotate-90': isExpanded,
                                    }) })));
                                var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 transition hover:font-medium" }, { class: ({
                                            'rotate-90': isExpanded,
                                        }) })], __VLS_functionalComponentArgsRest(__VLS_17), false));
                                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['dark:text-muted-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['dark:group-hover:text-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
                                /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
                                /** @type {__VLS_StyleScopedClasses['transition']} */ ;
                                /** @type {__VLS_StyleScopedClasses['hover:font-medium']} */ ;
                                /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
                            }
                            else {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.span)(__assign({ class: "h-6 w-6" }));
                                /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
                                /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
                            }
                            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-center justify-between pl-0" }));
                            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                            /** @type {__VLS_StyleScopedClasses['pl-0']} */ ;
                            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex cursor-pointer items-center gap-1" }));
                            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                            var __VLS_21 = NewMilitarySymbol_vue_1.default;
                            // @ts-ignore
                            var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ sidc: (item.value.sidc), size: (16), options: ({ monoColor: 'currentColor' }) }, { class: "text-foreground/90 w-7" })));
                            var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ sidc: (item.value.sidc), size: (16), options: ({ monoColor: 'currentColor' }) }, { class: "text-foreground/90 w-7" })], __VLS_functionalComponentArgsRest(__VLS_22), false));
                            /** @type {__VLS_StyleScopedClasses['text-foreground/90']} */ ;
                            /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
                            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                            (item.value.label);
                            var __VLS_26 = void 0;
                            /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                            badge_1.Badge;
                            // @ts-ignore
                            var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ variant: "outline" }, { class: "ml-1" })));
                            var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ variant: "outline" }, { class: "ml-1" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
                            /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
                            var __VLS_31 = __VLS_29.slots.default;
                            (__VLS_ctx.stats[item.value.key]);
                            // @ts-ignore
                            [stats,];
                            if (__VLS_ctx.selectedStats[item._id]) {
                                var __VLS_32 = void 0;
                                /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                                badge_1.Badge;
                                // @ts-ignore
                                var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign(__assign({ variant: "secondary" }, { class: "border-border border" }), { asChild: true })));
                                var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign(__assign({ variant: "secondary" }, { class: "border-border border" }), { asChild: true })], __VLS_functionalComponentArgsRest(__VLS_33), false));
                                /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
                                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                                var __VLS_37 = __VLS_35.slots.default;
                                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                                        var _a = [];
                                        for (var _i = 0; _i < arguments.length; _i++) {
                                            _a[_i] = arguments[_i];
                                        }
                                        var $event = _a[0];
                                        if (!(__VLS_ctx.selectedStats[item._id]))
                                            return;
                                        __VLS_ctx.emit('clear', item._id);
                                        // @ts-ignore
                                        [emit, selectedStats,];
                                    } }, { type: "button", title: "Clear selected" }));
                                (__VLS_ctx.selectedStats[item._id]);
                                // @ts-ignore
                                [selectedStats,];
                            }
                            else if (!__VLS_ctx.excludedKeys.has(item._id)) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                                        var _a = [];
                                        for (var _i = 0; _i < arguments.length; _i++) {
                                            _a[_i] = arguments[_i];
                                        }
                                        var $event = _a[0];
                                        if (!!(__VLS_ctx.selectedStats[item._id]))
                                            return;
                                        if (!(!__VLS_ctx.excludedKeys.has(item._id)))
                                            return;
                                        __VLS_ctx.emit('exclude', item._id);
                                        // @ts-ignore
                                        [excludedKeys, emit,];
                                    } }, { type: "button", title: "Exclude" }));
                                var __VLS_38 = void 0;
                                /** @ts-ignore @type {typeof __VLS_components.IconMinusCircleOutline} */
                                vue_mdi_1.IconMinusCircleOutline;
                                // @ts-ignore
                                var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ class: "group-hover:text-muted-foreground group-focus:text-muted-foreground text-muted-foreground h-5 w-5" })));
                                var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ class: "group-hover:text-muted-foreground group-focus:text-muted-foreground text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
                                /** @type {__VLS_StyleScopedClasses['group-hover:text-muted-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['group-focus:text-muted-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                            }
                            else {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                                        var _a = [];
                                        for (var _i = 0; _i < arguments.length; _i++) {
                                            _a[_i] = arguments[_i];
                                        }
                                        var $event = _a[0];
                                        if (!!(__VLS_ctx.selectedStats[item._id]))
                                            return;
                                        if (!!(!__VLS_ctx.excludedKeys.has(item._id)))
                                            return;
                                        __VLS_ctx.emit('clearExclude', item._id);
                                        // @ts-ignore
                                        [emit,];
                                    } }, { type: "button", title: "Clear exclude" }));
                                var __VLS_43 = void 0;
                                /** @ts-ignore @type {typeof __VLS_components.IconClose} */
                                vue_mdi_1.IconClose;
                                // @ts-ignore
                                var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ class: "text-foreground h-5 w-5" })));
                                var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ class: "text-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_44), false));
                                /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
                                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                            }
                            // @ts-ignore
                            [];
                            __VLS_10.slots['' /* empty slot name completion */];
                        }
                        // @ts-ignore
                        [];
                    };
                    for (_i = 0, _a = __VLS_vFor((flattenItems)); _i < _a.length; _i++) {
                        item = _a[_i][0];
                        _loop_1(item);
                    }
                    // @ts-ignore
                    [];
                    __VLS_3.slots['' /* empty slot name completion */];
                }
                // @ts-ignore
                [];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('vue'); })];
            case 1: return [2 /*return*/, (_b.sent()).defineComponent({
                    emits: __assign(__assign({}, {}), {}),
                    __typeProps: {},
                })];
        }
    });
}); })();
