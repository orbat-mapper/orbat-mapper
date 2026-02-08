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
var forms_1 = require("@/composables/forms");
var klona_1 = require("klona");
var field_1 = require("@/components/ui/field");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/utils");
var injects_ts_1 = require("@/components/injects.ts");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var props = withDefaults(defineProps(), {
    heading: "Add new item",
});
var modelValue = defineModel();
var emit = defineEmits();
var getModalSidc = (0, utils_1.injectStrict)(injects_ts_1.sidcModalKey).getModalSidc;
var _a = (0, forms_1.useForm)({
    name: "",
    src: "",
    sidc: "10031000001100000000",
}, modelValue), form = _a.form, handleSubmit = _a.handleSubmit;
function onSubmit(e) {
    // prevent double form submission with ctrl/meta+enter
    if (e instanceof KeyboardEvent && e.target instanceof HTMLInputElement) {
        return;
    }
    handleSubmit();
    emit("submit", (0, klona_1.klona)(form.value));
}
function openSymbolPicker() {
    return __awaiter(this, void 0, void 0, function () {
        var newSidcValue, sidc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getModalSidc(form.value.sidc, {
                        hideSymbolColor: true,
                        hideCustomSymbols: true,
                        symbolOptions: { fillColor: "#f7f7f7" },
                    })];
                case 1:
                    newSidcValue = _a.sent();
                    if (newSidcValue) {
                        sidc = newSidcValue.sidc;
                        form.value.sidc = sidc;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var __VLS_modelEmit;
var __VLS_defaults = {
    heading: "Add new item",
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign(__assign({ onSubmit: (__VLS_ctx.onSubmit) }, { onKeyup: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('cancel');
        // @ts-ignore
        [onSubmit, emit,];
    } }), { onKeyup: (__VLS_ctx.onSubmit) }), { onKeyup: (__VLS_ctx.onSubmit) }));
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.FieldGroup | typeof __VLS_components.FieldGroup} */
field_1.FieldGroup;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "mb-4" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "mb-4" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
field_1.FieldSet;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11 = __VLS_9.slots.default;
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.FieldLegend | typeof __VLS_components.FieldLegend} */
field_1.FieldLegend;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_17 = __VLS_15.slots.default;
// @ts-ignore
[onSubmit, onSubmit,];
var __VLS_15;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.FieldGroup | typeof __VLS_components.FieldGroup} */
field_1.FieldGroup;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_23 = __VLS_21.slots.default;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_29 = __VLS_27.slots.default;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
field_1.FieldLabel;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    for: "symbol-name",
}));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{
        for: "symbol-name",
    }], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35 = __VLS_33.slots.default;
// @ts-ignore
[];
var __VLS_33;
var __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    id: "symbol-name",
    required: true,
    modelValue: (__VLS_ctx.form.name),
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        id: "symbol-name",
        required: true,
        modelValue: (__VLS_ctx.form.name),
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
// @ts-ignore
[form,];
var __VLS_27;
// @ts-ignore
[];
var __VLS_21;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = __VLS_44.slots.default;
var __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
field_1.FieldLabel;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    for: "uri",
}));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{
        for: "uri",
    }], __VLS_functionalComponentArgsRest(__VLS_48), false));
var __VLS_52 = __VLS_50.slots.default;
// @ts-ignore
[];
var __VLS_50;
var __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.Textarea} */
textarea_1.Textarea;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ id: "uri", modelValue: (__VLS_ctx.form.src), required: true, placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", rows: (2) }, { class: "h-16 wrap-anywhere" })));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ id: "uri", modelValue: (__VLS_ctx.form.src), required: true, placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", rows: (2) }, { class: "h-16 wrap-anywhere" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap-anywhere']} */ ;
var __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
field_1.FieldDescription;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_59), false));
var __VLS_63 = __VLS_61.slots.default;
// @ts-ignore
[form,];
var __VLS_61;
// @ts-ignore
[];
var __VLS_44;
var __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_69 = __VLS_67.slots.default;
var __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
field_1.FieldLabel;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    for: "symbol-sidc",
}));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([{
        for: "symbol-sidc",
    }], __VLS_functionalComponentArgsRest(__VLS_71), false));
var __VLS_75 = __VLS_73.slots.default;
// @ts-ignore
[];
var __VLS_73;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var __VLS_76 = NewMilitarySymbol_vue_1.default;
// @ts-ignore
var __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    sidc: (__VLS_ctx.form.sidc),
    size: (32),
    options: ({ fillColor: '#f7f7f7' }),
}));
var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([{
        sidc: (__VLS_ctx.form.sidc),
        size: (32),
        options: ({ fillColor: '#f7f7f7' }),
    }], __VLS_functionalComponentArgsRest(__VLS_77), false));
var __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.Input} */
input_1.Input;
// @ts-ignore
var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    id: "symbol-sidc",
    modelValue: (__VLS_ctx.form.sidc),
    required: true,
}));
var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{
        id: "symbol-sidc",
        modelValue: (__VLS_ctx.form.sidc),
        required: true,
    }], __VLS_functionalComponentArgsRest(__VLS_82), false));
var __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86(__assign({ 'onClick': {} }, { type: "button", variant: "outline" })));
var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "outline" })], __VLS_functionalComponentArgsRest(__VLS_87), false));
var __VLS_91;
var __VLS_92 = ({ click: {} },
    { onClick: (__VLS_ctx.openSymbolPicker) });
var __VLS_93 = __VLS_89.slots.default;
// @ts-ignore
[form, form, openSymbolPicker,];
var __VLS_89;
var __VLS_90;
var __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
field_1.FieldDescription;
// @ts-ignore
var __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({}));
var __VLS_96 = __VLS_95.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_95), false));
var __VLS_99 = __VLS_97.slots.default;
// @ts-ignore
[];
var __VLS_97;
// @ts-ignore
[];
var __VLS_67;
// @ts-ignore
[];
var __VLS_9;
var __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
field_1.Field;
// @ts-ignore
var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    orientation: "horizontal",
}));
var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([{
        orientation: "horizontal",
    }], __VLS_functionalComponentArgsRest(__VLS_101), false));
var __VLS_105 = __VLS_103.slots.default;
var __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    type: "submit",
}));
var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([{
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_107), false));
var __VLS_111 = __VLS_109.slots.default;
// @ts-ignore
[];
var __VLS_109;
var __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112(__assign({ 'onClick': {} }, { variant: "outline", type: "button" })));
var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", type: "button" })], __VLS_functionalComponentArgsRest(__VLS_113), false));
var __VLS_117;
var __VLS_118 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.emit('cancel');
            // @ts-ignore
            [emit,];
        } });
var __VLS_119 = __VLS_115.slots.default;
// @ts-ignore
[];
var __VLS_115;
var __VLS_116;
// @ts-ignore
[];
var __VLS_103;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
