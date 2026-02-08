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
var scenarioShare_1 = require("@/composables/scenarioShare");
var vue_1 = require("vue");
var injects_1 = require("@/components/injects");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var alert_1 = require("@/components/ui/alert");
var lucide_vue_next_1 = require("lucide-vue-next");
var DocLink_vue_1 = require("@/components/DocLink.vue");
var open = defineModel({ default: false });
var activeScenario = (0, vue_1.inject)(injects_1.activeScenarioKey);
var shareScenario = (0, scenarioShare_1.useScenarioShare)().shareScenario;
var _a = (0, core_1.useClipboard)(), copy = _a.copy, copied = _a.copied;
var generatedUrl = (0, vue_1.ref)("");
var urlWarning = (0, vue_1.ref)("");
var isLoading = (0, vue_1.ref)(false);
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, url, warning;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                isLoading.value = true;
                _b.label = 1;
            case 1:
                _b.trys.push([1, , 3, 4]);
                return [4 /*yield*/, shareScenario(activeScenario)];
            case 2:
                _a = _b.sent(), url = _a.url, warning = _a.warning;
                generatedUrl.value = url;
                urlWarning.value = warning;
                return [3 /*break*/, 4];
            case 3:
                isLoading.value = false;
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Share scenario as URL" }, { class: "sm:max-w-xl" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Share scenario as URL" }, { class: "sm:max-w-xl" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.description;
    var __VLS_8 = DocLink_vue_1.default || DocLink_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        href: "https://docs.orbat-mapper.app/guide/sharing-scenarios",
    }));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
            href: "https://docs.orbat-mapper.app/guide/sharing-scenarios",
        }], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = __VLS_11.slots.default;
    // @ts-ignore
    [open,];
    var __VLS_11;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
alert_1.Alert;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19 = __VLS_17.slots.default;
var __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.TriangleAlertIcon} */
lucide_vue_next_1.TriangleAlertIcon;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
alert_1.AlertDescription;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_30 = __VLS_28.slots.default;
// @ts-ignore
[];
var __VLS_28;
// @ts-ignore
[];
var __VLS_17;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center py-4" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_31 = InputGroup_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign(__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.generatedUrl), label: "Sharable URL" }), { class: "grow" }), { readonly: true })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { modelValue: (__VLS_ctx.generatedUrl), label: "Sharable URL" }), { class: "grow" }), { readonly: true })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = void 0;
    var __VLS_37 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isLoading))
                    return;
                $event.target.select();
                // @ts-ignore
                [isLoading, generatedUrl,];
            } });
    /** @type {__VLS_StyleScopedClasses['grow']} */ ;
    var __VLS_34;
    var __VLS_35;
    var __VLS_38 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38(__assign({ 'onClick': {} }, { class: "mb-0.5" })));
    var __VLS_40 = __VLS_39.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "mb-0.5" })], __VLS_functionalComponentArgsRest(__VLS_39), false));
    var __VLS_43 = void 0;
    var __VLS_44 = ({ click: {} },
        { onClick: (__VLS_ctx.onCopy) });
    /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
    var __VLS_45 = __VLS_41.slots.default;
    (__VLS_ctx.copied ? "Copied!" : "Copy URL");
    var __VLS_46 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ClipboardCopyIcon} */
    lucide_vue_next_1.ClipboardCopyIcon;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ class: "" })));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_47), false));
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    // @ts-ignore
    [onCopy, copied,];
    var __VLS_41;
    var __VLS_42;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.generatedUrl.length);
    if (__VLS_ctx.urlWarning) {
        var __VLS_51 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
        alert_1.Alert;
        // @ts-ignore
        var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            variant: "destructive",
        }));
        var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
                variant: "destructive",
            }], __VLS_functionalComponentArgsRest(__VLS_52), false));
        var __VLS_56 = __VLS_54.slots.default;
        var __VLS_57 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TriangleAlertIcon} */
        lucide_vue_next_1.TriangleAlertIcon;
        // @ts-ignore
        var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign({ class: "size-4" })));
        var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        var __VLS_62 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
        alert_1.AlertDescription;
        // @ts-ignore
        var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
        var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_63), false));
        var __VLS_67 = __VLS_65.slots.default;
        (__VLS_ctx.urlWarning);
        // @ts-ignore
        [generatedUrl, urlWarning, urlWarning,];
        var __VLS_65;
        // @ts-ignore
        [];
        var __VLS_54;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
var __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ 'onClick': {} }, { variant: "secondary" })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "secondary" })], __VLS_functionalComponentArgsRest(__VLS_69), false));
var __VLS_73;
var __VLS_74 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.open = false;
            // @ts-ignore
            [open,];
        } });
var __VLS_75 = __VLS_71.slots.default;
// @ts-ignore
[];
var __VLS_71;
var __VLS_72;
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
