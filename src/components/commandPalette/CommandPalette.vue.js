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
var reka_ui_1 = require("reka-ui");
var outline_1 = require("@heroicons/vue/24/outline");
var core_1 = require("@vueuse/core");
var searching_ts_1 = require("@/composables/searching.ts");
var CommandPaletteUnitItem_vue_1 = require("@/components/commandPalette/CommandPaletteUnitItem.vue");
var CommandPaletteLayerFeatureItem_vue_1 = require("@/components/commandPalette/CommandPaletteLayerFeatureItem.vue");
var CommandPaletteEventItem_vue_1 = require("@/components/commandPalette/CommandPaletteEventItem.vue");
var geoStore_ts_1 = require("@/stores/geoStore.ts");
var proj_1 = require("ol/proj");
var geosearching_ts_1 = require("@/composables/geosearching.ts");
var CommandPalettePlaceItem_vue_1 = require("@/components/commandPalette/CommandPalettePlaceItem.vue");
var uiStore_ts_1 = require("@/stores/uiStore.ts");
var CommandPaletteActionItem_vue_1 = require("@/components/commandPalette/CommandPaletteActionItem.vue");
var CommandPaletteImageLayerItem_vue_1 = require("@/components/commandPalette/CommandPaletteImageLayerItem.vue");
var CommandPaletteDialog_vue_1 = require("@/components/commandPalette/CommandPaletteDialog.vue");
var CommandPaletteInput_vue_1 = require("@/components/commandPalette/CommandPaletteInput.vue");
var CommandPaletteFooter_vue_1 = require("@/components/commandPalette/CommandPaletteFooter.vue");
var emit = defineEmits([
    "select-unit",
    "select-layer",
    "select-feature",
    "select-place",
    "select-event",
    "select-action",
    "select-image-layer",
]);
var geoStore = (0, geoStore_ts_1.useGeoStore)();
var uiStore = (0, uiStore_ts_1.useUiStore)();
var photonSearch = (0, geosearching_ts_1.useGeoSearch)().photonSearch;
var _a = (0, searching_ts_1.useActionSearch)(), searchActions = _a.searchActions, actionItems = _a.actionItems;
var open = defineModel({ default: false });
var rawQuery = (0, vue_1.ref)("");
var query = (0, vue_1.computed)(function () { return rawQuery.value.replace(/^[#@>]/, ""); });
var showHelp = (0, vue_1.computed)(function () { return rawQuery.value === "?"; });
var isGeoSearch = (0, vue_1.computed)(function () { return uiStore.searchGeoMode || rawQuery.value.startsWith("@"); });
var isActionSearch = (0, vue_1.computed)(function () { return rawQuery.value.startsWith("#") || rawQuery.value.startsWith(">"); });
var debouncedQuery = (0, core_1.useDebounce)(query, 200);
var geoDebouncedQuery = (0, core_1.useDebounce)(query, 500);
var search = (0, searching_ts_1.useScenarioSearch)(searchActions).search;
var groupedHits = (0, vue_1.ref)();
var mapCenter = (0, vue_1.ref)();
var hitCount = (0, vue_1.ref)(0);
(0, vue_1.watch)(open, function (isOpen) {
    if (isOpen) {
        if (geoStore.olMap) {
            var center = geoStore.olMap.getView().getCenter();
            mapCenter.value = center && (0, proj_1.toLonLat)(center);
        }
        else {
            mapCenter.value = null;
        }
    }
});
(0, vue_1.watchEffect)(function () {
    if (isGeoSearch.value || isActionSearch.value || !debouncedQuery.value.trim())
        return;
    var _a = search(debouncedQuery.value), numberOfHits = _a.numberOfHits, groups = _a.groups;
    hitCount.value = numberOfHits;
    groupedHits.value = groups;
});
(0, vue_1.watch)(function () { return isGeoSearch.value && geoDebouncedQuery.value.trim(); }, function (q) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!q)
                    return [2 /*return*/];
                return [4 /*yield*/, photonSearch(q, { mapCenter: mapCenter.value })];
            case 1:
                data = _a.sent();
                groupedHits.value = new Map([
                    ["Places", data.map(function (d) { return (__assign(__assign({}, d), { category: "Places" })); })],
                ]);
                hitCount.value = data.length;
                return [2 /*return*/];
        }
    });
}); });
(0, vue_1.watch)([function () { return isActionSearch.value; }, function () { return query.value.trim(); }], function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var filteredActions;
    var isa = _b[0], q = _b[1];
    return __generator(this, function (_c) {
        if (!isa)
            return [2 /*return*/];
        filteredActions = q ? searchActions(q) : actionItems;
        groupedHits.value = new Map([["Actions", filteredActions]]);
        hitCount.value = filteredActions.length;
        return [2 /*return*/];
    });
}); });
function onSelect(item) {
    if (item.category === "Units")
        emit("select-unit", item.id);
    else if (item.category === "Features") {
        if (item.type === "layer") {
            emit("select-layer", item.id);
        }
        else {
            emit("select-feature", item.id);
        }
    }
    else if (item.category === "Map layers") {
        emit("select-image-layer", item.id);
    }
    else if (item.category === "Events") {
        emit("select-event", item);
    }
    else if (item.category === "Places") {
        emit("select-place", item);
    }
    else if (item.category === "Actions") {
        emit("select-action", item.action);
    }
    open.value = false;
}
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = CommandPaletteDialog_vue_1.default || CommandPaletteDialog_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.open),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        open: (__VLS_ctx.open),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.ListboxRoot | typeof __VLS_components.ListboxRoot} */
reka_ui_1.ListboxRoot;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign(__assign({ 'onUpdate:modelValue': {} }, { dataSlot: "command" }), { class: "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { dataSlot: "command" }), { class: "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ 'update:modelValue': {} },
    { 'onUpdate:modelValue': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onSelect;
            // @ts-ignore
            [open, onSelect,];
        } });
/** @type {__VLS_StyleScopedClasses['bg-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['text-popover-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
var __VLS_14 = __VLS_10.slots.default;
var __VLS_15 = CommandPaletteInput_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.rawQuery),
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.rawQuery),
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.ListboxContent | typeof __VLS_components.ListboxContent} */
reka_ui_1.ListboxContent;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ dataSlot: "command-list" }, { class: "max-h-[60vh] scroll-py-1 overflow-x-hidden overflow-y-auto" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ dataSlot: "command-list" }, { class: "max-h-[60vh] scroll-py-1 overflow-x-hidden overflow-y-auto" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
/** @type {__VLS_StyleScopedClasses['max-h-[60vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
var __VLS_25 = __VLS_23.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    role: "presentation",
});
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.groupedHits)); _i < _b.length; _i++) {
    var _c = _b[_i][0], source = _c[0], hits = _c[1];
    var __VLS_26 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ListboxGroup | typeof __VLS_components.ListboxGroup} */
    reka_ui_1.ListboxGroup;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ key: (source), id: (source), dataSlot: "command-group" }, { class: "text-foreground overflow-hidden p-1" })));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ key: (source), id: (source), dataSlot: "command-group" }, { class: "text-foreground overflow-hidden p-1" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    var __VLS_31 = __VLS_29.slots.default;
    var __VLS_32 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ListboxGroupLabel | typeof __VLS_components.ListboxGroupLabel} */
    reka_ui_1.ListboxGroupLabel;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32(__assign({ dataSlot: "command-group-heading" }, { class: "text-muted-foreground px-2 py-1.5 text-xs font-medium" })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ dataSlot: "command-group-heading" }, { class: "text-muted-foreground px-2 py-1.5 text-xs font-medium" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    var __VLS_37 = __VLS_35.slots.default;
    (source);
    // @ts-ignore
    [rawQuery, groupedHits,];
    var __VLS_35;
    for (var _d = 0, _e = __VLS_vFor((hits)); _d < _e.length; _d++) {
        var item = _e[_d][0];
        var __VLS_38 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ListboxItem | typeof __VLS_components.ListboxItem} */
        reka_ui_1.ListboxItem;
        // @ts-ignore
        var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ key: (item.id), dataSlot: "command-item", value: (item) }, { class: "data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" })));
        var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ key: (item.id), dataSlot: "command-item", value: (item) }, { class: "data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
        /** @type {__VLS_StyleScopedClasses['data-highlighted:bg-accent']} */ ;
        /** @type {__VLS_StyleScopedClasses['data-highlighted:text-accent-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['[&_svg:not([class*=\'text-\'])]:text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['outline-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['data-disabled:pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['data-disabled:opacity-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['[&_svg]:pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['[&_svg]:shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['[&_svg:not([class*=\'size-\'])]:size-4']} */ ;
        var __VLS_43 = __VLS_41.slots.default;
        if (item.category === 'Units') {
            var __VLS_44 = CommandPaletteUnitItem_vue_1.default;
            // @ts-ignore
            var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                item: item,
            }));
            var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{
                    item: item,
                }], __VLS_functionalComponentArgsRest(__VLS_45), false));
        }
        else if (item.category === 'Features') {
            var __VLS_49 = CommandPaletteLayerFeatureItem_vue_1.default;
            // @ts-ignore
            var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
                item: item,
            }));
            var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{
                    item: item,
                }], __VLS_functionalComponentArgsRest(__VLS_50), false));
        }
        else if (item.category === 'Map layers') {
            var __VLS_54 = CommandPaletteImageLayerItem_vue_1.default;
            // @ts-ignore
            var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                item: item,
            }));
            var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
                    item: item,
                }], __VLS_functionalComponentArgsRest(__VLS_55), false));
        }
        else if (item.category === 'Events') {
            var __VLS_59 = CommandPaletteEventItem_vue_1.default;
            // @ts-ignore
            var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
                item: item,
            }));
            var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
                    item: item,
                }], __VLS_functionalComponentArgsRest(__VLS_60), false));
        }
        else if (item.category === 'Places') {
            var __VLS_64 = CommandPalettePlaceItem_vue_1.default;
            // @ts-ignore
            var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
                item: item,
                center: (__VLS_ctx.mapCenter),
            }));
            var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
                    item: item,
                    center: (__VLS_ctx.mapCenter),
                }], __VLS_functionalComponentArgsRest(__VLS_65), false));
        }
        else if (item.category === 'Actions') {
            var __VLS_69 = CommandPaletteActionItem_vue_1.default;
            // @ts-ignore
            var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
                item: item,
            }));
            var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([{
                    item: item,
                }], __VLS_functionalComponentArgsRest(__VLS_70), false));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (item);
        }
        // @ts-ignore
        [mapCenter,];
        var __VLS_41;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_29;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
if (__VLS_ctx.geoDebouncedQuery !== '' && __VLS_ctx.rawQuery !== '?' && __VLS_ctx.hitCount === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "px-6 py-14 text-center text-sm sm:px-14" }));
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-14']} */ ;
    var __VLS_74 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ExclamationTriangleIcon} */
    outline_1.ExclamationTriangleIcon;
    // @ts-ignore
    var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ class: "text-muted-foreground mx-auto size-6" }, { 'aria-hidden': "true" })));
    var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground mx-auto size-6" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_75), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
}
var __VLS_79 = CommandPaletteFooter_vue_1.default;
// @ts-ignore
var __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79(__assign(__assign({ 'onClickActions': {} }, { rawQuery: (__VLS_ctx.rawQuery) }), { class: "border-border border-t" })));
var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([__assign(__assign({ 'onClickActions': {} }, { rawQuery: (__VLS_ctx.rawQuery) }), { class: "border-border border-t" })], __VLS_functionalComponentArgsRest(__VLS_80), false));
var __VLS_84;
var __VLS_85 = ({ clickActions: {} },
    { onClickActions: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.rawQuery = '>';
            // @ts-ignore
            [rawQuery, rawQuery, rawQuery, geoDebouncedQuery, hitCount,];
        } });
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
var __VLS_82;
var __VLS_83;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
