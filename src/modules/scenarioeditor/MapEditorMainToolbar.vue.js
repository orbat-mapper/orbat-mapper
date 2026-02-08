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
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var MainToolbarButton_vue_1 = require("@/components/MainToolbarButton.vue");
var mainToolbarStore_1 = require("@/stores/mainToolbarStore");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var pinia_1 = require("pinia");
var geoStore_1 = require("@/stores/geoStore");
var core_1 = require("@vueuse/core");
var PanelSymbolButton_vue_1 = require("@/components/PanelSymbolButton.vue");
var FloatingPanel_vue_1 = require("@/components/FloatingPanel.vue");
var vue_1 = require("vue");
var sidc_1 = require("@/symbology/sidc");
var geoMapLocation_1 = require("@/composables/geoMapLocation");
var mapSelectStore_1 = require("@/stores/mapSelectStore");
var mainToolbarData_1 = require("@/composables/mainToolbarData");
var dragStore_1 = require("@/stores/dragStore");
var eventKeys_1 = require("@/components/eventKeys");
var solid_1 = require("@heroicons/vue/24/solid");
var SymbolPickerPopover_vue_1 = require("@/modules/scenarioeditor/SymbolPickerPopover.vue");
var EchelonPickerPopover_vue_1 = require("@/modules/scenarioeditor/EchelonPickerPopover.vue");
var button_1 = require("@/components/ui/button");
var constants_ts_1 = require("@/config/constants.ts");
var emit = defineEmits([
    "open-time-modal",
    "inc-day",
    "dec-day",
    "next-event",
    "prev-event",
    "show-settings",
]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), _b = _a.store, undo = _b.undo, redo = _b.redo, canRedo = _b.canRedo, canUndo = _b.canUndo, groupUpdate = _b.groupUpdate, state = _b.state, unitActions = _a.unitActions, addUnitPosition = _a.geo.addUnitPosition, getSideById = _a.helpers.getSideById;
var mapRef = (0, utils_1.injectStrict)(injects_1.activeMapKey);
var store = (0, mainToolbarStore_1.useMainToolbarStore)();
var addMultiple = (0, pinia_1.storeToRefs)(store).addMultiple;
var moveUnitEnabled = (0, pinia_1.storeToRefs)((0, geoStore_1.useUnitSettingsStore)()).moveUnitEnabled;
var selectStore = (0, mapSelectStore_1.useMapSelectStore)();
var toggleAddMultiple = (0, core_1.useToggle)(addMultiple);
var bus = (0, core_1.useEventBus)(eventKeys_1.orbatUnitClick);
var _c = (0, dragStore_1.useActiveUnitStore)(), activeUnitId = _c.activeUnitId, resetActiveParent = _c.resetActiveParent, activeParent = _c.activeParent, activeParentId = _c.activeParentId;
var _d = (0, mainToolbarData_1.useToolbarUnitSymbolData)(), currentSid = _d.currentSid, currentEchelon = _d.currentEchelon, activeSidc = _d.activeSidc;
var computedSidc = (0, vue_1.computed)(function () {
    var computedActiveSidc = activeSidc.value.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX)
        ? "10031000141211000000"
        : activeSidc.value;
    var parsedSidc = new sidc_1.Sidc(computedActiveSidc);
    parsedSidc.standardIdentity = currentSid.value;
    parsedSidc.emt = "00";
    parsedSidc.hqtfd = "0";
    return parsedSidc.toString();
});
var toggleMoveUnit = (0, core_1.useToggle)(moveUnitEnabled);
var symbolOptions = (0, vue_1.computed)(function () {
    return activeParent.value
        ? __assign(__assign({}, unitActions.getCombinedSymbolOptions(activeParent.value, true)), { outlineWidth: 5 }) : {};
});
var _e = (0, geoMapLocation_1.useGetMapLocation)(mapRef.value, {
    cancelOnClickOutside: false,
    stopPropagationOnClickOutside: false,
}), startGetLocation = _e.start, isGetLocationActive = _e.isActive, cancelGetLocation = _e.cancel, onGetLocation = _e.onGetLocation, onCancel = _e.onCancel, onStart = _e.onStart;
function addUnit(sidc, closePopover) {
    activeSidc.value = sidc;
    closePopover && closePopover();
    startGetLocation();
}
(0, vue_1.onMounted)(function () {
    if (!activeParentId.value)
        resetActiveParent();
});
onCancel(function () {
    selectStore.hoverEnabled = true;
});
onStart(function () {
    selectStore.hoverEnabled = false;
    store.clearToolbar();
});
onGetLocation(function (location) {
    selectStore.hoverEnabled = true;
    groupUpdate(function () {
        var _a, _b, _c;
        if (!activeParentId.value || unitActions.isUnitLocked(activeParentId.value))
            return;
        var name = "".concat(((_c = (_b = (_a = activeParent.value) === null || _a === void 0 ? void 0 : _a.subUnits) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) + 1);
        var sidc = new sidc_1.Sidc(activeSidc.value);
        sidc.emt = currentEchelon.value;
        sidc.standardIdentity = currentSid.value;
        var unitId = unitActions.createSubordinateUnit(activeParentId.value, {
            sidc: sidc.toString(),
            name: name,
        });
        unitId && addUnitPosition(unitId, location);
    });
    if (addMultiple.value && activeSidc.value) {
        addUnit(activeSidc.value);
    }
});
bus.on(function (unit) {
    var _a, _b, _c;
    if (isGetLocationActive.value) {
        if (!(addMultiple.value && activeSidc.value)) {
            cancelGetLocation();
        }
        var name_1 = "".concat(((_c = (_b = (_a = activeParent.value) === null || _a === void 0 ? void 0 : _a.subUnits) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) + 1);
        var sidc = new sidc_1.Sidc(activeSidc.value);
        sidc.emt = currentEchelon.value;
        sidc.standardIdentity = unit.sidc[sidc_1.SID_INDEX];
        var unitId = unitActions.createSubordinateUnit(unit.id, {
            sidc: sidc.toString(),
            name: name_1,
        });
    }
});
(0, vue_1.watch)(activeParent, function (unitOrSideGroup) {
    if (!unitOrSideGroup)
        return;
    var hasCustomSymbol = "sidc" in unitOrSideGroup && unitOrSideGroup.sidc.startsWith(constants_ts_1.CUSTOM_SYMBOL_PREFIX);
    if ("sidc" in unitOrSideGroup && !hasCustomSymbol) {
        currentSid.value = unitOrSideGroup.sidc[sidc_1.SID_INDEX];
    }
    else {
        if (hasCustomSymbol) {
            currentSid.value = getSideById(unitOrSideGroup._sid).standardIdentity;
        }
        else {
            currentSid.value = getSideById(unitOrSideGroup._pid).standardIdentity;
        }
    }
});
function selectEchelon(sidc) {
    currentEchelon.value = new sidc_1.Sidc(sidc).emt;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "bg-sidebar border-border pointer-events-auto flex w-full items-center justify-between border p-1 text-sm shadow-sm sm:rounded-xl sm:p-2 md:w-auto" }));
/** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
var __VLS_0 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onClick': {} }, { title: "Keep selected tool active after drawing" }), { class: "hidden sm:flex" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Keep selected tool active after drawing" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleAddMultiple();
            // @ts-ignore
            [toggleAddMultiple,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_7 = __VLS_3.slots.default;
if (__VLS_ctx.addMultiple) {
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOutline} */
    vue_mdi_1.IconLockOutline;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "size-5" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
}
else {
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconLockOpenVariantOutline} */
    vue_mdi_1.IconLockOpenVariantOutline;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ class: "size-6" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
}
// @ts-ignore
[addMultiple,];
var __VLS_3;
var __VLS_4;
var __VLS_18 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ 'onClick': {} }, { active: (!__VLS_ctx.moveUnitEnabled) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { active: (!__VLS_ctx.moveUnitEnabled) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23;
var __VLS_24 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleMoveUnit(false);
            // @ts-ignore
            [moveUnitEnabled, toggleMoveUnit,];
        } });
var __VLS_25 = __VLS_21.slots.default;
var __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.SelectIcon} */
vue_mdi_1.IconCursorDefaultOutline;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26(__assign({ class: "size-6" })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_27), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_21;
var __VLS_22;
var __VLS_31 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ 'onClick': {} }, { active: (__VLS_ctx.moveUnitEnabled), title: "Move unit" })));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { active: (__VLS_ctx.moveUnitEnabled), title: "Move unit" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
var __VLS_36;
var __VLS_37 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleMoveUnit(true);
            // @ts-ignore
            [moveUnitEnabled, toggleMoveUnit,];
        } });
var __VLS_38 = __VLS_34.slots.default;
var __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.MoveIcon} */
vue_mdi_1.IconCursorMove;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39(__assign({ class: "size-6" })));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_40), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_34;
var __VLS_35;
var __VLS_44 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44(__assign(__assign({ 'onClick': {} }, { title: "Show settings" }), { class: "hidden md:flex" })));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Show settings" }), { class: "hidden md:flex" })], __VLS_functionalComponentArgsRest(__VLS_45), false));
var __VLS_49;
var __VLS_50 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('show-settings');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
var __VLS_51 = __VLS_47.slots.default;
var __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.SettingsIcon} */
vue_mdi_1.IconCogOutline;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign({ class: "size-6" })));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_53), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_47;
var __VLS_48;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border h-7 border-l-2 sm:mx-1" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mx-1']} */ ;
var __VLS_57 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign({ 'onClick': {} }, { active: (__VLS_ctx.store.currentToolbar === 'measurements'), title: "Measurements" })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { active: (__VLS_ctx.store.currentToolbar === 'measurements'), title: "Measurements" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_62;
var __VLS_63 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.toggleToolbar('measurements');
            // @ts-ignore
            [store, store,];
        } });
var __VLS_64 = __VLS_60.slots.default;
var __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.MeasurementIcon} */
vue_mdi_1.IconRulerSquareCompass;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65(__assign({ class: "size-6" })));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_66), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_60;
var __VLS_61;
var __VLS_70 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70(__assign({ 'onClick': {} }, { active: (__VLS_ctx.store.currentToolbar === 'draw'), title: "Draw" })));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { active: (__VLS_ctx.store.currentToolbar === 'draw'), title: "Draw" })], __VLS_functionalComponentArgsRest(__VLS_71), false));
var __VLS_75;
var __VLS_76 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.toggleToolbar('draw');
            // @ts-ignore
            [store, store,];
        } });
var __VLS_77 = __VLS_73.slots.default;
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.DrawIcon} */
vue_mdi_1.IconPencil;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ class: "size-6" })));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_79), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_73;
var __VLS_74;
var __VLS_83 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83(__assign({ 'onClick': {} }, { title: "Unit track", active: (__VLS_ctx.store.currentToolbar === 'track') })));
var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Unit track", active: (__VLS_ctx.store.currentToolbar === 'track') })], __VLS_functionalComponentArgsRest(__VLS_84), false));
var __VLS_88;
var __VLS_89 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.store.toggleToolbar('track');
            // @ts-ignore
            [store, store,];
        } });
var __VLS_90 = __VLS_86.slots.default;
var __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.IconMapMarkerPath} */
vue_mdi_1.IconMapMarkerPath;
// @ts-ignore
var __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91(__assign({ class: "size-6" })));
var __VLS_93 = __VLS_92.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_92), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_86;
var __VLS_87;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border h-7 border-l-2 sm:mx-1" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mx-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "ml-2 flex items-center" }));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_96 = EchelonPickerPopover_vue_1.default;
// @ts-ignore
var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    symbolOptions: (__VLS_ctx.symbolOptions),
    selectEchelon: (__VLS_ctx.selectEchelon),
}));
var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([{
        symbolOptions: (__VLS_ctx.symbolOptions),
        selectEchelon: (__VLS_ctx.selectEchelon),
    }], __VLS_functionalComponentArgsRest(__VLS_97), false));
var __VLS_101 = PanelSymbolButton_vue_1.default || PanelSymbolButton_vue_1.default;
// @ts-ignore
var __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101(__assign(__assign(__assign({ 'onClick': {} }, { size: (22), sidc: (__VLS_ctx.computedSidc) }), { class: "group relative ml-2 sm:ml-5" }), { symbolOptions: (__VLS_ctx.symbolOptions), title: "Add unit", disabled: (!__VLS_ctx.activeParentId || __VLS_ctx.unitActions.isUnitLocked(__VLS_ctx.activeParentId)) })));
var __VLS_103 = __VLS_102.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { size: (22), sidc: (__VLS_ctx.computedSidc) }), { class: "group relative ml-2 sm:ml-5" }), { symbolOptions: (__VLS_ctx.symbolOptions), title: "Add unit", disabled: (!__VLS_ctx.activeParentId || __VLS_ctx.unitActions.isUnitLocked(__VLS_ctx.activeParentId)) })], __VLS_functionalComponentArgsRest(__VLS_102), false));
var __VLS_106;
var __VLS_107 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.addUnit(__VLS_ctx.activeSidc);
            // @ts-ignore
            [symbolOptions, symbolOptions, selectEchelon, computedSidc, activeParentId, activeParentId, unitActions, addUnit, activeSidc,];
        } });
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:ml-5']} */ ;
var __VLS_108 = __VLS_104.slots.default;
var __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.AddSymbolIcon} */
vue_mdi_1.IconPlus;
// @ts-ignore
var __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109(__assign({ class: "bg-opacity-70 text-muted-foreground group-hover:text-foreground bg-background absolute -right-2 bottom-0 h-4 w-4 rounded-full" })));
var __VLS_111 = __VLS_110.apply(void 0, __spreadArray([__assign({ class: "bg-opacity-70 text-muted-foreground group-hover:text-foreground bg-background absolute -right-2 bottom-0 h-4 w-4 rounded-full" })], __VLS_functionalComponentArgsRest(__VLS_110), false));
/** @type {__VLS_StyleScopedClasses['bg-opacity-70']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
// @ts-ignore
[];
var __VLS_104;
var __VLS_105;
var __VLS_114 = SymbolPickerPopover_vue_1.default;
// @ts-ignore
var __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    symbolOptions: (__VLS_ctx.symbolOptions),
    addUnit: (__VLS_ctx.addUnit),
}));
var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([{
        symbolOptions: (__VLS_ctx.symbolOptions),
        addUnit: (__VLS_ctx.addUnit),
    }], __VLS_functionalComponentArgsRest(__VLS_115), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border -mx-1 h-7 border-l-2 sm:mx-1" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['-mx-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mx-1']} */ ;
var __VLS_119 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119(__assign({ 'onClick': {} }, { title: "Undo", disabled: (!__VLS_ctx.canUndo) })));
var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Undo", disabled: (!__VLS_ctx.canUndo) })], __VLS_functionalComponentArgsRest(__VLS_120), false));
var __VLS_124;
var __VLS_125 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.undo();
            // @ts-ignore
            [symbolOptions, addUnit, canUndo, undo,];
        } });
var __VLS_126 = __VLS_122.slots.default;
var __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.UndoIcon} */
vue_mdi_1.IconUndoVariant;
// @ts-ignore
var __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127(__assign({ class: "size-6" })));
var __VLS_129 = __VLS_128.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_128), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_122;
var __VLS_123;
var __VLS_132 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132(__assign({ 'onClick': {} }, { title: "Redo", disabled: (!__VLS_ctx.canRedo) })));
var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Redo", disabled: (!__VLS_ctx.canRedo) })], __VLS_functionalComponentArgsRest(__VLS_133), false));
var __VLS_137;
var __VLS_138 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.redo();
            // @ts-ignore
            [canRedo, redo,];
        } });
var __VLS_139 = __VLS_135.slots.default;
var __VLS_140;
/** @ts-ignore @type {typeof __VLS_components.RedoIcon} */
vue_mdi_1.IconRedoVariant;
// @ts-ignore
var __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140(__assign({ class: "size-6" })));
var __VLS_142 = __VLS_141.apply(void 0, __spreadArray([__assign({ class: "size-6" })], __VLS_functionalComponentArgsRest(__VLS_141), false));
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
// @ts-ignore
[];
var __VLS_135;
var __VLS_136;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "border-border mx-1 hidden h-7 border-l-2 sm:block" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-1']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
var __VLS_145 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145(__assign(__assign({ 'onClick': {} }, { title: "Select Time and Date" }), { class: "hidden sm:flex" })));
var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Select Time and Date" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_146), false));
var __VLS_150;
var __VLS_151 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('open-time-modal');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_152 = __VLS_148.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.CalendarIcon} */
solid_1.CalendarIcon;
// @ts-ignore
var __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
var __VLS_155 = __VLS_154.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_154), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_148;
var __VLS_149;
var __VLS_158 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158(__assign(__assign({ 'onClick': {} }, { title: "Previous Day" }), { class: "hidden sm:flex" })));
var __VLS_160 = __VLS_159.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Previous Day" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_159), false));
var __VLS_163;
var __VLS_164 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('dec-day');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_165 = __VLS_161.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_166;
/** @ts-ignore @type {typeof __VLS_components.IconChevronLeft} */
vue_mdi_1.IconChevronLeft;
// @ts-ignore
var __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
var __VLS_168 = __VLS_167.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_167), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_161;
var __VLS_162;
var __VLS_171 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171(__assign(__assign({ 'onClick': {} }, { title: "Next Day" }), { class: "hidden sm:flex" })));
var __VLS_173 = __VLS_172.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Next Day" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_172), false));
var __VLS_176;
var __VLS_177 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('inc-day');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_178 = __VLS_174.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.IconChevronRight} */
vue_mdi_1.IconChevronRight;
// @ts-ignore
var __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
var __VLS_181 = __VLS_180.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_180), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_174;
var __VLS_175;
var __VLS_184 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184(__assign(__assign({ 'onClick': {} }, { title: "Previous Event" }), { class: "hidden sm:flex" })));
var __VLS_186 = __VLS_185.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Previous Event" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_185), false));
var __VLS_189;
var __VLS_190 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('prev-event');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_191 = __VLS_187.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_192;
/** @ts-ignore @type {typeof __VLS_components.IconSkipPrevious} */
vue_mdi_1.IconSkipPrevious;
// @ts-ignore
var __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192(__assign({ class: "size-5" }, { 'aria-hidden': "true" })));
var __VLS_194 = __VLS_193.apply(void 0, __spreadArray([__assign({ class: "size-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_193), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
// @ts-ignore
[];
var __VLS_187;
var __VLS_188;
var __VLS_197 = MainToolbarButton_vue_1.default || MainToolbarButton_vue_1.default;
// @ts-ignore
var __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197(__assign(__assign({ 'onClick': {} }, { title: "Next Event" }), { class: "hidden sm:flex" })));
var __VLS_199 = __VLS_198.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { title: "Next Event" }), { class: "hidden sm:flex" })], __VLS_functionalComponentArgsRest(__VLS_198), false));
var __VLS_202;
var __VLS_203 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('next-event');
            // @ts-ignore
            [emit,];
        } });
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
var __VLS_204 = __VLS_200.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
var __VLS_205;
/** @ts-ignore @type {typeof __VLS_components.IconSkipNext} */
vue_mdi_1.IconSkipNext;
// @ts-ignore
var __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205(__assign({ class: "size-5 w-5" }, { 'aria-hidden': "true" })));
var __VLS_207 = __VLS_206.apply(void 0, __spreadArray([__assign({ class: "size-5 w-5" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_206), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[];
var __VLS_200;
var __VLS_201;
if (__VLS_ctx.isGetLocationActive) {
    var __VLS_210 = FloatingPanel_vue_1.default || FloatingPanel_vue_1.default;
    // @ts-ignore
    var __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210(__assign({ class: "bg-opacity-75 absolute bottom-14 overflow-visible p-2 px-4 text-sm sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2" })));
    var __VLS_212 = __VLS_211.apply(void 0, __spreadArray([__assign({ class: "bg-opacity-75 absolute bottom-14 overflow-visible p-2 px-4 text-sm sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2" })], __VLS_functionalComponentArgsRest(__VLS_211), false));
    /** @type {__VLS_StyleScopedClasses['bg-opacity-75']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-visible']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:bottom-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:-translate-x-1/2']} */ ;
    var __VLS_215 = __VLS_213.slots.default;
    var __VLS_216 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
    var __VLS_218 = __VLS_217.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_217), false));
    var __VLS_221 = void 0;
    var __VLS_222 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isGetLocationActive))
                    return;
                __VLS_ctx.cancelGetLocation();
                // @ts-ignore
                [isGetLocationActive, cancelGetLocation,];
            } });
    var __VLS_223 = __VLS_219.slots.default;
    // @ts-ignore
    [];
    var __VLS_219;
    var __VLS_220;
    // @ts-ignore
    [];
    var __VLS_213;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
});
exports.default = {};
