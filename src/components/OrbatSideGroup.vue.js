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
var OrbatTree_vue_1 = require("./OrbatTree.vue");
var solid_1 = require("@heroicons/vue/24/solid");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var constants_1 = require("@/types/constants");
var SecondaryButton_vue_1 = require("./SecondaryButton.vue");
var EditSideGroupForm_vue_1 = require("./EditSideGroupForm.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var draggables_1 = require("@/types/draggables");
var tree_item_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item");
var TreeDropIndicator_vue_1 = require("@/components/TreeDropIndicator.vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var core_1 = require("@vueuse/core");
var combine_1 = require("@atlaskit/pragmatic-drag-and-drop/combine");
var SideGroupDropdownMenu_vue_1 = require("@/modules/scenarioeditor/SideGroupDropdownMenu.vue");
var props = defineProps();
var emit = defineEmits();
var dropRef = (0, vue_1.ref)(null);
var dragRef = (0, vue_1.ref)(null);
var isDragging = (0, vue_1.ref)(false);
var instruction = (0, vue_1.ref)(null);
var state = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store.state;
var isDragOver = (0, vue_1.ref)(false);
var isOpen = (0, vue_1.ref)(true);
var _a = (0, core_1.useTimeoutFn)(function () {
    isOpen.value = true;
}, 500, { immediate: false }), isPending = _a.isPending, startOpenTimeout = _a.start, stopOpenTimeout = _a.stop;
var isLocked = (0, vue_1.computed)(function () { return !!(props.group.locked || state.sideMap[props.group._pid].locked); });
var isHidden = (0, vue_1.computed)(function () { return !!props.group.isHidden || !!state.sideMap[props.group._pid].isHidden; });
var isSideGroupHidden = (0, vue_1.computed)(function () { return !!props.group.isHidden; });
var isSideHidden = (0, vue_1.computed)(function () { return !!state.sideMap[props.group._pid].isHidden; });
var isSideGroupLocked = (0, vue_1.computed)(function () { return !!props.group.locked; });
var isSideLocked = (0, vue_1.computed)(function () { return !!state.sideMap[props.group._pid].locked; });
var combinedSymbolOptions = (0, vue_1.computed)(function () {
    return __assign(__assign({}, (state.sideMap[props.group._pid].symbolOptions || {})), (props.group.symbolOptions || {}));
});
var showEditForm = (0, vue_1.ref)(false);
if (props.group._isNew) {
    showEditForm.value = true;
}
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    if (!dropRef.value) {
        return;
    }
    dndCleanup = (0, combine_1.combine)((0, adapter_1.draggable)({
        element: dropRef.value,
        dragHandle: dragRef.value,
        getInitialData: function () { return (0, draggables_1.getSideGroupDragItem)({ sideGroup: props.group }); },
        canDrag: function () { return !isLocked.value; },
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
            var data = (0, draggables_1.getSideGroupDragItem)({ sideGroup: props.group });
            return (0, tree_item_1.attachInstruction)(data, {
                input: input,
                element: element,
                currentLevel: 0,
                indentPerLevel: 0,
                block: (0, draggables_1.isSideGroupDragItem)(source.data)
                    ? ["make-child", "reparent"]
                    : ["reparent", "instruction-blocked", "reorder-above", "reorder-below"],
                mode: "standard",
            });
        },
        canDrop: function (_a) {
            var source = _a.source;
            return (!isLocked.value &&
                ((0, draggables_1.isUnitDragItem)(source.data) ||
                    ((0, draggables_1.isSideGroupDragItem)(source.data) &&
                        source.data.sideGroup.id !== props.group.id)));
        },
        onDragEnter: function (_a) {
            var self = _a.self;
            isDragOver.value = true;
        },
        onDrag: function (args) {
            if ((0, draggables_1.isUnitDragItem)(args.source.data) && !isOpen.value && !isPending.value) {
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
            if ((0, draggables_1.isUnitDragItem)(args.source.data) && !isOpen.value) {
                isOpen.value = true;
            }
        },
    }));
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var toggleOpen = function () {
    isOpen.value = !isOpen.value;
};
var onSideGroupAction = function (group, action) {
    if (action === constants_1.SideActions.Expand) {
    }
    else if (action === constants_1.SideActions.AddSubordinate) {
        emit("unit-action", group, constants_1.UnitActions.AddSubordinate);
    }
    else if (action === constants_1.SideActions.Edit) {
        showEditForm.value = true;
    }
    else {
        emit("sidegroup-action", group, action);
    }
};
var addGroupUnit = function (group) {
    onSideGroupAction(group, constants_1.SideActions.AddSubordinate);
};
var onUnitAction = function (unit, action) {
    emit("unit-action", unit, action);
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign(__assign({ class: "group relative mt-1 flex items-center justify-between py-0" }, { class: (__VLS_ctx.isDragging ? 'opacity-20' : '') }), { ref: "dropRef", id: ("osg-".concat(__VLS_ctx.group.id)) }));
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.IconDrag} */
vue_mdi_1.IconDrag;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0" }, { ref: "dragRef" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0" }, { ref: "dragRef" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
/** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:-ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:opacity-0']} */ ;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-auto items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.toggleOpen) }, { class: "flex w-full items-center justify-between text-left" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-heading hover:text-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
(__VLS_ctx.group.name || "Units");
var __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.ChevronUpIcon} */
solid_1.ChevronUpIcon;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7(__assign({ class: (__VLS_ctx.isOpen ? 'rotate-180 transform' : '') }, { class: "text-muted-foreground group-hover:text-foreground size-5" })));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.isOpen ? 'rotate-180 transform' : '') }, { class: "text-muted-foreground group-hover:text-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_8), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
if (__VLS_ctx.isLocked) {
    var __VLS_12 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
    vue_mdi_1.IconLockOutline;
    // @ts-ignore
    var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "text-muted-foreground size-5" }, { class: (__VLS_ctx.isSideLocked ? 'opacity-40' : '') })));
    var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-5" }, { class: (__VLS_ctx.isSideLocked ? 'opacity-40' : '') })], __VLS_functionalComponentArgsRest(__VLS_13), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
}
if (__VLS_ctx.isHidden) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.isHidden))
                return;
            __VLS_ctx.onSideGroupAction(__VLS_ctx.group, __VLS_ctx.isHidden ? __VLS_ctx.SideActions.Show : __VLS_ctx.SideActions.Hide);
            // @ts-ignore
            [isDragging, group, group, group, toggleOpen, isOpen, isLocked, isSideLocked, isHidden, isHidden, onSideGroupAction, constants_1.SideActions, constants_1.SideActions,];
        } }, { type: "button" }), { class: "text-muted-foreground hover:text-foreground ml-1" }), { class: (__VLS_ctx.isSideHidden ? 'opacity-40' : '') }), { title: "Toggle visibility", disabled: (__VLS_ctx.isSideHidden) }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    if (__VLS_ctx.isHidden) {
        var __VLS_17 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
        vue_mdi_1.IconEyeOff;
        // @ts-ignore
        var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "h-5 w-5" })));
        var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    else {
        var __VLS_22 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEye} */
        vue_mdi_1.IconEye;
        // @ts-ignore
        var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ class: "h-5 w-5" })));
        var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
}
var __VLS_27 = SideGroupDropdownMenu_vue_1.default;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27(__assign({ 'onAction': {} }, { isLocked: (__VLS_ctx.isLocked), isSideGroupLocked: (__VLS_ctx.isSideGroupLocked), isSideLocked: (__VLS_ctx.isSideLocked), isSideHidden: (__VLS_ctx.isSideHidden), isSideGroupHidden: (__VLS_ctx.isSideGroupHidden) })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { isLocked: (__VLS_ctx.isLocked), isSideGroupLocked: (__VLS_ctx.isSideGroupLocked), isSideLocked: (__VLS_ctx.isSideLocked), isSideHidden: (__VLS_ctx.isSideHidden), isSideGroupHidden: (__VLS_ctx.isSideGroupHidden) })], __VLS_functionalComponentArgsRest(__VLS_28), false));
var __VLS_32;
var __VLS_33 = ({ action: {} },
    { onAction: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onSideGroupAction(__VLS_ctx.group, $event);
            // @ts-ignore
            [group, isLocked, isSideLocked, isHidden, onSideGroupAction, isSideHidden, isSideHidden, isSideHidden, isSideGroupLocked, isSideGroupHidden,];
        } });
var __VLS_30;
var __VLS_31;
if (__VLS_ctx.instruction) {
    var __VLS_34 = TreeDropIndicator_vue_1.default;
    // @ts-ignore
    var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign({ instruction: (__VLS_ctx.instruction) }, { class: "z-10 -my-2 -ml-2" })));
    var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign({ instruction: (__VLS_ctx.instruction) }, { class: "z-10 -my-2 -ml-2" })], __VLS_functionalComponentArgsRest(__VLS_35), false));
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-ml-2']} */ ;
}
if (__VLS_ctx.showEditForm) {
    var __VLS_39 = EditSideGroupForm_vue_1.default;
    // @ts-ignore
    var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign(__assign({ 'onClose': {} }, { sideGroupId: (__VLS_ctx.group.id) }), { class: "-ml-6" })));
    var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign(__assign({ 'onClose': {} }, { sideGroupId: (__VLS_ctx.group.id) }), { class: "-ml-6" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
    var __VLS_44 = void 0;
    var __VLS_45 = ({ close: {} },
        { onClose: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.showEditForm))
                    return;
                __VLS_ctx.showEditForm = false;
                // @ts-ignore
                [group, instruction, instruction, showEditForm, showEditForm,];
            } });
    /** @type {__VLS_StyleScopedClasses['-ml-6']} */ ;
    var __VLS_42;
    var __VLS_43;
}
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
    var __VLS_46 = OrbatTree_vue_1.default;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign(__assign(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { units: (__VLS_ctx.group.subUnits), unitMap: (__VLS_ctx.state.unitMap) }), { class: "mt-0" }), { class: ({ 'opacity-50': __VLS_ctx.isHidden }) }), { filterQuery: (__VLS_ctx.filterQuery), locationFilter: (__VLS_ctx.hasLocationFilter), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onUnitAction': {} }, { 'onUnitClick': {} }), { units: (__VLS_ctx.group.subUnits), unitMap: (__VLS_ctx.state.unitMap) }), { class: "mt-0" }), { class: ({ 'opacity-50': __VLS_ctx.isHidden }) }), { filterQuery: (__VLS_ctx.filterQuery), locationFilter: (__VLS_ctx.hasLocationFilter), symbolOptions: (__VLS_ctx.combinedSymbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_47), false));
    var __VLS_51 = void 0;
    var __VLS_52 = ({ unitAction: {} },
        { onUnitAction: (__VLS_ctx.onUnitAction) });
    var __VLS_53 = ({ unitClick: {} },
        { onUnitClick: (function (unit, event) { return __VLS_ctx.emit('unit-click', unit, event); }) });
    /** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
    var __VLS_49;
    var __VLS_50;
    if (!__VLS_ctx.group.subUnits.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "border-border mr-4 flex justify-center border-2 border-dashed p-8" }));
        /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
        var __VLS_54 = SecondaryButton_vue_1.default || SecondaryButton_vue_1.default;
        // @ts-ignore
        var __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54(__assign({ 'onClick': {} })));
        var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_55), false));
        var __VLS_59 = void 0;
        var __VLS_60 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.isOpen))
                        return;
                    if (!(!__VLS_ctx.group.subUnits.length))
                        return;
                    __VLS_ctx.addGroupUnit(__VLS_ctx.group);
                    // @ts-ignore
                    [group, group, group, isOpen, isHidden, state, filterQuery, hasLocationFilter, combinedSymbolOptions, onUnitAction, emit, addGroupUnit,];
                } });
        var __VLS_61 = __VLS_57.slots.default;
        // @ts-ignore
        [];
        var __VLS_57;
        var __VLS_58;
    }
}
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
