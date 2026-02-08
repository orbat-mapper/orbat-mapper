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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var breadcrumb_1 = require("@/components/ui/breadcrumb");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_vue_next_1 = require("lucide-vue-next");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var scroll_area_1 = require("@/components/ui/scroll-area");
var core_1 = require("@vueuse/core");
var dragStore_1 = require("@/stores/dragStore");
var CloseButton_vue_1 = require("@/components/CloseButton.vue");
var uiStore_1 = require("@/stores/uiStore");
var UnitBreadcrumbItem_vue_1 = require("@/modules/scenarioeditor/UnitBreadcrumbItem.vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var _c = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _c.unitActions, state = _c.store.state, _d = _c.helpers, getUnitById = _d.getUnitById, getSideById = _d.getSideById, getSideGroupById = _d.getSideGroupById;
var _e = (0, dragStore_1.useActiveUnitStore)(), activeParentId = _e.activeParentId, activeUnitId = _e.activeUnitId, resetActiveParent = _e.resetActiveParent, activeParent = _e.activeParent;
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("md");
var uiSettings = (0, uiStore_1.useUiStore)();
var isDragged = (0, vue_1.ref)(false);
var sides = (0, vue_1.computed)(function () {
    return state.sides.map(function (side) { return getSideById(side); });
});
(0, vue_1.watch)(activeUnitId, function (value, oldValue) {
    var _a;
    if (value) {
        activeParentId.value = value;
    }
    else {
        activeParentId.value = (_a = activeParent.value) === null || _a === void 0 ? void 0 : _a._pid;
    }
}, { flush: "sync" });
var breadcrumbItems = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    if (!activeParentId.value)
        return [];
    var _e = unitActions.getUnitHierarchy(activeParentId.value), side = _e.side, sideGroup = _e.sideGroup, parents = _e.parents;
    parents.push(activeParent.value);
    try {
        var parentsWithItems = parents.map(function (uunit) {
            var _a, _b, _c;
            var parent = (_b = (_a = getUnitById(uunit._pid)) !== null && _a !== void 0 ? _a : getSideGroupById(uunit._pid)) !== null && _b !== void 0 ? _b : getSideById(uunit._pid);
            if (!parent)
                return { name: uunit.name, items: [] };
            return {
                name: uunit.shortName || uunit.name,
                sidc: uunit.sidc || "",
                location: Boolean((_c = uunit._state) === null || _c === void 0 ? void 0 : _c.location),
                id: uunit.id,
                symbolOptions: unitActions.getCombinedSymbolOptions(uunit),
                items: __spreadArray(__spreadArray([], parent.subUnits.map(getUnitById).map(function (subUnit) {
                    var _a;
                    return (__assign(__assign({}, subUnit), { symbolOptions: unitActions.getCombinedSymbolOptions(subUnit), location: Boolean((_a = subUnit._state) === null || _a === void 0 ? void 0 : _a.location) }));
                }), true), ("groups" in parent
                    ? side.groups.map(function (group) { return getSideGroupById(group); })
                    : []), true),
            };
        });
        var sideGroups = __spreadArray(__spreadArray([], side.subUnits.map(function (unitId) { return (__assign(__assign({}, getUnitById(unitId)), { symbolOptions: unitActions.getCombinedSymbolOptions(getUnitById(unitId)) })); }), true), side.groups.map(function (group) { return getSideGroupById(group); }), true);
        var res = __spreadArray([
            {
                name: isMobile.value ? side.name.slice(0, 2) : side.name,
                items: sides.value,
                id: side.id,
                sidc: "",
            },
            sideGroup
                ? {
                    name: isMobile.value ? sideGroup.name.slice(0, 2) : sideGroup.name,
                    items: sideGroups,
                    id: sideGroup.id,
                    sidc: "",
                }
                : null
        ], parentsWithItems, true).filter(function (i) { return i !== null; });
        if ((_b = (_a = activeParent.value) === null || _a === void 0 ? void 0 : _a.subUnits) === null || _b === void 0 ? void 0 : _b.length) {
            res.push({
                sidc: "",
                id: activeUnitId.value,
                name: "...",
                items: (_d = (_c = activeParent.value) === null || _c === void 0 ? void 0 : _c.subUnits) === null || _d === void 0 ? void 0 : _d.map(function (unitId) {
                    var _a;
                    var unit = getUnitById(unitId);
                    return __assign(__assign({}, getUnitById(unit.id)), { symbolOptions: unitActions.getCombinedSymbolOptions(unit), location: Boolean((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location) });
                }),
            });
        }
        return res;
    }
    catch (e) {
        resetActiveParent();
        return [];
    }
});
function onItemClick(entityId) {
    var _a;
    var unit = getUnitById(entityId);
    var _b = unitActions.getUnitHierarchy(entityId), side = _b.side, sideGroup = _b.sideGroup, parents = _b.parents;
    if (!unit) {
        var id = void 0;
        if (sideGroup) {
            id = sideGroup.subUnits[0];
        }
        else {
            var sideGroup_1 = getSideGroupById(side.groups[0]);
            id = (_a = side === null || side === void 0 ? void 0 : side.subUnits[0]) !== null && _a !== void 0 ? _a : sideGroup_1 === null || sideGroup_1 === void 0 ? void 0 : sideGroup_1.subUnits[0];
        }
        unit = getUnitById(id);
    }
    if (unit) {
        activeParentId.value = unit.id;
        activeUnitId.value = unit.id;
        return;
    }
}
var cleanup = function () { };
(0, vue_1.onMounted)(function () {
    cleanup = (0, adapter_1.monitorForElements)({
        canMonitor: function (_a) {
            var source = _a.source;
            return (0, draggables_1.isUnitDragItem)(source.data) && source.data.source === "breadcrumbs";
        },
        onDragStart: function () { return (isDragged.value = true); },
        onDrop: function () { return (isDragged.value = false); },
    });
});
(0, vue_1.onUnmounted)(function () {
    cleanup();
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ScrollArea | typeof __VLS_components.ScrollArea} */
scroll_area_1.ScrollArea;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "relative flex border-b p-4 sm:p-3" }, { class: (__VLS_ctx.isDragged ? 'bg-muted' : 'bg-sidebar') })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "relative flex border-b p-4 sm:p-3" }, { class: (__VLS_ctx.isDragged ? 'bg-muted' : 'bg-sidebar') })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-3']} */ ;
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = CloseButton_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ 'onClick': {} }, { class: "absolute top-2 right-2 hidden sm:block" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "absolute top-2 right-2 hidden sm:block" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12;
var __VLS_13 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.uiSettings.showOrbatBreadcrumbs = false;
            // @ts-ignore
            [isDragged, uiSettings,];
        } });
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "sm:flex sm:items-center sm:justify-center" }));
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:justify-center']} */ ;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Breadcrumb | typeof __VLS_components.Breadcrumb} */
breadcrumb_1.Breadcrumb;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ class: "w-max" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ class: "w-max" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
/** @type {__VLS_StyleScopedClasses['w-max']} */ ;
var __VLS_19 = __VLS_17.slots.default;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.BreadcrumbList | typeof __VLS_components.BreadcrumbList} */
breadcrumb_1.BreadcrumbList;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25 = __VLS_23.slots.default;
var _loop_1 = function (item, index) {
    var __VLS_26 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.BreadcrumbItem | typeof __VLS_components.BreadcrumbItem} */
    breadcrumb_1.BreadcrumbItem;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ class: "text-primary" })));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ class: "text-primary" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    var __VLS_31 = __VLS_29.slots.default;
    if (((_b = (_a = item.items) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) >= 1) {
        var __VLS_32 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
        dropdown_menu_1.DropdownMenu;
        // @ts-ignore
        var __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
        var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_33), false));
        var __VLS_37 = __VLS_35.slots.default;
        var __VLS_38 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
        dropdown_menu_1.DropdownMenuTrigger;
        // @ts-ignore
        var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ class: "flex items-center gap-1" })));
        var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ class: "flex items-center gap-1" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        var __VLS_43 = __VLS_41.slots.default;
        var __VLS_44 = UnitBreadcrumbItem_vue_1.default;
        // @ts-ignore
        var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            item: (item),
            key: (item.id),
        }));
        var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{
                item: (item),
                key: (item.id),
            }], __VLS_functionalComponentArgsRest(__VLS_45), false));
        var __VLS_49 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
        lucide_vue_next_1.ChevronDown;
        // @ts-ignore
        var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ class: "h-4 w-4" })));
        var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        // @ts-ignore
        [breadcrumbItems,];
        var __VLS_54 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
        dropdown_menu_1.DropdownMenuContent;
        // @ts-ignore
        var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
            align: "start",
        }));
        var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
                align: "start",
            }], __VLS_functionalComponentArgsRest(__VLS_55), false));
        var __VLS_59 = __VLS_57.slots.default;
        var _loop_2 = function (subItem) {
            var __VLS_60 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
            dropdown_menu_1.DropdownMenuItem;
            // @ts-ignore
            var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ 'onSelect': {} }, { key: (subItem.id) })));
            var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ 'onSelect': {} }, { key: (subItem.id) })], __VLS_functionalComponentArgsRest(__VLS_61), false));
            var __VLS_65 = void 0;
            var __VLS_66 = ({ select: {} },
                { onSelect: function () {
                        var _a, _b;
                        var _c = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _c[_i] = arguments[_i];
                        }
                        var $event = _c[0];
                        if (!(((_b = (_a = item.items) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) >= 1))
                            return;
                        __VLS_ctx.onItemClick(subItem.id);
                        // @ts-ignore
                        [onItemClick,];
                    } });
            var __VLS_67 = __VLS_63.slots.default;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-primary flex items-center" }));
            /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            if (subItem.sidc) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "mr-1.5 flex max-h-7 w-7 items-center" }));
                /** @type {__VLS_StyleScopedClasses['mr-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['max-h-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                var __VLS_68 = UnitSymbol_vue_1.default;
                // @ts-ignore
                var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                    sidc: (subItem.sidc),
                    options: (__assign(__assign({}, subItem.symbolOptions), { outlineWidth: 8 })),
                }));
                var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([{
                        sidc: (subItem.sidc),
                        options: (__assign(__assign({}, subItem.symbolOptions), { outlineWidth: 8 })),
                    }], __VLS_functionalComponentArgsRest(__VLS_69), false));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ([item.id === subItem.id ? 'font-semibold' : '']) }));
            (subItem.name);
            if (subItem.location) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-700" }));
                /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
            }
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        };
        for (var _h = 0, _j = __VLS_vFor((item.items)); _h < _j.length; _h++) {
            var subItem = _j[_h][0];
            _loop_2(subItem);
        }
        // @ts-ignore
        [];
        // @ts-ignore
        [];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (item.name);
    }
    // @ts-ignore
    [];
    if (index < __VLS_ctx.breadcrumbItems.length - 1) {
        var __VLS_73 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.BreadcrumbSeparator} */
        breadcrumb_1.BreadcrumbSeparator;
        // @ts-ignore
        var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({}));
        var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_74), false));
    }
    // @ts-ignore
    [breadcrumbItems,];
};
var __VLS_41, __VLS_63, __VLS_64, __VLS_57, __VLS_35, __VLS_29;
for (var _i = 0, _f = __VLS_vFor((__VLS_ctx.breadcrumbItems)); _i < _f.length; _i++) {
    var _g = _f[_i], item = _g[0], index = _g[1];
    _loop_1(item, index);
}
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_17;
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.ScrollBar} */
scroll_area_1.ScrollBar;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    orientation: "horizontal",
}));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{
        orientation: "horizontal",
    }], __VLS_functionalComponentArgsRest(__VLS_79), false));
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
