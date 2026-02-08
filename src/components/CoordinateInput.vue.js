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
var lucide_vue_next_1 = require("lucide-vue-next");
var mgrsLib = require("mgrs");
var utils_1 = require("@/geo/utils");
var utils_2 = require("@/utils");
var utils_3 = require("@/lib/utils");
exports.default = {};
var __VLS_export = await (function () { return __awaiter(void 0, void 0, void 0, function () {
    function convertToLocalValue(v) {
        if (!v)
            return "";
        if (inputFormat.value === "MGRS") {
            return mgrsLib.forward(v, 5);
        }
        else {
            var _a = (0, utils_1.truncatePosition)(v), lon = _a[0], lat = _a[1];
            if (inputFormat.value === "LatLon") {
                return "".concat(lat, ",").concat(lon);
            }
            else {
                return "".concat(lon, ",").concat(lat);
            }
        }
    }
    function onOuterBlur(e) {
        if (e.relatedTarget !== inputRef.value && e.relatedTarget !== selectRef.value) {
            emit("outBlur", e);
        }
    }
    var props, emit, modelValue, inputFormat, inputRef, selectRef, isInvalid, localValue, isInternal, __VLS_modelEmit, __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives, __VLS_0, __VLS_1, __VLS_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                defineOptions({
                    inheritAttrs: false,
                });
                props = defineProps();
                emit = defineEmits();
                modelValue = defineModel({ required: true });
                inputFormat = (0, vue_1.ref)((_a = props.format) !== null && _a !== void 0 ? _a : "LonLat");
                inputRef = (0, vue_1.ref)(null);
                selectRef = (0, vue_1.ref)(null);
                isInvalid = (0, vue_1.ref)();
                localValue = (0, vue_1.ref)(convertToLocalValue(modelValue.value));
                isInternal = false;
                (0, vue_1.watch)(modelValue, function (v) {
                    if (isInternal) {
                        isInternal = false;
                        return;
                    }
                    localValue.value = convertToLocalValue(v);
                });
                (0, vue_1.watch)([localValue, inputFormat], function (_a, _b) {
                    var _c;
                    var v = _a[0], inpFormat = _a[1];
                    var _oldV = _b[0], oldInpFormat = _b[1];
                    if (isInternal) {
                        isInternal = false;
                        return;
                    }
                    if (inpFormat !== oldInpFormat) {
                        isInternal = true;
                        isInvalid.value = undefined;
                        emit("update:format", inpFormat);
                        localValue.value = convertToLocalValue(modelValue.value);
                        return;
                    }
                    var lon, lat = 0;
                    if (inputFormat.value === "MGRS") {
                        try {
                            _c = (0, utils_1.truncatePosition)(mgrsLib.toPoint(v)), lon = _c[0], lat = _c[1];
                        }
                        catch (error) {
                            isInvalid.value = true;
                            console.error("Invalid MGRS input", (0, utils_2.getErrorMessage)(error));
                            return;
                        }
                    }
                    else {
                        try {
                            var _d = (0, utils_1.parseCoordinates)(v), first = _d[0], second = _d[1];
                            if (inputFormat.value === "LatLon") {
                                lat = first;
                                lon = second;
                            }
                            else {
                                lon = first;
                                lat = second;
                            }
                        }
                        catch (error) {
                            isInvalid.value = true;
                            console.error("Invalid LatLon input", (0, utils_2.getErrorMessage)(error));
                            return;
                        }
                    }
                    isInternal = true;
                    isInvalid.value = undefined;
                    modelValue.value = [lon, lat];
                });
                (0, vue_1.onMounted)(function () {
                    var _a;
                    if (props.autofocus) {
                        (_a = inputRef.value) === null || _a === void 0 ? void 0 : _a.focus();
                    }
                });
                __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onBlur: (__VLS_ctx.onOuterBlur) }, { class: (__VLS_ctx.outerClass) }));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative rounded-sm shadow-xs" }));
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-xs']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" }));
                /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
                /** @ts-ignore @type {typeof __VLS_components.MapPin} */
                lucide_vue_next_1.MapPin;
                __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "text-muted-foreground h-4 w-4" }, { 'aria-hidden': "true" })));
                __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground h-4 w-4" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ type: "text", ref: "inputRef" }, { class: (__VLS_ctx.cn('text-foreground bg-input ring-input placeholder:text-muted-foreground focus:ring-ring data-invalid:bg-destructive/20 block w-full rounded-md border-0 py-1.5 pr-24 pl-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6', props.class)) }), { 'data-invalid': (__VLS_ctx.isInvalid), value: (__VLS_ctx.localValue) }));
                (__VLS_ctx.$attrs);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute inset-y-0 right-0 flex items-center" }));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "coordinate-format" }, { class: "sr-only" }));
                /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)(__assign(__assign({ id: "coordinate-format" }, { class: "text-muted-foreground focus:ring-ring h-full rounded-md border-0 bg-transparent py-0 pr-7 pl-2 focus:ring-2 focus:ring-inset sm:text-sm" }), { value: (__VLS_ctx.inputFormat), ref: "selectRef" }));
                /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['pr-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:ring-inset']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "LatLon",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "LonLat",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "MGRS",
                });
                // @ts-ignore
                [onOuterBlur, outerClass, utils_3.cn, isInvalid, localValue, $attrs, inputFormat,];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('vue'); })];
            case 1: return [2 /*return*/, (_b.sent()).defineComponent({
                    __typeEmits: {},
                    __typeProps: {},
                })];
        }
    });
}); })();
