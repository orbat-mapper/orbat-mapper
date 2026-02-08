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
var ScenarioEditor_vue_1 = require("@/modules/scenarioeditor/ScenarioEditor.vue");
var scenariostore_1 = require("@/scenariostore");
var vue_router_1 = require("vue-router");
var vue_1 = require("vue");
var selectedStore_1 = require("@/stores/selectedStore");
var localdb_1 = require("@/scenariostore/localdb");
var core_1 = require("@vueuse/core");
var ScenarioNotFoundPage_vue_1 = require("@/modules/scenarioeditor/ScenarioNotFoundPage.vue");
var props = defineProps();
var _a = (0, scenariostore_1.useScenario)(), scenario = _a.scenario, isReady = _a.isReady;
var localReady = (0, vue_1.ref)(false);
var scenarioNotFound = (0, vue_1.ref)(false);
var currentDemo = "";
var selectedItems = (0, selectedStore_1.useSelectedItems)();
(0, vue_1.watch)(function () { return props.scenarioId; }, function (newScenarioId) { return __awaiter(void 0, void 0, void 0, function () {
    var demoId, loadScenario, idbscenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isDemoScenario(newScenarioId)) return [3 /*break*/, 3];
                demoId = newScenarioId.replace("demo-", "");
                if (!(demoId !== currentDemo)) return [3 /*break*/, 2];
                return [4 /*yield*/, scenario.value.io.loadDemoScenario(demoId)];
            case 1:
                _a.sent();
                selectedItems.clear();
                selectedItems.showScenarioInfo.value = true;
                _a.label = 2;
            case 2:
                localReady.value = true;
                return [3 /*break*/, 6];
            case 3: return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
            case 4:
                loadScenario = (_a.sent()).loadScenario;
                return [4 /*yield*/, loadScenario(newScenarioId)];
            case 5:
                idbscenario = _a.sent();
                if (idbscenario) {
                    scenario.value.io.loadFromObject(idbscenario);
                    selectedItems.clear();
                    selectedItems.showScenarioInfo.value = true;
                }
                else {
                    scenarioNotFound.value = true;
                    console.error("Scenario not found in indexeddb");
                }
                localReady.value = true;
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); }, { immediate: true });
function isDemoScenario(scenarioId) {
    return scenarioId.startsWith("demo-");
}
(0, vue_router_1.onBeforeRouteLeave)(function (to, from) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, saveScenarioIfNecessary({ saveDemo: true })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, core_1.useEventListener)(document, "visibilitychange", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, saveScenarioIfNecessary()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, core_1.useEventListener)(window, "beforeunload", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, saveScenarioIfNecessary()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
function saveScenarioIfNecessary() {
    return __awaiter(this, arguments, void 0, function (_a) {
        var _b, _c, _d;
        var _e = _a === void 0 ? {} : _a, _f = _e.saveDemo, saveDemo = _f === void 0 ? false : _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!((_d = (_c = (_b = scenario.value) === null || _b === void 0 ? void 0 : _b.store) === null || _c === void 0 ? void 0 : _c.canUndo) === null || _d === void 0 ? void 0 : _d.value)) return [3 /*break*/, 2];
                    if (isDemoScenario(props.scenarioId)) {
                        if (!saveDemo) {
                            return [2 /*return*/];
                        }
                        if (!window.confirm("You have made changes to a demo scenario. Do you want to save a copy?")) {
                            return [2 /*return*/];
                        }
                    }
                    return [4 /*yield*/, scenario.value.io.saveToIndexedDb()];
                case 1:
                    _g.sent();
                    _g.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
if (__VLS_ctx.localReady && __VLS_ctx.isReady) {
    var __VLS_0 = ScenarioEditor_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        key: (__VLS_ctx.scenario.store.state.id),
        activeScenario: (__VLS_ctx.scenario),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            key: (__VLS_ctx.scenario.store.state.id),
            activeScenario: (__VLS_ctx.scenario),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = {};
    var __VLS_3;
}
else if (__VLS_ctx.scenarioNotFound) {
    var __VLS_6 = ScenarioNotFoundPage_vue_1.default;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = {};
    var __VLS_9;
}
// @ts-ignore
[localReady, isReady, scenario, scenario, scenarioNotFound,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
