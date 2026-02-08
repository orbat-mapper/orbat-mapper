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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var files_1 = require("@/utils/files");
var AlertWarning_vue_1 = require("@/components/AlertWarning.vue");
var field_1 = require("@/components/ui/field");
var input_1 = require("@/components/ui/input");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var geo = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).geo;
var onImageLayerSelectHook = (0, utils_1.injectStrict)(injects_1.searchActionsKey).onImageLayerSelectHook;
var form = (0, vue_1.ref)({
    layerName: (0, files_1.stripFileExtension)(props.fileInfo.fileName),
});
var imageWidth = (0, vue_1.ref)(0);
var imageHeight = (0, vue_1.ref)(0);
var isBlob = (0, vue_1.computed)(function () {
    return props.objectUrl.startsWith("blob:");
});
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var newLayer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newLayer = geo.addMapLayer({
                        url: props.objectUrl,
                        name: form.value.layerName,
                        id: (0, utils_1.nanoid)(),
                        type: "ImageLayer",
                    });
                    return [4 /*yield*/, onImageLayerSelectHook.trigger({ layerId: newLayer.id })];
                case 1:
                    _a.sent();
                    emit("loaded");
                    return [2 /*return*/];
            }
        });
    });
}
function onCancel() {
    if (props.objectUrl) {
        URL.revokeObjectURL(props.objectUrl);
    }
    emit("cancel");
}
function onImageLoad(e) {
    var target = e.target;
    imageWidth.value = target.naturalWidth;
    imageHeight.value = target.naturalHeight;
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import Image",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import Image",
        helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
        hasSidebar: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.actions;
    var __VLS_8 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = void 0;
    var __VLS_14 = ({ click: {} },
        { onClick: (__VLS_ctx.onCancel) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_15 = __VLS_11.slots.default;
    // @ts-ignore
    [onCancel,];
    var __VLS_11;
    var __VLS_12;
    var __VLS_16 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ click: {} },
        { onClick: (__VLS_ctx.onLoad) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_23 = __VLS_19.slots.default;
    // @ts-ignore
    [onLoad,];
    var __VLS_19;
    var __VLS_20;
    // @ts-ignore
    [];
}
{
    var __VLS_24 = __VLS_3.slots.sidebar;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = __VLS_28.slots.default;
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        for: "layerName",
    }));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
            for: "layerName",
        }], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = __VLS_34.slots.default;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Input} */
    input_1.Input;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        id: "layerName",
        modelValue: (__VLS_ctx.form.layerName),
    }));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
            id: "layerName",
            modelValue: (__VLS_ctx.form.layerName),
        }], __VLS_functionalComponentArgsRest(__VLS_38), false));
    // @ts-ignore
    [form,];
    var __VLS_28;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 p-6" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
if (__VLS_ctx.isBlob) {
    var __VLS_42 = AlertWarning_vue_1.default || AlertWarning_vue_1.default;
    // @ts-ignore
    var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        title: "Warning",
    }));
    var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
            title: "Warning",
        }], __VLS_functionalComponentArgsRest(__VLS_43), false));
    var __VLS_47 = __VLS_45.slots.default;
    // @ts-ignore
    [isBlob,];
    var __VLS_45;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-auto overflow-auto p-0.5" }));
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ onLoad: (__VLS_ctx.onImageLoad) }, { src: (__VLS_ctx.objectUrl) }));
if (__VLS_ctx.imageWidth) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-2 text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.imageWidth);
    (__VLS_ctx.imageHeight);
}
// @ts-ignore
[onImageLoad, objectUrl, imageWidth, imageWidth, imageHeight,];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
