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
var DotsMenu_vue_1 = require("@/components/DotsMenu.vue");
var ChevronPanel_vue_1 = require("@/components/ChevronPanel.vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var EditLayerInlineForm_vue_1 = require("@/modules/scenarioeditor/EditLayerInlineForm.vue");
var ScenarioFeatureListItem_vue_1 = require("@/modules/scenarioeditor/ScenarioFeatureListItem.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var constants_1 = require("@/types/constants");
var selectedStore_1 = require("@/stores/selectedStore");
var vue_1 = require("vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
var draggables_1 = require("@/types/draggables");
var core_1 = require("@vueuse/core");
var TreeDropIndicator_vue_1 = require("@/components/TreeDropIndicator.vue");
var combine_1 = require("@atlaskit/pragmatic-drag-and-drop/combine");
var closest_edge_1 = require("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge");
var DropIndicator_vue_1 = require("@/components/DropIndicator.vue");
var button_1 = require("@/components/ui/button");
var props = defineProps();
var emit = defineEmits();
var geo = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).geo;
var _a = (0, selectedStore_1.useSelectedItems)(), selectedFeatureIds = _a.selectedFeatureIds, activeFeatureId = _a.activeFeatureId;
var activeLayerId = defineModel("activeLayerId");
var editedLayerId = defineModel("editedLayerId");
var layerRef = (0, vue_1.ref)(null);
var isDragOver = (0, vue_1.ref)(false);
var isDragging = (0, vue_1.ref)(false);
var elRef = (0, vue_1.ref)(null);
var handleRef = (0, vue_1.ref)(null);
var itemState = (0, vue_1.ref)(draggables_1.idle);
var _b = (0, core_1.useTimeoutFn)(function () {
    props.layer._isOpen = true;
}, 500, { immediate: false }), isPending = _b.isPending, startOpenTimeout = _b.start, stopOpenTimeout = _b.stop;
var layerMenuItems = [
    { label: "Zoom to", action: constants_1.ScenarioLayerActions.Zoom },
    { label: "Set as active", action: constants_1.ScenarioLayerActions.SetActive },
    { label: "Edit", action: constants_1.ScenarioLayerActions.Edit },
    { label: "Move up", action: constants_1.ScenarioLayerActions.MoveUp },
    { label: "Move down", action: constants_1.ScenarioLayerActions.MoveDown },
    { label: "Delete", action: constants_1.ScenarioLayerActions.Delete },
];
function toggleFeatureVisibility(feature) {
    geo.updateFeature(feature.id, { meta: { isHidden: !feature.meta.isHidden } });
}
function toggleFeatureLayerVisibility(layer) {
    geo.updateLayer(layer.id, { isHidden: !layer.isHidden });
}
var dndCleanup = function () { };
(0, vue_1.onMounted)(function () {
    dndCleanup = (0, combine_1.combine)((0, adapter_1.draggable)({
        element: elRef.value,
        dragHandle: handleRef.value,
        getInitialData: function () { return (0, draggables_1.getScenarioFeatureLayerDragItem)({ layer: props.layer }); },
        onDragStart: function () {
            isDragging.value = true;
        },
        onDrop: function () {
            isDragging.value = false;
        },
    }), (0, adapter_1.dropTargetForElements)({
        element: elRef.value,
        canDrop: function (_a) {
            var source = _a.source;
            return ((0, draggables_1.isScenarioFeatureDragItem)(source.data) &&
                source.data.feature._pid !== props.layer.id) ||
                ((0, draggables_1.isScenarioFeatureLayerDragItem)(source.data) &&
                    source.data.layer.id !== props.layer.id);
        },
        onDragEnter: function (_a) {
            var self = _a.self;
            isDragOver.value = true;
            var closestEdge = (0, closest_edge_1.extractClosestEdge)(self.data);
            itemState.value = { type: "drag-over", closestEdge: closestEdge };
        },
        onDrag: function (_a) {
            var self = _a.self;
            if ((0, draggables_1.isScenarioFeatureDragItem)(self.data) &&
                !props.layer._isOpen &&
                !isPending.value) {
                startOpenTimeout();
            }
            if ((0, draggables_1.isScenarioFeatureLayerDragItem)(self.data)) {
                var closestEdge = (0, closest_edge_1.extractClosestEdge)(self.data);
                itemState.value = { type: "drag-over", closestEdge: closestEdge };
            }
        },
        onDragLeave: function () {
            isDragOver.value = false;
            stopOpenTimeout();
            itemState.value = draggables_1.idle;
        },
        getData: function (_a) {
            var input = _a.input, element = _a.element, source = _a.source;
            var data = (0, draggables_1.getScenarioFeatureLayerDragItem)({ layer: props.layer });
            if ((0, draggables_1.isScenarioFeatureLayerDragItem)(source.data)) {
                return (0, closest_edge_1.attachClosestEdge)(data, {
                    input: input,
                    element: element,
                    allowedEdges: ["top", "bottom"],
                });
            }
            return data;
        },
        onDrop: function (_a) {
            var source = _a.source;
            itemState.value = draggables_1.idle;
            isDragOver.value = false;
            stopOpenTimeout();
            if ((0, draggables_1.isScenarioFeatureDragItem)(source.data) && !props.layer._isOpen) {
                props.layer._isOpen = true;
            }
        },
    }));
});
(0, vue_1.onUnmounted)(function () {
    dndCleanup();
});
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ChevronPanel_vue_1.default || ChevronPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    label: (__VLS_ctx.layer.name),
    open: (__VLS_ctx.layer._isOpen),
    headerClass: (['-ml-2', __VLS_ctx.isDragging ? 'opacity-20' : '']),
    headerRef: (__VLS_ctx.elRef),
    dataLayerId: (__VLS_ctx.layer.id),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        label: (__VLS_ctx.layer.name),
        open: (__VLS_ctx.layer._isOpen),
        headerClass: (['-ml-2', __VLS_ctx.isDragging ? 'opacity-20' : '']),
        headerRef: (__VLS_ctx.elRef),
        dataLayerId: (__VLS_ctx.layer.id),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.left;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ref: "handleRef",
    });
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconDrag} */
    vue_mdi_1.IconDrag;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-move']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:opacity-0']} */ ;
    // @ts-ignore
    [layer, layer, layer, isDragging, elRef,];
}
{
    var __VLS_13 = __VLS_3.slots.label;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ onDblclick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.activeLayerId = __VLS_ctx.layer.id;
            // @ts-ignore
            [layer, activeLayerId,];
        } }, { ref: "layerRef" }), { class: ([
            __VLS_ctx.layer.isHidden ? 'opacity-50' : '',
            __VLS_ctx.layer.id === __VLS_ctx.activeLayerId ? 'dark:text-army2 text-red-800' : '',
        ]) }));
    (__VLS_ctx.layer.name);
    if (__VLS_ctx.itemState.type === 'drag-over' && __VLS_ctx.itemState.closestEdge) {
        var __VLS_14 = DropIndicator_vue_1.default;
        // @ts-ignore
        var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ edge: (__VLS_ctx.itemState.closestEdge), gap: "0px" }, { class: "-m-2" })));
        var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ edge: (__VLS_ctx.itemState.closestEdge), gap: "0px" }, { class: "-m-2" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
        /** @type {__VLS_StyleScopedClasses['-m-2']} */ ;
    }
    else if (__VLS_ctx.isDragOver) {
        var __VLS_19 = TreeDropIndicator_vue_1.default;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "-m-2" }, { instruction: ({ type: 'make-child', currentLevel: 0, indentPerLevel: 0 }) })));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "-m-2" }, { instruction: ({ type: 'make-child', currentLevel: 0, indentPerLevel: 0 }) })], __VLS_functionalComponentArgsRest(__VLS_20), false));
        /** @type {__VLS_StyleScopedClasses['-m-2']} */ ;
    }
    // @ts-ignore
    [layer, layer, layer, activeLayerId, itemState, itemState, itemState, isDragOver,];
}
{
    var __VLS_24 = __VLS_3.slots.right;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign(__assign(__assign(__assign({ 'onClick': {} }, { 'onKeydown': {} }), { variant: "ghost", size: "icon", type: "button" }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Set as active layer" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onClick': {} }, { 'onKeydown': {} }), { variant: "ghost", size: "icon", type: "button" }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Set as active layer" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = void 0;
    var __VLS_31 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.activeLayerId = __VLS_ctx.layer.id;
                // @ts-ignore
                [layer, activeLayerId,];
            } });
    var __VLS_32 = ({ keydown: {} },
        { onKeydown: function () { } });
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    var __VLS_33 = __VLS_28.slots.default;
    if (__VLS_ctx.activeLayerId === __VLS_ctx.layer.id) {
        var __VLS_34 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconStar} */
        vue_mdi_1.IconStar;
        // @ts-ignore
        var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign({ class: "size-5" })));
        var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_35), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    else {
        var __VLS_39 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconStarOutline} */
        vue_mdi_1.IconStarOutline;
        // @ts-ignore
        var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ class: "size-5" })));
        var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    // @ts-ignore
    [layer, activeLayerId,];
    var __VLS_28;
    var __VLS_29;
    var __VLS_44 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44(__assign(__assign(__assign(__assign({ 'onClick': {} }, { 'onKeydown': {} }), { type: "button", variant: "ghost", size: "icon" }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Toggle layer visibility" })));
    var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onClick': {} }, { 'onKeydown': {} }), { type: "button", variant: "ghost", size: "icon" }), { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { title: "Toggle layer visibility" })], __VLS_functionalComponentArgsRest(__VLS_45), false));
    var __VLS_49 = void 0;
    var __VLS_50 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.toggleFeatureLayerVisibility(__VLS_ctx.layer);
                // @ts-ignore
                [layer, toggleFeatureLayerVisibility,];
            } });
    var __VLS_51 = ({ keydown: {} },
        { onKeydown: function () { } });
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    var __VLS_52 = __VLS_47.slots.default;
    if (__VLS_ctx.layer.isHidden) {
        var __VLS_53 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEyeOff} */
        vue_mdi_1.IconEyeOff;
        // @ts-ignore
        var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ class: "size-5" })));
        var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    else {
        var __VLS_58 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconEye} */
        vue_mdi_1.IconEye;
        // @ts-ignore
        var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ class: "size-5" })));
        var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_59), false));
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    // @ts-ignore
    [layer,];
    var __VLS_47;
    var __VLS_48;
    if (__VLS_ctx.layer.visibleFromT || __VLS_ctx.layer.visibleUntilT) {
        var __VLS_63 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.IconClockOutline} */
        vue_mdi_1.IconClockOutline;
        // @ts-ignore
        var __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63(__assign({ class: "text-muted-foreground size-5" })));
        var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-5" })], __VLS_functionalComponentArgsRest(__VLS_64), false));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    }
    var __VLS_68 = DotsMenu_vue_1.default;
    // @ts-ignore
    var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign(__assign({ 'onAction': {} }, { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.layerMenuItems) })));
    var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign(__assign({ 'onAction': {} }, { class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }), { items: (__VLS_ctx.layerMenuItems) })], __VLS_functionalComponentArgsRest(__VLS_69), false));
    var __VLS_73 = void 0;
    var __VLS_74 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('layer-action', __VLS_ctx.layer, $event);
                // @ts-ignore
                [layer, layer, layer, layerMenuItems, emit,];
            } });
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
    var __VLS_71;
    var __VLS_72;
    // @ts-ignore
    [];
}
if (__VLS_ctx.editedLayerId === __VLS_ctx.layer.id) {
    var __VLS_75 = EditLayerInlineForm_vue_1.default;
    // @ts-ignore
    var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75(__assign(__assign(__assign({ 'onClose': {} }, { 'onUpdate': {} }), { layer: (__VLS_ctx.layer) }), { class: "-mt-6 -ml-5 border" })));
    var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClose': {} }, { 'onUpdate': {} }), { layer: (__VLS_ctx.layer) }), { class: "-mt-6 -ml-5 border" })], __VLS_functionalComponentArgsRest(__VLS_76), false));
    var __VLS_80 = void 0;
    var __VLS_81 = ({ close: {} },
        { onClose: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.editedLayerId === __VLS_ctx.layer.id))
                    return;
                __VLS_ctx.editedLayerId = null;
                // @ts-ignore
                [layer, layer, editedLayerId, editedLayerId,];
            } });
    var __VLS_82 = ({ update: {} },
        { onUpdate: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.editedLayerId === __VLS_ctx.layer.id))
                    return;
                __VLS_ctx.geo.updateLayer(__VLS_ctx.layer.id, $event);
                // @ts-ignore
                [layer, geo,];
            } });
    /** @type {__VLS_StyleScopedClasses['-mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['-ml-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    var __VLS_78;
    var __VLS_79;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "-mt-6 -ml-5" }));
/** @type {__VLS_StyleScopedClasses['-mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['-ml-5']} */ ;
var _loop_1 = function (feature) {
    var __VLS_83 = ScenarioFeatureListItem_vue_1.default;
    // @ts-ignore
    var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83(__assign(__assign(__assign(__assign({ 'onFeatureClick': {} }, { 'onFeatureDoubleClick': {} }), { 'onFeatureAction': {} }), { 'onToggleVisibility': {} }), { key: (feature.id), feature: (feature), layer: (__VLS_ctx.layer), selected: (__VLS_ctx.selectedFeatureIds.has(feature.id)), active: (__VLS_ctx.activeFeatureId === feature.id) })));
    var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onFeatureClick': {} }, { 'onFeatureDoubleClick': {} }), { 'onFeatureAction': {} }), { 'onToggleVisibility': {} }), { key: (feature.id), feature: (feature), layer: (__VLS_ctx.layer), selected: (__VLS_ctx.selectedFeatureIds.has(feature.id)), active: (__VLS_ctx.activeFeatureId === feature.id) })], __VLS_functionalComponentArgsRest(__VLS_84), false));
    var __VLS_88 = void 0;
    var __VLS_89 = ({ featureClick: {} },
        { onFeatureClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('feature-click', feature, __VLS_ctx.layer, $event);
                // @ts-ignore
                [layer, layer, emit, features, selectedFeatureIds, activeFeatureId,];
            } });
    var __VLS_90 = ({ featureDoubleClick: {} },
        { onFeatureDoubleClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('feature-double-click', feature, __VLS_ctx.layer, $event);
                // @ts-ignore
                [layer, emit,];
            } });
    var __VLS_91 = ({ featureAction: {} },
        { onFeatureAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('feature-action', feature.id, $event);
                // @ts-ignore
                [emit,];
            } });
    var __VLS_92 = ({ toggleVisibility: {} },
        { onToggleVisibility: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.toggleFeatureVisibility(feature);
                // @ts-ignore
                [toggleFeatureVisibility,];
            } });
    // @ts-ignore
    [];
};
var __VLS_86, __VLS_87;
for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.features)); _i < _c.length; _i++) {
    var feature = _c[_i][0];
    _loop_1(feature);
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
