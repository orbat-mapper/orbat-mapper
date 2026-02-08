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
var OrbatGrid_vue_1 = require("@/modules/grid/OrbatGrid.vue");
var vue_1 = require("vue");
var scenariostore_1 = require("@/scenariostore");
var constants_1 = require("@/types/constants");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var data = (0, vue_1.ref)([]);
var sideMenuItems = [
    // { label: "Expand", action: SideActions.Expand },
    { label: "Edit", action: constants_1.SideActions.Edit },
    { label: "Add group", action: constants_1.SideActions.AddGroup },
    { label: "Delete side", action: constants_1.SideActions.Delete },
    { label: "Move up", action: constants_1.SideActions.MoveUp },
    { label: "Move down", action: constants_1.SideActions.MoveDown },
];
var columns = (0, vue_1.ref)([
    // { field: "id", label: "menu", type: "dots", width: 60, menu: sideMenuItems },
    { field: "sidc", label: "Icon", type: "sidc", width: 65, resizable: false },
    { field: "name", label: "Name", sortable: true },
    { field: "shortName", label: "Short name", sortable: true },
    { field: "externalUrl", label: "URL" },
    { field: "sideName", label: "Side", rowGroup: true, sortable: true },
    { field: "id", label: "id" },
    { field: "state.0.location", label: "p[0]" },
]);
var _a = (0, scenariostore_1.useScenario)(), scenario = _a.scenario, isReady = _a.isReady;
var selected = (0, vue_1.ref)([]);
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, unitMap, sideGroupMap, sideMap, unitData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, scenario.value.io.loadDemoScenario("falkland82")];
            case 1:
                _b.sent();
                _a = scenario.value.store.state, unitMap = _a.unitMap, sideGroupMap = _a.sideGroupMap, sideMap = _a.sideMap;
                unitData = [];
                Object.keys(sideMap).forEach(function (sideId) {
                    return scenario.value.unitActions.walkSide(sideId, function (unit, level, parent, sideGroup, side) {
                        unitData.push(__assign(__assign({}, unit), { sideId: side.id, sideName: side === null || side === void 0 ? void 0 : side.name }));
                    });
                });
                data.value = unitData;
                return [2 /*return*/];
        }
    });
}); });
function onAction(action, _a) {
    var data = _a.data, index = _a.index;
    console.log("on action", action, data, index);
}
function mutateData() {
    data.value.splice(10, 5);
    data.value = __spreadArray([], data.value, true);
    // data.value = data.value.slice().reverse();
}
var doSelect = (0, vue_1.ref)(true);
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "h-full pt-10 sm:p-10" }));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-10']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "fixed top-0 z-40 flex items-center gap-4 p-1" }));
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
var __VLS_0 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.doSelect),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.doSelect),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
// @ts-ignore
[doSelect,];
var __VLS_3;
if (__VLS_ctx.doSelect) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.selected.length);
}
var __VLS_6 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11;
var __VLS_12 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.mutateData();
            // @ts-ignore
            [doSelect, selected, mutateData,];
        } });
var __VLS_13 = __VLS_9.slots.default;
// @ts-ignore
[];
var __VLS_9;
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "h-full" }));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
var __VLS_14 = OrbatGrid_vue_1.default;
// @ts-ignore
var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign({ 'onAction': {} }, { data: (__VLS_ctx.data), columns: (__VLS_ctx.columns), select: (__VLS_ctx.doSelect), selected: (__VLS_ctx.selected) })));
var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { data: (__VLS_ctx.data), columns: (__VLS_ctx.columns), select: (__VLS_ctx.doSelect), selected: (__VLS_ctx.selected) })], __VLS_functionalComponentArgsRest(__VLS_15), false));
var __VLS_19;
var __VLS_20 = ({ action: {} },
    { onAction: (__VLS_ctx.onAction) });
var __VLS_17;
var __VLS_18;
// @ts-ignore
[doSelect, selected, data, columns, onAction,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
