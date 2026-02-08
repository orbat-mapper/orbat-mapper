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
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var helpers_1 = require("@/components/helpers");
var sidc_1 = require("@/symbology/sidc");
var scenarioUtils_ts_1 = require("@/composables/scenarioUtils.ts");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, scnStore = _a.store;
var _b = (0, scenarioUtils_ts_1.useRootUnits)(), rootUnitItems = _b.rootUnitItems, groupedRootUnitItems = _b.groupedRootUnitItems;
var parentUnitId = (0, vue_1.ref)(rootUnitItems.value[0].code);
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var side, oob, parentMap;
        return __generator(this, function (_a) {
            side = unitActions.getUnitHierarchy(parentUnitId.value).side;
            oob = (0, utils_1.sortBy)(props.data.map(function (u) {
                var sidc = u[0], level = u[1], xPosition = u[2], name = u[3], subTitle = u[4], color = u[5];
                return {
                    sidc: sidc,
                    level: level,
                    xPosition: xPosition,
                    name: name,
                    subTitle: subTitle,
                    color: color,
                    sortKey: level + xPosition,
                };
            }), "sortKey");
            parentMap = {};
            scnStore.groupUpdate(function () {
                oob.forEach(function (u) {
                    var sidc = u.sidc, xPosition = u.xPosition, name = u.name, description = u.subTitle, color = u.color, sortKey = u.sortKey;
                    var newUnit = {
                        name: name,
                        description: description,
                        sidc: (0, helpers_1.setCharAt)(sidc, sidc_1.SID_INDEX, side.standardIdentity),
                        symbolOptions: { fillColor: color },
                        subUnits: [],
                        equipment: [],
                        personnel: [],
                    };
                    var parentSortKey = "1".concat(xPosition);
                    var newUnitId = unitActions.addUnit(newUnit, parentMap[parentSortKey] || parentMap["00"] || parentUnitId.value);
                    parentMap[sortKey] = newUnitId;
                });
            });
            emit("loaded");
            return [2 /*return*/];
        });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import from Orbat Generator",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import from Orbat Generator",
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
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_15 = __VLS_11.slots.default;
    // @ts-ignore
    [];
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
    var __VLS_25 = SymbolCodeSelect_vue_1.default;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        label: "Parent unit",
        items: (__VLS_ctx.rootUnitItems),
        groups: (__VLS_ctx.groupedRootUnitItems),
        modelValue: (__VLS_ctx.parentUnitId),
    }));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
            label: "Parent unit",
            items: (__VLS_ctx.rootUnitItems),
            groups: (__VLS_ctx.groupedRootUnitItems),
            modelValue: (__VLS_ctx.parentUnitId),
        }], __VLS_functionalComponentArgsRest(__VLS_26), false));
    // @ts-ignore
    [rootUnitItems, groupedRootUnitItems, parentUnitId,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "p-6" }));
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://www.orbatgenerator.com/", target: "_blank" }, { class: "text-accent-foreground underline" }));
/** @type {__VLS_StyleScopedClasses['text-accent-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
