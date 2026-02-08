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
var core_1 = require("@vueuse/core");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var button_1 = require("@/components/ui/button");
var vue_1 = require("vue");
var scenarioShare_1 = require("@/composables/scenarioShare");
var injects_1 = require("@/components/injects");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var alert_1 = require("@/components/ui/alert");
var lucide_vue_next_1 = require("lucide-vue-next");
var crypto_1 = require("@/utils/crypto");
var open = defineModel({ default: false });
var activeScenario = (0, vue_1.inject)(injects_1.activeScenarioKey);
var _a = (0, core_1.useClipboard)(), copy = _a.copy, copied = _a.copied;
var addToHistory = (0, scenarioShare_1.useShareHistory)().addToHistory;
var generatedUrl = (0, vue_1.ref)("");
var error = (0, vue_1.ref)("");
var isLoading = (0, vue_1.ref)(false);
var useEncryption = (0, vue_1.ref)(false);
var password = (0, vue_1.ref)("");
var description = (0, vue_1.ref)("");
var showPassword = (0, vue_1.ref)(false);
var SHARE_API_URL = "/share";
function generateLink() {
    return __awaiter(this, void 0, void 0, function () {
        var scenarioData, uploadData, response, id, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isLoading.value = true;
                    error.value = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    scenarioData = activeScenario.io.serializeToObject();
                    uploadData = scenarioData;
                    if (!useEncryption.value) return [3 /*break*/, 3];
                    if (!password.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(scenarioData, password.value, {
                            header: { description: description.value },
                        })];
                case 2:
                    uploadData = _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, fetch(SHARE_API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-ORBAT-SECRET": import.meta.env.VITE_ORBAT_SECRET ||
                                "I9ZJ4z4FDtLFXpvHKIT2TALl7k9BUDRYr5Jj3IBF7A7Jp8KJDOR",
                        },
                        body: JSON.stringify(uploadData),
                    })];
                case 4:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 413) {
                            throw new Error("Scenario is too large to share.");
                        }
                        if (response.status === 429) {
                            throw new Error("You have reached the hourly upload limit.");
                        }
                        throw new Error("Failed to share scenario.");
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    id = (_a.sent()).id;
                    generatedUrl.value = "".concat(window.location.origin, "/import?id=").concat(id);
                    addToHistory({
                        id: id,
                        name: activeScenario.store.state.info.name || "Unnamed scenario",
                        url: generatedUrl.value,
                        encrypted: useEncryption.value,
                    });
                    return [3 /*break*/, 8];
                case 6:
                    e_1 = _a.sent();
                    console.error(e_1);
                    error.value = e_1.message || "An unexpected error occurred.";
                    return [3 /*break*/, 8];
                case 7:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function onCopy() {
    copy(generatedUrl.value);
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Share scenario" }, { class: "sm:max-w-xl" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Share scenario" }, { class: "sm:max-w-xl" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.description;
    // @ts-ignore
    [open,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground flex items-center justify-center gap-2 py-8" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    var __VLS_8 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.LoaderCircleIcon} */
    lucide_vue_next_1.LoaderCircleIcon;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ class: "animate-spin" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ class: "animate-spin" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
    alert_1.Alert;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        variant: "destructive",
    }));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
            variant: "destructive",
        }], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = __VLS_16.slots.default;
    var __VLS_19 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TriangleAlertIcon} */
    lucide_vue_next_1.TriangleAlertIcon;
    // @ts-ignore
    var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19(__assign({ class: "size-4" })));
    var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    var __VLS_24 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertTitle | typeof __VLS_components.AlertTitle} */
    alert_1.AlertTitle;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_29 = __VLS_27.slots.default;
    // @ts-ignore
    [isLoading, error,];
    var __VLS_27;
    var __VLS_30 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
    alert_1.AlertDescription;
    // @ts-ignore
    var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
    var __VLS_35 = __VLS_33.slots.default;
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
    var __VLS_33;
    // @ts-ignore
    [];
    var __VLS_16;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_36 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign({ 'onClick': {} }, { variant: "secondary" })));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "secondary" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
    var __VLS_41 = void 0;
    var __VLS_42 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.open = false;
                // @ts-ignore
                [open,];
            } });
    var __VLS_43 = __VLS_39.slots.default;
    // @ts-ignore
    [];
    var __VLS_39;
    var __VLS_40;
    var __VLS_44 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44(__assign({ 'onClick': {} })));
    var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_45), false));
    var __VLS_49 = void 0;
    var __VLS_50 = ({ click: {} },
        { onClick: (__VLS_ctx.generateLink) });
    var __VLS_51 = __VLS_47.slots.default;
    // @ts-ignore
    [generateLink,];
    var __VLS_47;
    var __VLS_48;
}
else if (__VLS_ctx.generatedUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_52 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52(__assign(__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.generatedUrl), label: "Sharable URL" }), { class: "grow" }), { readonly: true })));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.generatedUrl), label: "Sharable URL" }), { class: "grow" }), { readonly: true })], __VLS_functionalComponentArgsRest(__VLS_53), false));
    var __VLS_57 = void 0;
    var __VLS_58 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!(__VLS_ctx.generatedUrl))
                    return;
                $event.target.select();
                // @ts-ignore
                [generatedUrl, generatedUrl,];
            } });
    /** @type {__VLS_StyleScopedClasses['grow']} */ ;
    var __VLS_55;
    var __VLS_56;
    var __VLS_59 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ 'onClick': {} }, { class: "mb-0.5" })));
    var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "mb-0.5" })], __VLS_functionalComponentArgsRest(__VLS_60), false));
    var __VLS_64 = void 0;
    var __VLS_65 = ({ click: {} },
        { onClick: (__VLS_ctx.onCopy) });
    /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
    var __VLS_66 = __VLS_62.slots.default;
    (__VLS_ctx.copied ? "Copied!" : "Copy Link");
    var __VLS_67 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ClipboardCopyIcon} */
    lucide_vue_next_1.ClipboardCopyIcon;
    // @ts-ignore
    var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67(__assign({ class: "" })));
    var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_68), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    // @ts-ignore
    [onCopy, copied,];
    var __VLS_62;
    var __VLS_63;
    var __VLS_72 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
    alert_1.Alert;
    // @ts-ignore
    var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({}));
    var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_73), false));
    var __VLS_77 = __VLS_75.slots.default;
    var __VLS_78 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TriangleAlertIcon} */
    lucide_vue_next_1.TriangleAlertIcon;
    // @ts-ignore
    var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ class: "size-4" })));
    var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_79), false));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    var __VLS_83 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
    alert_1.AlertDescription;
    // @ts-ignore
    var __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({}));
    var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_84), false));
    var __VLS_88 = __VLS_86.slots.default;
    // @ts-ignore
    [];
    var __VLS_86;
    // @ts-ignore
    [];
    var __VLS_75;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    var __VLS_89 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89(__assign({ 'onClick': {} }, { variant: "secondary" })));
    var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "secondary" })], __VLS_functionalComponentArgsRest(__VLS_90), false));
    var __VLS_94 = void 0;
    var __VLS_95 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!(__VLS_ctx.generatedUrl))
                    return;
                __VLS_ctx.open = false;
                // @ts-ignore
                [open,];
            } });
    var __VLS_96 = __VLS_92.slots.default;
    // @ts-ignore
    [];
    var __VLS_92;
    var __VLS_93;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_97 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
    alert_1.Alert;
    // @ts-ignore
    var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({}));
    var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_98), false));
    var __VLS_102 = __VLS_100.slots.default;
    var __VLS_103 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TriangleAlertIcon} */
    lucide_vue_next_1.TriangleAlertIcon;
    // @ts-ignore
    var __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103(__assign({ class: "size-4" })));
    var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_104), false));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    var __VLS_108 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
    alert_1.AlertDescription;
    // @ts-ignore
    var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({}));
    var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_109), false));
    var __VLS_113 = __VLS_111.slots.default;
    (__VLS_ctx.useEncryption ? "and password" : "");
    // @ts-ignore
    [useEncryption,];
    var __VLS_111;
    // @ts-ignore
    [];
    var __VLS_100;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 pt-2" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    var __VLS_114 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        modelValue: (__VLS_ctx.useEncryption),
    }));
    var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.useEncryption),
        }], __VLS_functionalComponentArgsRest(__VLS_115), false));
    var __VLS_119 = __VLS_117.slots.default;
    // @ts-ignore
    [useEncryption,];
    var __VLS_117;
    if (__VLS_ctx.useEncryption) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 rounded-md border p-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        var __VLS_120 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
            modelValue: (__VLS_ctx.password),
            label: "Password",
            type: (__VLS_ctx.showPassword ? 'text' : 'password'),
            placeholder: "Enter password",
        }));
        var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.password),
                label: "Password",
                type: (__VLS_ctx.showPassword ? 'text' : 'password'),
                placeholder: "Enter password",
            }], __VLS_functionalComponentArgsRest(__VLS_121), false));
        var __VLS_125 = ToggleField_vue_1.default || ToggleField_vue_1.default;
        // @ts-ignore
        var __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
            modelValue: (__VLS_ctx.showPassword),
        }));
        var __VLS_127 = __VLS_126.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.showPassword),
            }], __VLS_functionalComponentArgsRest(__VLS_126), false));
        var __VLS_130 = __VLS_128.slots.default;
        // @ts-ignore
        [useEncryption, password, showPassword, showPassword,];
        var __VLS_128;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        var __VLS_131 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
            modelValue: (__VLS_ctx.description),
            label: "Description (optional)",
            placeholder: "Description",
        }));
        var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.description),
                label: "Description (optional)",
                placeholder: "Description",
            }], __VLS_functionalComponentArgsRest(__VLS_132), false));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 text-xs text-yellow-600 dark:text-yellow-500" }));
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:text-yellow-500']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_136 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136(__assign({ 'onClick': {} }, { variant: "secondary" })));
    var __VLS_138 = __VLS_137.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "secondary" })], __VLS_functionalComponentArgsRest(__VLS_137), false));
    var __VLS_141 = void 0;
    var __VLS_142 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!!(__VLS_ctx.generatedUrl))
                    return;
                __VLS_ctx.open = false;
                // @ts-ignore
                [open, description,];
            } });
    var __VLS_143 = __VLS_139.slots.default;
    // @ts-ignore
    [];
    var __VLS_139;
    var __VLS_140;
    var __VLS_144 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.useEncryption && !__VLS_ctx.password) })));
    var __VLS_146 = __VLS_145.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.useEncryption && !__VLS_ctx.password) })], __VLS_functionalComponentArgsRest(__VLS_145), false));
    var __VLS_149 = void 0;
    var __VLS_150 = ({ click: {} },
        { onClick: (__VLS_ctx.generateLink) });
    var __VLS_151 = __VLS_147.slots.default;
    // @ts-ignore
    [generateLink, useEncryption, password,];
    var __VLS_147;
    var __VLS_148;
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
