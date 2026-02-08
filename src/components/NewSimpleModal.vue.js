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
var uiStore_1 = require("@/stores/uiStore");
var dialog_1 = require("@/components/ui/dialog");
var utils_ts_1 = require("@/lib/utils.ts");
var props = defineProps();
var open = defineModel({ default: false });
var emit = defineEmits(["update:modelValue", "cancel"]);
var DialogContent_vue_1 = require("./ui/dialog/DialogContent.vue");
var uiStore = (0, uiStore_1.useUiStore)();
(0, vue_1.onMounted)(function () { return (uiStore.modalOpen = open.value); });
(0, vue_1.watch)(open, function (v) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        uiStore.modalOpen = v;
        return [2 /*return*/];
    });
}); });
(0, vue_1.onUnmounted)(function () { return (uiStore.modalOpen = false); });
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
dialog_1.Dialog;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onUpdate:open': {} }, { open: (__VLS_ctx.open) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onUpdate:open': {} }, { open: (__VLS_ctx.open) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ 'update:open': {} },
    { 'onUpdate:open': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [open, emit,];
        } });
var __VLS_7 = {};
var __VLS_8 = __VLS_3.slots.default;
var __VLS_9 = (__VLS_ctx.fixedHeight ? DialogContent_vue_1.default : __VLS_ctx.DialogScrollContent);
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign({ class: (__VLS_ctx.cn('min-h-0 max-w-[calc(100%-1rem)] rounded sm:max-w-lg', props.class)) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.cn('min-h-0 max-w-[calc(100%-1rem)] rounded sm:max-w-lg', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = __VLS_12.slots.default;
if (__VLS_ctx.dialogTitle || __VLS_ctx.$slots.description) {
    var __VLS_15 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogHeader | typeof __VLS_components.DialogHeader} */
    dialog_1.DialogHeader;
    // @ts-ignore
    var __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
    var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_16), false));
    var __VLS_20 = __VLS_18.slots.default;
    var __VLS_21 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DialogTitle | typeof __VLS_components.DialogTitle} */
    dialog_1.DialogTitle;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({}));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
    var __VLS_26 = __VLS_24.slots.default;
    (__VLS_ctx.dialogTitle);
    // @ts-ignore
    [fixedHeight, dialog_1.DialogScrollContent, utils_ts_1.cn, dialogTitle, dialogTitle, $slots,];
    var __VLS_24;
    if (__VLS_ctx.dialogTitle || __VLS_ctx.$slots.description) {
        var __VLS_27 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.DialogDescription | typeof __VLS_components.DialogDescription} */
        dialog_1.DialogDescription;
        // @ts-ignore
        var __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({}));
        var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_28), false));
        var __VLS_32 = __VLS_30.slots.default;
        var __VLS_33 = {};
        (__VLS_ctx.description);
        // @ts-ignore
        [dialogTitle, $slots, description,];
        var __VLS_30;
    }
    // @ts-ignore
    [];
    var __VLS_18;
}
var __VLS_35 = {};
// @ts-ignore
[];
var __VLS_12;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
var __VLS_34 = __VLS_33, __VLS_36 = __VLS_35;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
