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
var vue_router_1 = require("vue-router");
var scenarioShare_1 = require("@/composables/scenarioShare");
var localdb_1 = require("@/scenariostore/localdb");
var names_1 = require("@/router/names");
var utils_1 = require("@/utils");
var DecryptScenarioModal_vue_1 = require("@/components/DecryptScenarioModal.vue");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var lucide_vue_next_1 = require("lucide-vue-next");
var components_1 = require("@vueuse/components");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var separator_1 = require("@/components/ui/separator");
var route = (0, vue_router_1.useRoute)();
var router = (0, vue_router_1.useRouter)();
var loadScenarioFromUrlParam = (0, scenarioShare_1.useScenarioShare)().loadScenarioFromUrlParam;
var isLoading = (0, vue_1.ref)(true);
var error = (0, vue_1.ref)(null);
var scenarioData = (0, vue_1.ref)(null);
var hasConflict = (0, vue_1.ref)(false);
var isWaitingForDownload = (0, vue_1.ref)(false);
var showDecryptModal = (0, vue_1.ref)(false);
var currentEncryptedScenario = (0, vue_1.ref)(null);
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var dataParam, idParam;
    return __generator(this, function (_a) {
        dataParam = route.query.data;
        idParam = route.query.id;
        if (!dataParam && !idParam) {
            error.value = "No scenario data provided in the URL.";
            isLoading.value = false;
            return [2 /*return*/];
        }
        isWaitingForDownload.value = true;
        isLoading.value = false;
        return [2 /*return*/];
    });
}); });
function handleDownload() {
    return __awaiter(this, void 0, void 0, function () {
        var dataParam, idParam, loadedScenario, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isWaitingForDownload.value = false;
                    isLoading.value = true;
                    dataParam = route.query.data;
                    idParam = route.query.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    loadedScenario = void 0;
                    if (!idParam) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("/share?id=".concat(idParam))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 404)
                            throw new Error("Scenario not found.");
                        throw new Error("Failed to load scenario.");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    loadedScenario = _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, loadScenarioFromUrlParam(dataParam)];
                case 5:
                    loadedScenario = _a.sent();
                    _a.label = 6;
                case 6:
                    if (loadedScenario.type === "ORBAT-mapper-encrypted") {
                        isLoading.value = false;
                        currentEncryptedScenario.value = loadedScenario;
                        showDecryptModal.value = true;
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, processLoadedScenario(loadedScenario)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    e_1 = _a.sent();
                    console.error("Failed to load scenario", e_1);
                    error.value =
                        e_1.message || "Failed to decode the scenario. The URL may be corrupted or invalid.";
                    return [3 /*break*/, 10];
                case 9:
                    if (!showDecryptModal.value) {
                        isLoading.value = false;
                    }
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function processLoadedScenario(scenario) {
    return __awaiter(this, void 0, void 0, function () {
        var getScenarioInfo, existingInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scenarioData.value = scenario;
                    if (!(scenarioData.value && scenarioData.value.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    getScenarioInfo = (_a.sent()).getScenarioInfo;
                    return [4 /*yield*/, getScenarioInfo(scenarioData.value.id)];
                case 2:
                    existingInfo = _a.sent();
                    hasConflict.value = !!existingInfo;
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function onDecrypted(scenario) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processLoadedScenario(scenario)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var scenarioName = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = scenarioData.value) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unnamed Scenario"; });
var scenarioDescription = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = scenarioData.value) === null || _a === void 0 ? void 0 : _a.description) !== null && _b !== void 0 ? _b : ""; });
var unitCount = (0, vue_1.computed)(function () {
    if (!scenarioData.value)
        return 0;
    var count = 0;
    function countUnits(units) {
        if (!units)
            return 0;
        return units.reduce(function (acc, unit) { return acc + 1 + countUnits(unit.subUnits); }, 0);
    }
    scenarioData.value.sides.forEach(function (side) {
        count += countUnits(side.subUnits);
        side.groups.forEach(function (group) {
            count += countUnits(group.subUnits);
        });
    });
    return count;
});
var sideCount = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = scenarioData.value) === null || _a === void 0 ? void 0 : _a.sides.length) !== null && _b !== void 0 ? _b : 0; });
var createdDate = (0, vue_1.computed)(function () {
    var _a, _b;
    var date = (_b = (_a = scenarioData.value) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.createdDate;
    return date ? new Date(date) : null;
});
var lastModifiedDate = (0, vue_1.computed)(function () {
    var _a, _b;
    var date = (_b = (_a = scenarioData.value) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.lastModifiedDate;
    return date ? new Date(date) : null;
});
var formatDate = function (date) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};
function handleCancel() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, router.push({ name: names_1.LANDING_PAGE_ROUTE })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var addScenario, plainScenario, scenarioId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scenarioData.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    addScenario = (_a.sent()).addScenario;
                    plainScenario = (0, vue_1.toRaw)(scenarioData.value);
                    return [4 /*yield*/, addScenario(plainScenario)];
                case 2:
                    scenarioId = _a.sent();
                    return [4 /*yield*/, router.replace({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleOverwrite() {
    return __awaiter(this, void 0, void 0, function () {
        var putScenario, plainScenario, scenarioWithId, scenarioId;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!scenarioData.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    putScenario = (_b.sent()).putScenario;
                    plainScenario = (0, vue_1.toRaw)(scenarioData.value);
                    scenarioWithId = __assign(__assign({}, plainScenario), { id: (_a = plainScenario.id) !== null && _a !== void 0 ? _a : (0, utils_1.nanoid)() });
                    return [4 /*yield*/, putScenario(scenarioWithId)];
                case 2:
                    scenarioId = _b.sent();
                    return [4 /*yield*/, router.replace({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleCreateCopy() {
    return __awaiter(this, void 0, void 0, function () {
        var addScenario, plainScenario, newId, scenarioCopy, scenarioId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scenarioData.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    addScenario = (_a.sent()).addScenario;
                    plainScenario = (0, vue_1.toRaw)(scenarioData.value);
                    newId = (0, utils_1.nanoid)();
                    scenarioCopy = __assign(__assign({}, plainScenario), { id: newId, name: "".concat(plainScenario.name, " (copy)") });
                    return [4 /*yield*/, addScenario(scenarioCopy, newId)];
                case 2:
                    scenarioId = _a.sent();
                    return [4 /*yield*/, router.replace({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex min-h-screen flex-col items-center" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "bg-muted relative top-0 right-0 left-0 flex w-full items-center justify-center gap-8 p-1 text-center" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://github.com/orbat-mapper/orbat-mapper" }, { class: "underline" }));
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.GithubIcon} */
vue_mdi_1.IconGithub;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "inline size-6 sm:size-8" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "inline size-6 sm:size-8" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:size-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign(__assign({ href: "https://docs.orbat-mapper.app" }, { class: "underline" }), { target: "_blank" }));
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
var __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.ExternalLinkIcon} */
lucide_vue_next_1.ExternalLinkIcon;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "inline size-4" })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "inline size-4" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
var __VLS_10;
/** @ts-ignore @type {typeof __VLS_components.UseDark | typeof __VLS_components.UseDark} */
components_1.UseDark;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_11), false));
{
    var __VLS_15 = __VLS_13.slots.default;
    var _a = __VLS_vSlot(__VLS_15)[0], isDark = _a.isDark, toggleDark_1 = _a.toggleDark;
    var __VLS_16 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                toggleDark_1();
            } });
    var __VLS_23 = __VLS_19.slots.default;
    if (isDark) {
        var __VLS_24 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
        lucide_vue_next_1.SunIcon;
        // @ts-ignore
        var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
        var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
    }
    else {
        var __VLS_29 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.MoonStarIcon} */
        lucide_vue_next_1.MoonStarIcon;
        // @ts-ignore
        var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({}));
        var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_30), false));
    }
    var __VLS_19;
    var __VLS_20;
    __VLS_13.slots['' /* empty slot name completion */];
}
var __VLS_13;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mb-8 text-center" }));
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)(__assign({ class: "text-heading text-4xl font-bold tracking-tight" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-900 dark:text-red-900/90" }));
/** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-red-900/90']} */ ;
var __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.Card | typeof __VLS_components.Card} */
card_1.Card;
// @ts-ignore
var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34(__assign({ class: "w-full" })));
var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_35), false));
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_39 = __VLS_37.slots.default;
var __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.CardHeader | typeof __VLS_components.CardHeader} */
card_1.CardHeader;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({}));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_45 = __VLS_43.slots.default;
var __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.CardTitle | typeof __VLS_components.CardTitle} */
card_1.CardTitle;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46(__assign({ class: "text-2xl" })));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([__assign({ class: "text-2xl" })], __VLS_functionalComponentArgsRest(__VLS_47), false));
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
var __VLS_51 = __VLS_49.slots.default;
var __VLS_49;
var __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.CardDescription | typeof __VLS_components.CardDescription} */
card_1.CardDescription;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({}));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_53), false));
var __VLS_57 = __VLS_55.slots.default;
var __VLS_55;
var __VLS_43;
var __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.CardContent | typeof __VLS_components.CardContent} */
card_1.CardContent;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign({ class: "space-y-6" })));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ class: "space-y-6" })], __VLS_functionalComponentArgsRest(__VLS_59), false));
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
var __VLS_63 = __VLS_61.slots.default;
if (__VLS_ctx.isWaitingForDownload) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col items-center gap-4 py-8 text-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted rounded-full p-4" }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    var __VLS_64 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DownloadIcon} */
    lucide_vue_next_1.Download;
    // @ts-ignore
    var __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64(__assign({ class: "text-primary size-8" })));
    var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign({ class: "text-primary size-8" })], __VLS_functionalComponentArgsRest(__VLS_65), false));
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-lg font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var __VLS_69 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69(__assign({ 'onClick': {} })));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_70), false));
    var __VLS_74 = void 0;
    var __VLS_75 = ({ click: {} },
        { onClick: (__VLS_ctx.handleDownload) });
    var __VLS_76 = __VLS_72.slots.default;
    // @ts-ignore
    [isWaitingForDownload, handleDownload,];
    var __VLS_72;
    var __VLS_73;
}
else if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col items-center gap-4 py-8" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    var __VLS_77 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.LoaderCircleIcon} */
    lucide_vue_next_1.LoaderCircleIcon;
    // @ts-ignore
    var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77(__assign({ class: "text-muted-foreground size-8 animate-spin" })));
    var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground size-8 animate-spin" })], __VLS_functionalComponentArgsRest(__VLS_78), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    (__VLS_ctx.route.query.id ? "Downloading scenario..." : "Decoding scenario data...");
}
else if (__VLS_ctx.error) {
    var __VLS_82 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
    alert_1.Alert;
    // @ts-ignore
    var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
        variant: "destructive",
    }));
    var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([{
            variant: "destructive",
        }], __VLS_functionalComponentArgsRest(__VLS_83), false));
    var __VLS_87 = __VLS_85.slots.default;
    var __VLS_88 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FileWarningIcon} */
    lucide_vue_next_1.FileWarningIcon;
    // @ts-ignore
    var __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88(__assign({ class: "size-4" })));
    var __VLS_90 = __VLS_89.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_89), false));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    var __VLS_93 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertTitle | typeof __VLS_components.AlertTitle} */
    alert_1.AlertTitle;
    // @ts-ignore
    var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({}));
    var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_94), false));
    var __VLS_98 = __VLS_96.slots.default;
    // @ts-ignore
    [isLoading, route, error,];
    var __VLS_96;
    var __VLS_99 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
    alert_1.AlertDescription;
    // @ts-ignore
    var __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({}));
    var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_100), false));
    var __VLS_104 = __VLS_102.slots.default;
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
    var __VLS_102;
    // @ts-ignore
    [];
    var __VLS_85;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    var __VLS_105 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105(__assign({ 'onClick': {} })));
    var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_106), false));
    var __VLS_110 = void 0;
    var __VLS_111 = ({ click: {} },
        { onClick: (__VLS_ctx.handleCancel) });
    var __VLS_112 = __VLS_108.slots.default;
    // @ts-ignore
    [handleCancel,];
    var __VLS_108;
    var __VLS_109;
}
else if (__VLS_ctx.scenarioData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-lg font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.scenarioName);
    if (__VLS_ctx.scenarioDescription) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.scenarioDescription);
    }
    var __VLS_113 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Separator} */
    separator_1.Separator;
    // @ts-ignore
    var __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({}));
    var __VLS_115 = __VLS_114.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_114), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.sideCount);
    (__VLS_ctx.unitCount);
    if (__VLS_ctx.createdDate || __VLS_ctx.lastModifiedDate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground space-y-0.5 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        if (__VLS_ctx.createdDate) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (__VLS_ctx.formatDate(__VLS_ctx.createdDate));
        }
        if (__VLS_ctx.lastModifiedDate) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (__VLS_ctx.formatDate(__VLS_ctx.lastModifiedDate));
        }
    }
    if (__VLS_ctx.hasConflict) {
        var __VLS_118 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
        alert_1.Alert;
        // @ts-ignore
        var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
        var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_119), false));
        var __VLS_123 = __VLS_121.slots.default;
        var __VLS_124 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertTriangleIcon} */
        lucide_vue_next_1.AlertTriangleIcon;
        // @ts-ignore
        var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124(__assign({ class: "size-4" })));
        var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ class: "size-4" })], __VLS_functionalComponentArgsRest(__VLS_125), false));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        var __VLS_129 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertTitle | typeof __VLS_components.AlertTitle} */
        alert_1.AlertTitle;
        // @ts-ignore
        var __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({}));
        var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_130), false));
        var __VLS_134 = __VLS_132.slots.default;
        // @ts-ignore
        [scenarioData, scenarioName, scenarioDescription, scenarioDescription, sideCount, unitCount, createdDate, createdDate, createdDate, lastModifiedDate, lastModifiedDate, lastModifiedDate, formatDate, formatDate, hasConflict,];
        var __VLS_132;
        var __VLS_135 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
        alert_1.AlertDescription;
        // @ts-ignore
        var __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({}));
        var __VLS_137 = __VLS_136.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_136), false));
        var __VLS_140 = __VLS_138.slots.default;
        // @ts-ignore
        [];
        var __VLS_138;
        // @ts-ignore
        [];
        var __VLS_121;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-3" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    var __VLS_141 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141(__assign({ 'onClick': {} }, { variant: "outline" })));
    var __VLS_143 = __VLS_142.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline" })], __VLS_functionalComponentArgsRest(__VLS_142), false));
    var __VLS_146 = void 0;
    var __VLS_147 = ({ click: {} },
        { onClick: (__VLS_ctx.handleCancel) });
    var __VLS_148 = __VLS_144.slots.default;
    // @ts-ignore
    [handleCancel,];
    var __VLS_144;
    var __VLS_145;
    if (__VLS_ctx.hasConflict) {
        var __VLS_149 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149(__assign({ 'onClick': {} }, { variant: "destructive" })));
        var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "destructive" })], __VLS_functionalComponentArgsRest(__VLS_150), false));
        var __VLS_154 = void 0;
        var __VLS_155 = ({ click: {} },
            { onClick: (__VLS_ctx.handleOverwrite) });
        var __VLS_156 = __VLS_152.slots.default;
        // @ts-ignore
        [hasConflict, handleOverwrite,];
        var __VLS_152;
        var __VLS_153;
        var __VLS_157 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157(__assign({ 'onClick': {} })));
        var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_158), false));
        var __VLS_162 = void 0;
        var __VLS_163 = ({ click: {} },
            { onClick: (__VLS_ctx.handleCreateCopy) });
        var __VLS_164 = __VLS_160.slots.default;
        // @ts-ignore
        [handleCreateCopy,];
        var __VLS_160;
        var __VLS_161;
    }
    else {
        var __VLS_165 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165(__assign({ 'onClick': {} })));
        var __VLS_167 = __VLS_166.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_166), false));
        var __VLS_170 = void 0;
        var __VLS_171 = ({ click: {} },
            { onClick: (__VLS_ctx.handleLoad) });
        var __VLS_172 = __VLS_168.slots.default;
        // @ts-ignore
        [handleLoad,];
        var __VLS_168;
        var __VLS_169;
    }
}
// @ts-ignore
[];
var __VLS_61;
// @ts-ignore
[];
var __VLS_37;
if (__VLS_ctx.currentEncryptedScenario) {
    var __VLS_173 = DecryptScenarioModal_vue_1.default;
    // @ts-ignore
    var __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173(__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })));
    var __VLS_175 = __VLS_174.apply(void 0, __spreadArray([__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })], __VLS_functionalComponentArgsRest(__VLS_174), false));
    var __VLS_178 = void 0;
    var __VLS_179 = ({ decrypted: {} },
        { onDecrypted: (__VLS_ctx.onDecrypted) });
    var __VLS_176;
    var __VLS_177;
}
// @ts-ignore
[currentEncryptedScenario, currentEncryptedScenario, showDecryptModal, onDecrypted,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
