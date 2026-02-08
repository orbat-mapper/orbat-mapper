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
var sidc_1 = require("@/symbology/sidc");
var core_1 = require("@vueuse/core");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var notifications_1 = require("@/composables/notifications");
var props = defineProps();
var emit = defineEmits(["update"]);
var send = (0, notifications_1.useNotifications)().send;
var copyToClipboard = (0, core_1.useClipboard)().copy;
var _a = (0, core_1.useToggle)(false), isEditMode = _a[0], toggleEditMode = _a[1];
var newSidc = (0, vue_1.ref)("");
(0, vue_1.watch)(function () { return props.sidc; }, function (value) {
    newSidc.value = value;
}, { immediate: true });
var parts = (0, vue_1.computed)(function () {
    var s = new sidc_1.Sidc(props.sidc);
    return [
        ["start", s.version + s.context + s.standardIdentity],
        ["symbolSet", s.symbolSet],
        ["status", s.status],
        ["hqtfd", s.hqtfd],
        ["amp", s.emt],
        ["mainIcon", s.mainIcon],
        ["mod1", s.modifierOne],
        ["mod2", s.modifierTwo],
    ];
});
function onSubmit() {
    emit("update", newSidc.value);
    newSidc.value = props.sidc;
    toggleEditMode();
}
function onCopy() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, copyToClipboard(props.sidc)];
                case 1:
                    _a.sent();
                    send({
                        message: "Copied ".concat(props.sidc, " to the clipboard"),
                    });
                    return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
if (!__VLS_ctx.isEditMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "hover:border-muted-foreground rounded border border-transparent p-1 font-mono text-base" }));
    /** @type {__VLS_StyleScopedClasses['hover:border-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.parts)); _i < _b.length; _i++) {
        var _c = _b[_i][0], key = _c[0], part = _c[1];
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ key: (key) }, { class: (['sm:px-0.5', __VLS_ctx.activePart === key ? 'bg-yellow-300 text-red-800' : '']) }));
        /** @type {__VLS_StyleScopedClasses['sm:px-0.5']} */ ;
        (part);
        // @ts-ignore
        [isEditMode, parts, activePart,];
    }
    var __VLS_0 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClick': {} })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    var __VLS_6 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(!__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [toggleEditMode,];
            } });
    var __VLS_7 = __VLS_3.slots.default;
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.EditIcon} */
    vue_mdi_1.IconPencil;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "h-5 w-5" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
    var __VLS_13 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ 'onClick': {} })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = void 0;
    var __VLS_19 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(!__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.onCopy();
                // @ts-ignore
                [onCopy,];
            } });
    var __VLS_20 = __VLS_16.slots.default;
    var __VLS_21 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CopyIcon} */
    vue_mdi_1.IconClipboardTextMultiple;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ class: "h-5 w-5" })));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_22), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_16;
    var __VLS_17;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { class: "ml-2 flex items-end" }));
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    var __VLS_26 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        label: "Symbol code",
        modelValue: (__VLS_ctx.newSidc),
        autofocus: true,
    }));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{
            label: "Symbol code",
            modelValue: (__VLS_ctx.newSidc),
            autofocus: true,
        }], __VLS_functionalComponentArgsRest(__VLS_27), false));
    var __VLS_31 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ type: "submit" }, { class: "ml-1" })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ type: "submit" }, { class: "ml-1" })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    var __VLS_36 = __VLS_34.slots.default;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconCheck} */
    vue_mdi_1.IconCheck;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ class: "h-5 w-5" })));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [onSubmit, newSidc,];
    var __VLS_34;
    var __VLS_42 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42(__assign({ 'onClick': {} }, { type: "submit" })));
    var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "submit" })], __VLS_functionalComponentArgsRest(__VLS_43), false));
    var __VLS_47 = void 0;
    var __VLS_48 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(!__VLS_ctx.isEditMode))
                    return;
                __VLS_ctx.toggleEditMode();
                // @ts-ignore
                [toggleEditMode,];
            } });
    var __VLS_49 = __VLS_45.slots.default;
    var __VLS_50 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconClose} */
    vue_mdi_1.IconClose;
    // @ts-ignore
    var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ class: "h-5 w-5" })));
    var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ class: "h-5 w-5" })], __VLS_functionalComponentArgsRest(__VLS_51), false));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_45;
    var __VLS_46;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
