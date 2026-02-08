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
var solid_1 = require("@heroicons/vue/20/solid");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var GridEditableCell_vue_1 = require("@/modules/scenarioeditor/GridEditableCell.vue");
var props = defineProps();
var emit = defineEmits([
    "toggle",
    "expand",
    "updateSideGroup",
    "nextCell",
    "activeItem",
]);
function toggleOpen() {
    emit("toggle", props.sideGroup);
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ class: "bg-muted/40" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "relative" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
if (__VLS_ctx.isActive) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-primary absolute inset-y-0 right-0 w-0.5" }));
    /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('toggle', __VLS_ctx.sideGroup);
        // @ts-ignore
        [isActive, emit, sideGroup,];
    } }, { class: "hover:cursor-pointer" }));
/** @type {__VLS_StyleScopedClasses['hover:cursor-pointer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [toggleOpen,];
    } }, { onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleOpen();
        // @ts-ignore
        [toggleOpen,];
    } }), { id: ("cell-".concat(__VLS_ctx.itemIndex, "-0")), tabindex: "0" }), { class: "border-card bg-card/80 text-foreground focus-within:border-ring flex h-12 items-center border-2 py-2 pr-3 text-sm font-medium whitespace-nowrap" }));
/** @type {__VLS_StyleScopedClasses['border-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card/80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('toggle', __VLS_ctx.sideGroup);
        // @ts-ignore
        [emit, sideGroup, itemIndex,];
    } }, { tabindex: "0" }), { class: "ml-0 flex items-center" }));
/** @type {__VLS_StyleScopedClasses['ml-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
solid_1.ChevronRightIcon;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
        'rotate-90': (_a = __VLS_ctx.sgOpen.get(__VLS_ctx.sideGroup)) !== null && _a !== void 0 ? _a : true,
    }) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform" }, { class: ({
            'rotate-90': (_b = __VLS_ctx.sgOpen.get(__VLS_ctx.sideGroup)) !== null && _b !== void 0 ? _b : true,
        }) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-90']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ class: "ml-2 text-sm font-semibold hover:underline" }));
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
(__VLS_ctx.sideGroup.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_5 = GridEditableCell_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign(__assign(__assign({ 'onUpdate': {} }, { 'onNextCell': {} }), { 'onActive': {} }), { value: (__VLS_ctx.sideGroup.name), rowIndex: (__VLS_ctx.itemIndex), colIndex: (1) })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate': {} }, { 'onNextCell': {} }), { 'onActive': {} }), { value: (__VLS_ctx.sideGroup.name), rowIndex: (__VLS_ctx.itemIndex), colIndex: (1) })], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10;
var __VLS_11 = ({ update: {} },
    { onUpdate: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('updateSideGroup', __VLS_ctx.sideGroup.id, { name: $event });
            // @ts-ignore
            [emit, sideGroup, sideGroup, sideGroup, sideGroup, itemIndex, sgOpen,];
        } });
var __VLS_12 = ({ nextCell: {} },
    { onNextCell: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('nextCell', $event);
            // @ts-ignore
            [emit,];
        } });
var __VLS_13 = ({ active: {} },
    { onActive: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('activeItem', 'name');
            // @ts-ignore
            [emit,];
        } });
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ colspan: (__VLS_ctx.columns.length - 1) }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground flex h-12 items-center py-2 pr-3 text-sm font-medium whitespace-nowrap" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
var __VLS_14 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "ml-2" })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19;
var __VLS_20 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('expand', __VLS_ctx.sideGroup);
            // @ts-ignore
            [emit, sideGroup, columns,];
        } });
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
var __VLS_21 = __VLS_17.slots.default;
// @ts-ignore
[];
var __VLS_17;
var __VLS_18;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
