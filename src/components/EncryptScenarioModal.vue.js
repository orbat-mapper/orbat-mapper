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
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var vue_1 = require("vue");
var injects_1 = require("@/components/injects");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var button_1 = require("@/components/ui/button");
var crypto_1 = require("@/utils/crypto");
var files_1 = require("@/utils/files");
var notifications_1 = require("@/composables/notifications");
var open = defineModel({ default: false });
var activeScenario = (0, vue_1.inject)(injects_1.activeScenarioKey);
var io = activeScenario.io;
var send = (0, notifications_1.useNotifications)().send;
var password = (0, vue_1.ref)("");
var description = (0, vue_1.ref)("");
var showPassword = (0, vue_1.ref)(false);
var isEncrypting = (0, vue_1.ref)(false);
function onDownload() {
    return __awaiter(this, void 0, void 0, function () {
        var scenario, encrypted, filenamify, filename, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!password.value)
                        return [2 /*return*/];
                    isEncrypting.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    scenario = io.serializeToObject();
                    return [4 /*yield*/, (0, crypto_1.encryptScenario)(scenario, password.value, {
                            header: { description: description.value },
                        })];
                case 2:
                    encrypted = _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("filenamify/browser"); })];
                case 3:
                    filenamify = (_a.sent()).default;
                    filename = filenamify(scenario.name || "scenario");
                    return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(new Blob([JSON.stringify(encrypted, null, 2)], {
                            type: "application/json",
                        }), "".concat(filename, ".json"))];
                case 4:
                    _a.sent();
                    send({ message: "Encrypted scenario downloaded" });
                    open.value = false;
                    password.value = "";
                    return [3 /*break*/, 7];
                case 5:
                    e_1 = _a.sent();
                    console.error(e_1);
                    send({ message: "Failed to encrypt scenario" });
                    return [3 /*break*/, 7];
                case 6:
                    isEncrypting.value = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Download encrypted scenario" }, { class: "sm:max-w-md" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Download encrypted scenario" }, { class: "sm:max-w-md" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['sm:max-w-md']} */ ;
var __VLS_6 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onDownload) }, { class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_7 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    modelValue: (__VLS_ctx.password),
    label: "Password",
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    autofocus: true,
    placeholder: "Enter password",
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.password),
        label: "Password",
        type: (__VLS_ctx.showPassword ? 'text' : 'password'),
        autofocus: true,
        placeholder: "Enter password",
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = InputCheckbox_vue_1.default;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.showPassword),
    label: "Show password",
}));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showPassword),
        label: "Show password",
    }], __VLS_functionalComponentArgsRest(__VLS_13), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_17 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    modelValue: (__VLS_ctx.description),
    label: "Description (optional)",
    placeholder: "Description",
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.description),
        label: "Description (optional)",
        placeholder: "Description",
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-1 text-xs text-yellow-600 dark:text-yellow-500" }));
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-yellow-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2 pt-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
var __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onClick': {} }, { variant: "ghost", type: "button" })));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", type: "button" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27;
var __VLS_28 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.open = false;
            // @ts-ignore
            [open, open, onDownload, password, showPassword, showPassword, description,];
        } });
var __VLS_29 = __VLS_25.slots.default;
// @ts-ignore
[];
var __VLS_25;
var __VLS_26;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    type: "submit",
    disabled: (!__VLS_ctx.password || __VLS_ctx.isEncrypting),
}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
        type: "submit",
        disabled: (!__VLS_ctx.password || __VLS_ctx.isEncrypting),
    }], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
(__VLS_ctx.isEncrypting ? "Encrypting..." : "Download Encrypted");
// @ts-ignore
[password, isEncrypting, isEncrypting,];
var __VLS_33;
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
