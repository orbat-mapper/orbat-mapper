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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var vue_1 = require("vue");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var button_1 = require("@/components/ui/button");
var crypto_1 = require("@/utils/crypto");
var alert_1 = require("@/components/ui/alert");
var lucide_vue_next_1 = require("lucide-vue-next");
var props = defineProps();
var emit = defineEmits();
var open = defineModel({ default: false });
var password = (0, vue_1.ref)("");
var showPassword = (0, vue_1.ref)(false);
var isDecrypting = (0, vue_1.ref)(false);
var error = (0, vue_1.ref)("");
function onDecrypt() {
    return __awaiter(this, void 0, void 0, function () {
        var decrypted, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!password.value)
                        return [2 /*return*/];
                    isDecrypting.value = true;
                    error.value = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, crypto_1.decryptScenario)(props.encryptedScenario, password.value)];
                case 2:
                    decrypted = _a.sent();
                    emit("decrypted", decrypted);
                    open.value = false;
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    error.value = "Decryption failed. Invalid password or corrupted file.";
                    return [3 /*break*/, 5];
                case 4:
                    isDecrypting.value = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function onCancel() {
    open.value = false;
    emit("cancel");
}
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = NewSimpleModal_vue_1.default || NewSimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: "Decrypt Scenario" }), { class: "sm:max-w-md" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: "Decrypt Scenario" }), { class: "sm:max-w-md" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ cancel: {} },
    { onCancel: (__VLS_ctx.onCancel) });
var __VLS_7 = {};
/** @type {__VLS_StyleScopedClasses['sm:max-w-md']} */ ;
var __VLS_8 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onDecrypt) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if ((_a = __VLS_ctx.encryptedScenario.header) === null || _a === void 0 ? void 0 : _a.description) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-secondary text-secondary-foreground rounded-md p-3 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['bg-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-secondary-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.encryptedScenario.header.description);
}
var __VLS_9 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    modelValue: (__VLS_ctx.password),
    label: "Password",
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    autofocus: true,
    placeholder: "Enter password",
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.password),
        label: "Password",
        type: (__VLS_ctx.showPassword ? 'text' : 'password'),
        autofocus: true,
        placeholder: "Enter password",
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.showPassword),
    label: "Show password",
}));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showPassword),
        label: "Show password",
    }], __VLS_functionalComponentArgsRest(__VLS_15), false));
if (__VLS_ctx.error) {
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
    alert_1.Alert;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        variant: "destructive",
    }));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
            variant: "destructive",
        }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    var __VLS_24 = __VLS_22.slots.default;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertCircleIcon} */
    lucide_vue_next_1.AlertCircleIcon;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign({ class: "h-4 w-4" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "h-4 w-4" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    var __VLS_30 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertTitle | typeof __VLS_components.AlertTitle} */
    alert_1.AlertTitle;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
    var __VLS_35 = __VLS_33.slots.default;
    // @ts-ignore
    [open, onCancel, onDecrypt, encryptedScenario, encryptedScenario, password, showPassword, showPassword, error,];
    var __VLS_33;
    var __VLS_36 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
    alert_1.AlertDescription;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_37), false));
    var __VLS_41 = __VLS_39.slots.default;
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
    var __VLS_39;
    // @ts-ignore
    [];
    var __VLS_22;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2 pt-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
var __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42(__assign({ 'onClick': {} }, { variant: "ghost", type: "button" })));
var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", type: "button" })], __VLS_functionalComponentArgsRest(__VLS_43), false));
var __VLS_47;
var __VLS_48 = ({ click: {} },
    { onClick: (__VLS_ctx.onCancel) });
var __VLS_49 = __VLS_45.slots.default;
// @ts-ignore
[onCancel,];
var __VLS_45;
var __VLS_46;
var __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    type: "submit",
    disabled: (!__VLS_ctx.password || __VLS_ctx.isDecrypting),
}));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([{
        type: "submit",
        disabled: (!__VLS_ctx.password || __VLS_ctx.isDecrypting),
    }], __VLS_functionalComponentArgsRest(__VLS_51), false));
var __VLS_55 = __VLS_53.slots.default;
(__VLS_ctx.isDecrypting ? "Decrypting..." : "Open");
// @ts-ignore
[password, isDecrypting, isDecrypting,];
var __VLS_53;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
