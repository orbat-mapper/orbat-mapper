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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var reka_ui_1 = require("reka-ui");
var solid_1 = require("@heroicons/vue/24/solid");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var constants_1 = require("@/types/constants");
var core_1 = require("@vueuse/core");
var FilterQueryInput_vue_1 = require("./FilterQueryInput.vue");
var EditSideForm_vue_1 = require("./EditSideForm.vue");
var OrbatSideGroup_vue_1 = require("./OrbatSideGroup.vue");
var injects_1 = require("@/components/injects");
var utils_1 = require("@/utils");
var tree_item_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item");
var combine_1 = require("@atlaskit/pragmatic-drag-and-drop/combine");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var TreeDropIndicator_vue_1 = require("@/components/TreeDropIndicator.vue");
var SideDropdownMenu_vue_1 = require("@/modules/scenarioeditor/SideDropdownMenu.vue");
var OrbatTree_vue_1 = require("@/components/OrbatTree.vue");
var props = withDefaults(defineProps(), { hideFilter: false });
var emit = defineEmits();
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _a.store, unitActions = _a.unitActions;
var isOpen = (0, vue_1.ref)(true);
var dropRef = (0, vue_1.ref)(null);
var dragRef = (0, vue_1.ref)(null);
var isDragging = (0, vue_1.ref)(false);
var instruction = (0, vue_1.ref)(null);
var isDragOver = (0, vue_1.ref)(false);
var _b = (0, core_1.useTimeoutFn)(function () {
    isOpen.value = true;
}, 500, { immediate: false }), isPending = _b.isPending, startOpenTimeout = _b.start, stopOpenTimeout = _b.stop;
var hasLocationFilter = (0, vue_1.ref)(false);
var filterQuery = (0, vue_1.ref)("");
var showFilter = (0, vue_1.ref)(false);
var debouncedFilterQuery = (0, core_1.useDebounce)(filterQuery, 100);
var isLocked = (0, vue_1.computed)(function () { return !!props.side.locked; });
var isHidden = (0, vue_1.computed)(function () { return props.side.isHidden; });
var sideGroups = (0, vue_1.computed)(function () {
    return props.side.groups.map(function (id) { return store.state.sideGroupMap[id]; });
});
var showEditSideForm = (0, vue_1.ref)(false);
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    if (!dropRef.value) {
        return;
    }
    dndCleanup = (0, combine_1.combine)((0, adapter_1.draggable)({
        element: dropRef.value,
        dragHandle: dragRef.value,
        getInitialData: function () { return (0, draggables_1.getSideDragItem)({ side: props.side }); },
        onDragStart: function () {
            isDragging.value = true;
        },
        onDrop: function () {
            isDragging.value = false;
        },
    }), (0, adapter_1.dropTargetForElements)({
        element: dropRef.value,
        getData: function (_a) {
            var input = _a.input, element = _a.element, source = _a.source;
            var data = (0, draggables_1.getSideDragItem)({ side: props.side });
            return (0, tree_item_1.attachInstruction)(data, {
                input: input,
                element: element,
                currentLevel: 0,
                indentPerLevel: 0,
                block: (0, draggables_1.isSideDragItem)(source.data)
                    ? ["make-child", "reparent"]
                    : ["reparent", "instruction-blocked", "reorder-above", "reorder-below"],
                mode: "standard",
            });
        },
        canDrop: function (_a) {
            var source = _a.source;
            return ((0, draggables_1.isUnitDragItem)(source.data) ||
                ((0, draggables_1.isSideGroupDragItem)(source.data) &&
                    source.data.sideGroup._pid !== props.side.id) ||
                ((0, draggables_1.isSideDragItem)(source.data) && source.data.side.id !== props.side.id));
        },
        onDragEnter: function (_a) {
            var self = _a.self;
            isDragOver.value = true;
        },
        onDrag: function (args) {
            if (((0, draggables_1.isUnitDragItem)(args.source.data) || (0, draggables_1.isSideGroupDragItem)(args.source.data)) &&
                !isOpen.value &&
                !isPending.value) {
                startOpenTimeout();
            }
            instruction.value = (0, tree_item_1.extractInstruction)(args.self.data);
        },
        onDragLeave: function () {
            isDragOver.value = false;
            instruction.value = null;
            stopOpenTimeout();
        },
        onDrop: function (args) {
            isDragOver.value = false;
            instruction.value = null;
            stopOpenTimeout();
            if ((0, draggables_1.isSideGroupDragItem)(args.source.data) && !isOpen.value) {
                isOpen.value = true;
            }
        },
    }));
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
if (props.side._isNew)
    showEditSideForm.value = true;
var onSideAction = function (action) {
    if (action === constants_1.SideActions.Expand) {
    }
    else if (action === constants_1.SideActions.AddSubordinate) {
        unitActions.createSubordinateUnit(props.side.id);
    }
    else if (action === constants_1.SideActions.AddGroup) {
        unitActions.addSideGroup(props.side.id);
    }
    else if (action === constants_1.SideActions.Edit) {
        showEditSideForm.value = true;
    }
    else {
        emit("side-action", props.side, action);
    }
};
function onSideGroupAction(sideGroup, action) {
    if (action === constants_1.SideActions.Delete) {
        unitActions.deleteSideGroup(sideGroup.id);
    }
    else if (action === constants_1.SideActions.MoveDown) {
        unitActions.reorderSideGroup(sideGroup.id, "down");
    }
    else if (action === constants_1.SideActions.MoveUp) {
        unitActions.reorderSideGroup(sideGroup.id, "up");
    }
    else if (action === constants_1.SideActions.Lock) {
        unitActions.updateSideGroup(sideGroup.id, { locked: true }, { noUndo: true });
    }
    else if (action === constants_1.SideActions.Unlock) {
        unitActions.updateSideGroup(sideGroup.id, { locked: false }, { noUndo: true });
    }
    else if (action === constants_1.SideActions.Clone) {
        unitActions.cloneSideGroup(sideGroup.id);
    }
    else if (action === constants_1.SideActions.CloneWithState) {
        unitActions.cloneSideGroup(sideGroup.id, { includeState: true });
    }
    else if (action === constants_1.SideActions.Hide) {
        unitActions.updateSideGroup(sideGroup.id, { isHidden: true });
    }
    else if (action === constants_1.SideActions.Show) {
        unitActions.updateSideGroup(sideGroup.id, { isHidden: false });
    }
}
var onUnitAction = function (unit, action) {
    emit("unit-action", unit, action);
};
var toggleOpen = function () {
    isOpen.value = !isOpen.value;
};
var __VLS_defaults = { hideFilter: false };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pl-4" }));
/** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ ref: "dropRef", id: ("os-".concat(__VLS_ctx.side.id)) }, { class: "group border-border bg-muted relative -ml-4 flex items-center justify-between border-t-2 border-b-2 py-0 pl-4" }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['-ml-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.IconDrag} */
vue_mdi_1.IconDrag;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground size-6 flex-none cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0" }, { ref: "dragRef" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-6 flex-none cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0" }, { ref: "dragRef" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:-ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:opacity-0']} */ ;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.toggleOpen) }, { class: "flex w-full items-center justify-between text-left" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.side.name);
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.ChevronUpIcon} */
solid_1.ChevronUpIcon;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: (__VLS_ctx.isOpen ? 'rotate-180 transform' : '') }, { class: "text-muted-foreground group-hover:text-foreground size-5" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.isOpen ? 'rotate-180 transform' : '') }, { class: "text-muted-foreground group-hover:text-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.onSideAction(__VLS_ctx.isHidden ? __VLS_ctx.SideActions.Show : __VLS_ctx.SideActions.Hide);
        // @ts-ignore
        [side, side, toggleOpen, isOpen, onSideAction, isHidden, constants_1.SideActions, constants_1.SideActions,];
    } }, { type: "button" }), { class: "text-muted-foreground hover:text-foreground ml-1 flex-none" }), { title: "Toggle visibility" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
if (__VLS_ctx.isHidden) {
    var __VLS_12 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
    vue_mdi_1.IconEyeOff;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "h-5 w-5" })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
else {
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconEye} */
    vue_mdi_1.IconEye;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "h-5 w-5" })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
if (!__VLS_ctx.hideFilter) {
    var __VLS_22 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Toggle | typeof __VLS_components.Toggle} */
    reka_ui_1.Toggle;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ modelValue: (__VLS_ctx.showFilter), title: "Toggle ORBAT filter" }, { class: "text-muted-foreground hover:text-foreground ml-1" })));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.showFilter), title: "Toggle ORBAT filter" }, { class: "text-muted-foreground hover:text-foreground ml-1" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    {
        var __VLS_27 = __VLS_25.slots.default;
        var pressed = __VLS_vSlot(__VLS_27)[0].pressed;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
        /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
        if (pressed) {
            var __VLS_28 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.IconFilterVariantPlus} */
            vue_mdi_1.IconFilterVariantPlus;
            // @ts-ignore
            var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
            var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_29), false));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
        else {
            var __VLS_33 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.IconFilterVariant} */
            vue_mdi_1.IconFilterVariant;
            // @ts-ignore
            var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })));
            var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        }
        // @ts-ignore
        [isHidden, hideFilter, showFilter,];
        __VLS_25.slots['' /* empty slot name completion */];
    }
    var __VLS_25;
}
if (__VLS_ctx.isLocked) {
    var __VLS_38 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
    vue_mdi_1.IconLockOutline;
    // @ts-ignore
    var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ class: "text-muted-foreground size-6" })));
    var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-6" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
}
var __VLS_43 = SideDropdownMenu_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ 'onAction': {} }, { isLocked: (__VLS_ctx.isLocked), isHidden: (__VLS_ctx.isHidden) })));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { isLocked: (__VLS_ctx.isLocked), isHidden: (__VLS_ctx.isHidden) })], __VLS_functionalComponentArgsRest(__VLS_44), false));
var __VLS_48;
var __VLS_49 = ({ action: {} },
    { onAction: (__VLS_ctx.onSideAction) });
var __VLS_46;
var __VLS_47;
if (__VLS_ctx.instruction) {
    var __VLS_50 = TreeDropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ instruction: (__VLS_ctx.instruction) }, { class: "z-10" })));
    var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ instruction: (__VLS_ctx.instruction) }, { class: "z-10" })], __VLS_functionalComponentArgsRest(__VLS_51), false));
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
}
if (__VLS_ctx.showEditSideForm) {
    var __VLS_55 = EditSideForm_vue_1.default;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55(__assign(__assign({ 'onClose': {} }, { sideId: (__VLS_ctx.side.id) }), { class: "-ml-6" })));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign(__assign({ 'onClose': {} }, { sideId: (__VLS_ctx.side.id) }), { class: "-ml-6" })], __VLS_functionalComponentArgsRest(__VLS_56), false));
    var __VLS_60 = void 0;
    var __VLS_61 = ({ close: {} },
        { onClose: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showEditSideForm))
                    return;
                __VLS_ctx.showEditSideForm = false;
                // @ts-ignore
                [side, onSideAction, isHidden, isLocked, isLocked, instruction, instruction, showEditSideForm, showEditSideForm,];
            } });
    /** @type {__VLS_StyleScopedClasses['-ml-6']} */ ;
    var __VLS_58;
    var __VLS_59;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.isOpen) }), null, null);
if (__VLS_ctx.showFilter) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 mr-10" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-10']} */ ;
    var __VLS_62 = FilterQueryInput_vue_1.default;
    // @ts-ignore
    var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        modelValue: (__VLS_ctx.filterQuery),
        locationFilter: (__VLS_ctx.hasLocationFilter),
    }));
    var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.filterQuery),
            locationFilter: (__VLS_ctx.hasLocationFilter),
        }], __VLS_functionalComponentArgsRest(__VLS_63), false));
}
if (__VLS_ctx.side.subUnits.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-2" }));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    var __VLS_67 = OrbatTree_vue_1.default;
    // @ts-ignore
    var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67(__assign(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { units: (__VLS_ctx.side.subUnits), unitMap: (__VLS_ctx.store.state.unitMap) }), { class: ({ 'opacity-50': __VLS_ctx.isHidden }) }), { filterQuery: (__VLS_ctx.filterQuery), locationFilter: (__VLS_ctx.hasLocationFilter), symbolOptions: (__assign({}, __VLS_ctx.side.symbolOptions)) })));
    var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { units: (__VLS_ctx.side.subUnits), unitMap: (__VLS_ctx.store.state.unitMap) }), { class: ({ 'opacity-50': __VLS_ctx.isHidden }) }), { filterQuery: (__VLS_ctx.filterQuery), locationFilter: (__VLS_ctx.hasLocationFilter), symbolOptions: (__assign({}, __VLS_ctx.side.symbolOptions)) })], __VLS_functionalComponentArgsRest(__VLS_68), false));
    var __VLS_72 = void 0;
    var __VLS_73 = ({ unitAction: {} },
        { onUnitAction: (__VLS_ctx.onUnitAction) });
    var __VLS_74 = ({ unitClick: {} },
        { onUnitClick: (function (unit, event) { return __VLS_ctx.emit('unit-click', unit, event); }) });
    /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
    var __VLS_70;
    var __VLS_71;
}
for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.sideGroups)); _i < _c.length; _i++) {
    var group = _c[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (group.id),
    });
    var __VLS_75 = OrbatSideGroup_vue_1.default || OrbatSideGroup_vue_1.default;
    // @ts-ignore
    var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { 'onSidegroupAction': {} }), { group: (group), filterQuery: (__VLS_ctx.debouncedFilterQuery), hasLocationFilter: (__VLS_ctx.hasLocationFilter) })));
    var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { 'onSidegroupAction': {} }), { group: (group), filterQuery: (__VLS_ctx.debouncedFilterQuery), hasLocationFilter: (__VLS_ctx.hasLocationFilter) })], __VLS_functionalComponentArgsRest(__VLS_76), false));
    var __VLS_80 = void 0;
    var __VLS_81 = ({ unitAction: {} },
        { onUnitAction: (__VLS_ctx.onUnitAction) });
    var __VLS_82 = ({ unitClick: {} },
        { onUnitClick: (function (unit, event) { return __VLS_ctx.emit('unit-click', unit, event); }) });
    var __VLS_83 = ({ sidegroupAction: {} },
        { onSidegroupAction: (__VLS_ctx.onSideGroupAction) });
    var __VLS_78;
    var __VLS_79;
    // @ts-ignore
    [side, side, side, isOpen, isHidden, showFilter, filterQuery, filterQuery, hasLocationFilter, hasLocationFilter, hasLocationFilter, store, onUnitAction, onUnitAction, emit, emit, sideGroups, debouncedFilterQuery, onSideGroupAction,];
}
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
