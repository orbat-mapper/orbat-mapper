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
var field_1 = require("@/components/ui/field");
var checkbox_1 = require("@/components/ui/checkbox");
var reka_ui_1 = require("reka-ui");
exports.default = {};
;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    inheritAttrs: false,
});
var __VLS_export = await (function () { return __awaiter(void 0, void 0, void 0, function () {
    var props, localValue, isArrayValue, _id, __VLS_modelEmit, __VLS_defaults, __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives, __VLS_0, __VLS_1, __VLS_2, __VLS_5, __VLS_6, __VLS_7, __VLS_8, __VLS_9, __VLS_12, __VLS_13, __VLS_14, __VLS_15, __VLS_10, __VLS_18, __VLS_19, __VLS_20, __VLS_23, __VLS_24, __VLS_25, __VLS_28, __VLS_29, __VLS_30, __VLS_31, __VLS_34, __VLS_35, __VLS_32, __VLS_37, __VLS_38, __VLS_39, __VLS_42, __VLS_43, __VLS_40, __VLS_26, __VLS_3, __VLS_36, __VLS_44, __VLS_base;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                props = withDefaults(defineProps(), {});
                localValue = defineModel({
                    required: false,
                });
                isArrayValue = (0, vue_1.computed)(function () { return Array.isArray(localValue.value); });
                _id = props.id || (0, vue_1.useId)();
                __VLS_defaults = {};
                __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "relative" }, { orientation: "horizontal" })));
                __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "relative" }, { orientation: "horizontal" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
                __VLS_5 = {};
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                __VLS_6 = __VLS_3.slots.default;
                if (__VLS_ctx.isArrayValue) {
                    __VLS_7 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.CheckboxGroupRoot | typeof __VLS_components.CheckboxGroupRoot} */
                    reka_ui_1.CheckboxGroupRoot;
                    __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                        modelValue: __VLS_ctx.localValue,
                    }));
                    __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
                            modelValue: __VLS_ctx.localValue,
                        }], __VLS_functionalComponentArgsRest(__VLS_8), false));
                    __VLS_12 = __VLS_10.slots.default;
                    __VLS_13 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.Checkbox} */
                    checkbox_1.Checkbox;
                    __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                        id: (__VLS_ctx._id),
                    }));
                    __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
                            id: (__VLS_ctx._id),
                        }], __VLS_functionalComponentArgsRest(__VLS_14), false));
                    (__VLS_ctx.$attrs);
                    // @ts-ignore
                    [isArrayValue, localValue, _id, $attrs,];
                }
                else {
                    __VLS_18 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.Checkbox} */
                    checkbox_1.Checkbox;
                    __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                        modelValue: __VLS_ctx.localValue,
                        id: (__VLS_ctx._id),
                    }));
                    __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
                            modelValue: __VLS_ctx.localValue,
                            id: (__VLS_ctx._id),
                        }], __VLS_functionalComponentArgsRest(__VLS_19), false));
                    (__VLS_ctx.$attrs);
                }
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
                __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_24), false));
                __VLS_28 = __VLS_26.slots.default;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    for: (__VLS_ctx._id),
                }));
                __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
                        for: (__VLS_ctx._id),
                    }], __VLS_functionalComponentArgsRest(__VLS_30), false));
                __VLS_34 = __VLS_32.slots.default;
                __VLS_35 = {};
                (__VLS_ctx.label);
                // @ts-ignore
                [localValue, _id, _id, $attrs, label,];
                if (__VLS_ctx.description || __VLS_ctx.$slots.description) {
                    __VLS_37 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
                    field_1.FieldDescription;
                    __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
                    __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_38), false));
                    __VLS_42 = __VLS_40.slots.default;
                    __VLS_43 = {};
                    (__VLS_ctx.description);
                    // @ts-ignore
                    [description, description, $slots,];
                }
                // @ts-ignore
                [];
                // @ts-ignore
                [];
                __VLS_36 = __VLS_35, __VLS_44 = __VLS_43;
                // @ts-ignore
                [];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('vue'); })];
            case 1:
                __VLS_base = (_a.sent()).defineComponent({
                    __typeEmits: {},
                    __defaults: __VLS_defaults,
                    __typeProps: {},
                });
                return [2 /*return*/, {}];
        }
    });
}); })();
