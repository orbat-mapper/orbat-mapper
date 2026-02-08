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
var helpers_1 = require("@/components/helpers");
var InputGroup_vue_1 = require("../../components/InputGroup.vue");
var InlineFormPanel_vue_1 = require("../../components/InlineFormPanel.vue");
var BaseButton_vue_1 = require("../../components/BaseButton.vue");
var utils_1 = require("@/geo/utils");
var utils_2 = require("@/utils");
var injects_1 = require("@/components/injects");
var DescriptionItem_vue_1 = require("@/components/DescriptionItem.vue");
var PlainButton_vue_1 = require("@/components/PlainButton.vue");
var props = defineProps();
var emit = defineEmits(["close", "update"]);
var timeZone = (0, utils_2.injectStrict)(injects_1.activeScenarioKey).time.timeZone;
var getModalTimestamp = (0, utils_2.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var form = (0, vue_1.ref)({
    name: props.layer.name,
    visibleFromT: props.layer.visibleFromT,
    visibleUntilT: props.layer.visibleUntilT,
    _isNew: false,
});
var onFormSubmit = function () {
    emit("update", __assign({}, form.value));
    emit("close");
};
var focusId = (0, helpers_1.useFocusOnMount)().focusId;
function doShowTimeModal(field) {
    return __awaiter(this, void 0, void 0, function () {
        var newTimestamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getModalTimestamp(form.value[field], {
                        timeZone: timeZone.value,
                        title: field === "visibleFromT" ? "Visible from" : "Visible until",
                    })];
                case 1:
                    newTimestamp = _a.sent();
                    if (newTimestamp !== undefined) {
                        form.value[field] = newTimestamp;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = InlineFormPanel_vue_1.default || InlineFormPanel_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onClose': {} }, { title: "Edit layer" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { title: "Edit layer" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.$emit('close');
            // @ts-ignore
            [$emit,];
        } });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onFormSubmit) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_9 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign({ 'onKeyup': {} }, { label: "Layer name", modelValue: (__VLS_ctx.form.name), id: (__VLS_ctx.focusId) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ 'onKeyup': {} }, { label: "Layer name", modelValue: (__VLS_ctx.form.name), id: (__VLS_ctx.focusId) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14;
var __VLS_15 = ({ keyup: {} },
    { onKeyup: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('close');
            // @ts-ignore
            [onFormSubmit, form, focusId, emit,];
        } });
var __VLS_12;
var __VLS_13;
var __VLS_16 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    label: "Visible from",
}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
        label: "Visible from",
    }], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_21 = __VLS_19.slots.default;
(__VLS_ctx.formatDateString(__VLS_ctx.form.visibleFromT, __VLS_ctx.timeZone));
var __VLS_22 = PlainButton_vue_1.default || PlainButton_vue_1.default;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onClick': {} }, { class: "ml-2" })));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27;
var __VLS_28 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.doShowTimeModal('visibleFromT');
            // @ts-ignore
            [form, utils_1.formatDateString, timeZone, doShowTimeModal,];
        } });
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
var __VLS_29 = __VLS_25.slots.default;
// @ts-ignore
[];
var __VLS_25;
var __VLS_26;
if (__VLS_ctx.form.visibleFromT) {
    var __VLS_30 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ 'onClick': {} })));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_31), false));
    var __VLS_35 = void 0;
    var __VLS_36 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.form.visibleFromT))
                    return;
                __VLS_ctx.form.visibleFromT = undefined;
                // @ts-ignore
                [form, form,];
            } });
    var __VLS_37 = __VLS_33.slots.default;
    // @ts-ignore
    [];
    var __VLS_33;
    var __VLS_34;
}
// @ts-ignore
[];
var __VLS_19;
var __VLS_38 = DescriptionItem_vue_1.default || DescriptionItem_vue_1.default;
// @ts-ignore
var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    label: "Visible until",
}));
var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([{
        label: "Visible until",
    }], __VLS_functionalComponentArgsRest(__VLS_39), false));
var __VLS_43 = __VLS_41.slots.default;
(__VLS_ctx.formatDateString(__VLS_ctx.form.visibleUntilT, __VLS_ctx.timeZone));
var __VLS_44 = PlainButton_vue_1.default || PlainButton_vue_1.default;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44(__assign({ 'onClick': {} }, { class: "ml-2" })));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "ml-2" })], __VLS_functionalComponentArgsRest(__VLS_45), false));
var __VLS_49;
var __VLS_50 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.doShowTimeModal('visibleUntilT');
            // @ts-ignore
            [form, utils_1.formatDateString, timeZone, doShowTimeModal,];
        } });
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
var __VLS_51 = __VLS_47.slots.default;
// @ts-ignore
[];
var __VLS_47;
var __VLS_48;
if (__VLS_ctx.form.visibleUntilT) {
    var __VLS_52 = PlainButton_vue_1.default || PlainButton_vue_1.default;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign({ 'onClick': {} })));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_53), false));
    var __VLS_57 = void 0;
    var __VLS_58 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.form.visibleUntilT))
                    return;
                __VLS_ctx.form.visibleUntilT = undefined;
                // @ts-ignore
                [form, form,];
            } });
    var __VLS_59 = __VLS_55.slots.default;
    // @ts-ignore
    [];
    var __VLS_55;
    var __VLS_56;
}
// @ts-ignore
[];
var __VLS_41;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "my-4 flex items-center justify-end space-x-2" }));
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_60 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    primary: true,
    small: true,
    type: "submit",
}));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{
        primary: true,
        small: true,
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_65 = __VLS_63.slots.default;
// @ts-ignore
[];
var __VLS_63;
var __VLS_66 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ 'onClick': {} }, { small: true })));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_67), false));
var __VLS_71;
var __VLS_72 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } });
var __VLS_73 = __VLS_69.slots.default;
// @ts-ignore
[];
var __VLS_69;
var __VLS_70;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
