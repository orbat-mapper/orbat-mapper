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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var tree_item_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item");
var combine_1 = require("@atlaskit/pragmatic-drag-and-drop/combine");
var solid_1 = require("@heroicons/vue/20/solid");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var dragStore_1 = require("@/stores/dragStore");
var DotsMenu_vue_1 = require("./DotsMenu.vue");
var scenarioActions_1 = require("@/composables/scenarioActions");
var settingsStore_1 = require("@/stores/settingsStore");
var injects_1 = require("./injects");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var utils_1 = require("@/utils");
var selectedStore_1 = require("@/stores/selectedStore");
var core_1 = require("@vueuse/core");
var TreeDropIndicator_vue_1 = require("@/components/TreeDropIndicator.vue");
var draggables_1 = require("@/types/draggables");
var scenarioModels_1 = require("@/types/scenarioModels");
var constants_ts_1 = require("@/config/constants.ts");
var props = defineProps();
var emit = defineEmits();
var activeParentId = (0, utils_1.injectStrict)(injects_1.activeParentKey);
var _f = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), isUnitLocked = _f.unitActions.isUnitLocked, state = _f.store.state;
var combinedOptions = (0, vue_1.computed)(function () { return (__assign(__assign(__assign({}, (props.symbolOptions || {})), (props.item.unit.symbolOptions || {})), { outlineWidth: 8 })); });
var subTree = (0, vue_1.ref)(null);
var itemRef = (0, vue_1.ref)(null);
var dragItemRef = (0, vue_1.ref)(null);
var isDragged = (0, vue_1.ref)(false);
var isDragOver = (0, vue_1.ref)(false);
var unit = (0, vue_1.computed)(function () { return props.item.unit; });
var isOpen = (0, vue_1.computed)({
    get: function () {
        return !!props.item.unit._isOpen;
    },
    set: function (v) {
        props.item.unit._isOpen = v;
    },
});
var isLocked = (0, vue_1.computed)(function () { return isUnitLocked(props.item.unit.id); });
var isSideGroupLocked = (0, vue_1.computed)(function () {
    return isUnitLocked(props.item.unit.id, { excludeUnit: true });
});
var _g = (0, core_1.useTimeoutFn)(function () {
    isOpen.value = true;
}, 500, { immediate: false }), isPending = _g.isPending, startOpenTimeout = _g.start, stopOpenTimeout = _g.stop;
var settingsStore = (0, settingsStore_1.useSettingsStore)();
var _h = (0, selectedStore_1.useSelectedItems)(), selectedUnitIds = _h.selectedUnitIds, activeUnitId = _h.activeUnitId;
var unitLabel = (0, vue_1.computed)(function () {
    return settingsStore.orbatShortName
        ? unit.value.shortName || unit.value.name
        : unit.value.name;
});
var customSidc = (0, vue_1.computed)(function () {
    var _a;
    var sidc = ((_a = unit.value._state) === null || _a === void 0 ? void 0 : _a.sidc) || unit.value.sidc;
    if (sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)) {
        return sidc.slice(constants_ts_1.CUSTOM_SYMBOL_SLICE);
    }
});
var activeUnitStore = (0, dragStore_1.useActiveUnitStore)();
var isActiveUnit = (0, vue_1.computed)(function () { return activeUnitId.value === props.item.unit.id; });
var isActiveParent = (0, vue_1.computed)(function () { return activeParentId.value === props.item.unit.id; });
var hasActiveChildren = (0, vue_1.computed)(function () {
    return activeUnitStore.activeUnitParentIds.value.includes(props.item.unit.id);
});
var menuItems = (0, scenarioActions_1.useUnitMenu)(props.item, isLocked, isSideGroupLocked).unitMenuItems;
var dndCleanup = function () { };
var instruction = (0, vue_1.ref)(null);
(0, vue_1.onMounted)(function () {
    if (!itemRef.value || !dragItemRef.value)
        return;
    dndCleanup = (0, combine_1.combine)((0, adapter_1.draggable)({
        element: dragItemRef.value,
        canDrag: function () { return !isUnitLocked(props.item.unit.id); },
        getInitialData: function () { return (0, draggables_1.getUnitDragItem)({ unit: props.item.unit }); },
        onDragStart: function () { return (isDragged.value = true); },
        onDrop: function () { return (isDragged.value = false); },
    }), (0, adapter_1.dropTargetForElements)({
        element: itemRef.value,
        getData: function (_a) {
            var _b;
            var input = _a.input, element = _a.element;
            var data = (0, draggables_1.getUnitDragItem)({ unit: props.item.unit });
            return (0, tree_item_1.attachInstruction)(data, {
                input: input,
                element: element,
                currentLevel: (_b = props.level) !== null && _b !== void 0 ? _b : 0,
                indentPerLevel: 20,
                block: ["reparent"],
                mode: isParent.value && isOpen.value
                    ? "expanded"
                    : props.lastInGroup
                        ? "last-in-group"
                        : "standard",
            });
        },
        canDrop: function (_a) {
            var source = _a.source;
            return (!isUnitLocked(props.item.unit.id) &&
                (0, draggables_1.isUnitDragItem)(source.data) &&
                source.data.unit.id !== props.item.unit.id &&
                props.item.unit._pid !== source.data.unit.id &&
                !selectedUnitIds.value.has(props.item.unit.id));
        },
        onDragEnter: function () {
            isDragOver.value = true;
        },
        onDrag: function (args) {
            var _a, _b;
            instruction.value = (0, tree_item_1.extractInstruction)(args.self.data);
            if (((_a = instruction.value) === null || _a === void 0 ? void 0 : _a.type) === "make-child" &&
                isParent.value &&
                !isOpen.value &&
                !isPending.value) {
                startOpenTimeout();
            }
            if (((_b = instruction.value) === null || _b === void 0 ? void 0 : _b.type) !== "make-child" && isPending.value) {
                stopOpenTimeout();
            }
        },
        onDragLeave: function () {
            isDragOver.value = false;
            instruction.value = null;
            stopOpenTimeout();
        },
        onDrop: function () {
            isDragOver.value = false;
            instruction.value = null;
            stopOpenTimeout();
        },
    }));
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var isParent = (0, vue_1.computed)(function () {
    return Boolean(props.item.children && props.item.children.length);
});
var onUnitMenuAction = function (unit, action) {
    emit("unit-action", unit, action);
};
var onUnitClick = function (unit, event) {
    emit("unit-click", unit, event);
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ id: ('ou-' + __VLS_ctx.unit.id) }, { class: "text-foreground relative" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign({ onDblclick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.isOpen = !__VLS_ctx.isOpen;
        // @ts-ignore
        [unit, isOpen, isOpen,];
    } }, { onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.onUnitClick(__VLS_ctx.unit, $event);
        // @ts-ignore
        [unit, onUnitClick,];
    } }), { ref: "itemRef" }), { class: "group relative flex items-center justify-between border-l-2 py-1 pl-2 sm:pl-0" }), { class: ([
        __VLS_ctx.selectedUnitIds.has(__VLS_ctx.unit.id) && __VLS_ctx.selectedUnitIds.size > 1
            ? 'bg-primary/10 hover:bg-sidebar-accent/60'
            : '',
        __VLS_ctx.isActiveUnit ? 'border-primary bg-primary/10' : 'border-transparent',
    ]) }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:pl-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-6 w-6" }));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
if (__VLS_ctx.isParent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.isParent))
                return;
            __VLS_ctx.isOpen = !__VLS_ctx.isOpen;
            // @ts-ignore
            [unit, isOpen, isOpen, selectedUnitIds, selectedUnitIds, isActiveUnit, isParent,];
        } }, { class: "" }));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
    solid_1.ChevronRightIcon;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
            'rotate-90': __VLS_ctx.isOpen,
            'text-primary': __VLS_ctx.hasActiveChildren,
        }) })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
                'rotate-90': __VLS_ctx.isOpen,
                'text-primary': __VLS_ctx.hasActiveChildren,
            }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "flex items-center space-x-1 text-sm" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex items-center space-x-1" }, { class: ({ 'opacity-20': __VLS_ctx.isDragged }) }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ class: "relative flex cursor-move justify-center" }, { style: ({ width: __VLS_ctx.settingsStore.orbatIconSize + 'pt' }) }), { ref: "dragItemRef" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
if (__VLS_ctx.customSidc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign(__assign({ src: ((_b = (_a = __VLS_ctx.state.customSymbolMap[__VLS_ctx.customSidc]) === null || _a === void 0 ? void 0 : _a.src) !== null && _b !== void 0 ? _b : ''), alt: (__VLS_ctx.unitLabel) }, { style: ({ width: __VLS_ctx.settingsStore.orbatIconSize * 1.2 + 'px' }) }), { draggable: "false" }));
}
else {
    var __VLS_5 = NewMilitarySymbol_vue_1.default;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        sidc: (((_c = __VLS_ctx.unit._state) === null || _c === void 0 ? void 0 : _c.sidc) || __VLS_ctx.unit.sidc),
        size: (__VLS_ctx.settingsStore.orbatIconSize),
        options: (__VLS_ctx.combinedOptions),
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            sidc: (((_d = __VLS_ctx.unit._state) === null || _d === void 0 ? void 0 : _d.sidc) || __VLS_ctx.unit.sidc),
            size: (__VLS_ctx.settingsStore.orbatIconSize),
            options: (__VLS_ctx.combinedOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    if (__VLS_ctx.unit.reinforcedStatus) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "absolute -top-2 -right-2.5 text-xs font-medium" }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-right-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.mapReinforcedStatus2Field(__VLS_ctx.unit.reinforcedStatus, { compact: true }));
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "flex-auto pl-1 text-left" }, { class: ({
        'font-medium': __VLS_ctx.isActiveUnit,
    }) }));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.unitLabel);
if ((_e = __VLS_ctx.unit._state) === null || _e === void 0 ? void 0 : _e.location) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-destructive-foreground" }));
    /** @type {__VLS_StyleScopedClasses['text-destructive-foreground']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
if (__VLS_ctx.unit.locked) {
    var __VLS_10 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
    vue_mdi_1.IconLockOutline;
    // @ts-ignore
    var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ class: "text-muted-foreground h-5 w-5" })));
    var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_11), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
var __VLS_15 = DotsMenu_vue_1.default;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15(__assign(__assign({ 'onAction': {} }, { class: "shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.menuItems) })));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { class: "shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.menuItems) })], __VLS_functionalComponentArgsRest(__VLS_16), false));
var __VLS_20;
var __VLS_21 = ({ action: {} },
    { onAction: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onUnitMenuAction(__VLS_ctx.unit, $event);
            // @ts-ignore
            [unit, unit, unit, unit, unit, unit, unit, isOpen, isActiveUnit, hasActiveChildren, isDragged, settingsStore, settingsStore, settingsStore, customSidc, customSidc, state, unitLabel, unitLabel, combinedOptions, scenarioModels_1.mapReinforcedStatus2Field, menuItems, onUnitMenuAction,];
        } });
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
var __VLS_18;
var __VLS_19;
if (__VLS_ctx.instruction) {
    var __VLS_22 = TreeDropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        instruction: (__VLS_ctx.instruction),
    }));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([{
            instruction: (__VLS_ctx.instruction),
        }], __VLS_functionalComponentArgsRest(__VLS_23), false));
}
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "ml-6 pb-1" }, { ref: "subTree" }));
    /** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    for (var _i = 0, _j = __VLS_vFor((__VLS_ctx.item.children)); _i < _j.length; _i++) {
        var _k = _j[_i], subUnit = _k[0], index = _k[1];
        var __VLS_27 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.OrbatTreeItem} */
        OrbatTreeItem;
        // @ts-ignore
        var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { item: (subUnit), level: (props.level ? props.level + 1 : 1), key: (subUnit.unit.id), symbolOptions: (__VLS_ctx.symbolOptions), lastInGroup: (index === __VLS_ctx.item.children.length - 1) })));
        var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { item: (subUnit), level: (props.level ? props.level + 1 : 1), key: (subUnit.unit.id), symbolOptions: (__VLS_ctx.symbolOptions), lastInGroup: (index === __VLS_ctx.item.children.length - 1) })], __VLS_functionalComponentArgsRest(__VLS_28), false));
        var __VLS_32 = void 0;
        var __VLS_33 = ({ unitAction: {} },
            { onUnitAction: (__VLS_ctx.onUnitMenuAction) });
        var __VLS_34 = ({ unitClick: {} },
            { onUnitClick: (__VLS_ctx.onUnitClick) });
        var __VLS_30;
        var __VLS_31;
        // @ts-ignore
        [isOpen, onUnitClick, onUnitMenuAction, instruction, instruction, item, item, symbolOptions,];
    }
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
