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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var FormCard_vue_1 = require("@/components/FormCard.vue");
var InputGroup_vue_1 = require("@/components/InputGroup.vue");
var SimpleMarkdownInput_vue_1 = require("@/components/SimpleMarkdownInput.vue");
var TimezoneSelect_vue_1 = require("@/components/TimezoneSelect.vue");
var scenarioTime_1 = require("@/composables/scenarioTime");
var RadioGroupList_vue_1 = require("@/components/RadioGroupList.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var vue_router_1 = require("vue-router");
var names_1 = require("@/router/names");
var scenariostore_1 = require("@/scenariostore");
var io_1 = require("@/scenariostore/io");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var values_1 = require("@/symbology/values");
var utils_1 = require("@/utils");
var sidc_1 = require("@/symbology/sidc");
var StandardIdentitySelect_vue_1 = require("@/components/StandardIdentitySelect.vue");
var SimpleDivider_vue_1 = require("@/components/SimpleDivider.vue");
var helpers_1 = require("@/symbology/helpers");
var localdb_1 = require("@/scenariostore/localdb");
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var button_1 = require("@/components/ui/button");
var NewMilitarySymbol_vue_1 = require("@/components/NewMilitarySymbol.vue");
var router = (0, vue_router_1.useRouter)();
var scenario = (0, scenariostore_1.useScenario)().scenario;
var standardSettings = [
    {
        value: "app6",
        name: "APP-6",
        description: "NATO version",
    },
    {
        value: "2525",
        name: "MIL-STD-2525D",
        description: "US version",
    },
];
var noInitialOrbat = (0, vue_1.ref)(false);
var newScenario = (0, vue_1.ref)((0, io_1.createEmptyScenario)({ addGroups: true, symbologyStandard: "app6" }));
var timeZone = (0, vue_1.ref)(newScenario.value.timeZone || "UTC");
var _a = (0, scenarioTime_1.useYMDElements)({
    timestamp: newScenario.value.startTime,
    isLocal: true,
    timeZone: timeZone,
}), year = _a.year, month = _a.month, day = _a.day, hour = _a.hour, minute = _a.minute, resDateTime = _a.resDateTime;
var form = (0, vue_1.reactive)({
    name: "New scenario",
    description: "",
    sides: [
        {
            name: "Side 1",
            standardIdentity: values_1.SID.Friend,
            symbolOptions: {},
            units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121100" }],
        },
        {
            name: "Side 2",
            standardIdentity: values_1.SID.Hostile,
            symbolOptions: {},
            units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121100" }],
        },
    ],
});
function create() {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, _a, state, clearUndoRedoStack, _b, unitActions, getSideById, addScenario, scenarioId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    startTime = resDateTime.value.valueOf();
                    newScenario.value.startTime = startTime;
                    newScenario.value.name = form.name;
                    newScenario.value.description = form.description;
                    newScenario.value.layers = [{ name: "Features", id: (0, utils_1.nanoid)(), features: [] }];
                    newScenario.value.timeZone = timeZone.value;
                    scenario.value.io.loadFromObject(newScenario.value);
                    scenario.value.time.setCurrentTime(startTime);
                    _a = scenario.value.store, state = _a.state, clearUndoRedoStack = _a.clearUndoRedoStack;
                    _b = scenario.value, unitActions = _b.unitActions, getSideById = _b.helpers.getSideById;
                    if (!noInitialOrbat.value) {
                        form.sides.forEach(function (sideData) {
                            var units = sideData.units, rest = __rest(sideData, ["units"]);
                            var sideId = unitActions.addSide(rest, { markAsNew: false });
                            var parentId = getSideById(sideId).groups[0];
                            sideData.units.forEach(function (u) {
                                var _a;
                                var sidc = new sidc_1.Sidc("10031000000000000000");
                                sidc.standardIdentity = sideData.standardIdentity;
                                sidc.emt = u.rootUnitEchelon || "00";
                                sidc.mainIcon = u.rootUnitIcon || "000000";
                                unitActions.addUnit({
                                    id: (0, utils_1.nanoid)(),
                                    name: (_a = u.rootUnitName) !== null && _a !== void 0 ? _a : "test",
                                    sidc: sidc.toString(),
                                    subUnits: [],
                                    _pid: "nn",
                                    _sid: "nn",
                                    _gid: "nn",
                                    equipment: [],
                                    personnel: [],
                                }, parentId);
                            });
                        });
                    }
                    clearUndoRedoStack();
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 1:
                    addScenario = (_c.sent()).addScenario;
                    return [4 /*yield*/, addScenario(scenario.value.io.serializeToObject())];
                case 2:
                    scenarioId = _c.sent();
                    return [4 /*yield*/, router.push({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var icons = [
    { code: "000000", text: "Unspecified" },
    { code: "110000", text: "Command and Control" },
    { code: "121100", text: "Infantry" },
    { code: "121000", text: "Combined Arms" },
    { code: "121102", text: "Mechanized" },
    { code: "130300", text: "Artillery" },
    { code: "120500", text: "Armor" },
    { code: "160600", text: "Combat Service Support" },
];
function iconItems(sid) {
    return icons.map(function (_a) {
        var code = _a.code, text = _a.text;
        return {
            code: code,
            text: text,
            sidc: "100" + sid + "10" + "00" + "00" + code + "0000",
        };
    });
}
function unitSidc(_a, _b) {
    var rootUnitEchelon = _a.rootUnitEchelon, rootUnitIcon = _a.rootUnitIcon;
    var standardIdentity = _b.standardIdentity;
    return "100" + standardIdentity + "10" + "00" + rootUnitEchelon + rootUnitIcon + "0000";
}
function addSide() {
    form.sides.push({
        name: "Side",
        standardIdentity: values_1.SID.Friend,
        symbolOptions: {},
        units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121000" }],
    });
}
function addRootUnit(side) {
    side.units.push({ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121000" });
}
function removeUnit(side, unit) {
    var idx = side.units.indexOf(unit);
    if (idx >= 0)
        side.units.splice(idx, 1);
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-screen py-10" }));
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)(__assign({ class: "text-heading text-3xl leading-tight font-bold" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose dark:prose-invert mt-4" }));
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto my-10 max-w-7xl sm:px-6 lg:px-8" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['my-10']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.create();
        // @ts-ignore
        [create,];
    } }, { class: "mt-6 space-y-6" }));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between space-x-3 px-4 sm:px-0" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-0']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    asChild: true,
    variant: "link",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        asChild: true,
        variant: "link",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://docs.orbat-mapper.app/guide/getting-started",
    target: "_blank",
});
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.ExternalLinkIcon} */
lucide_vue_next_1.ExternalLinkIcon;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_7), false));
// @ts-ignore
[];
var __VLS_3;
var __VLS_11 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    primary: true,
    type: "submit",
}));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
        primary: true,
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_12), false));
var __VLS_16 = __VLS_14.slots.default;
// @ts-ignore
[];
var __VLS_14;
var __VLS_17 = FormCard_vue_1.default || FormCard_vue_1.default;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ class: "" }, { label: "Basic scenario info", description: "Provide a name and description for your scenario." })));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "" }, { label: "Basic scenario info", description: "Provide a name and description for your scenario." })], __VLS_functionalComponentArgsRest(__VLS_18), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_22 = __VLS_20.slots.default;
var __VLS_23 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "Name",
    modelValue: (__VLS_ctx.form.name),
    id: "name-input",
    autofocus: true,
}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
        label: "Name",
        modelValue: (__VLS_ctx.form.name),
        id: "name-input",
        autofocus: true,
    }], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_28 = SimpleMarkdownInput_vue_1.default;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    label: "Description",
    modelValue: (__VLS_ctx.form.description),
    description: "Use markdown syntax for formatting",
}));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{
        label: "Description",
        modelValue: (__VLS_ctx.form.description),
        description: "Use markdown syntax for formatting",
    }], __VLS_functionalComponentArgsRest(__VLS_29), false));
// @ts-ignore
[form, form,];
var __VLS_20;
var __VLS_33 = FormCard_vue_1.default || FormCard_vue_1.default;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "Initial ORBAT",
}));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
        label: "Initial ORBAT",
    }], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_38 = __VLS_36.slots.default;
{
    var __VLS_39 = __VLS_36.slots.description;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
var __VLS_40 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.noInitialOrbat),
}));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.noInitialOrbat),
    }], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_45 = __VLS_43.slots.default;
// @ts-ignore
[noInitialOrbat,];
var __VLS_43;
if (!__VLS_ctx.noInitialOrbat) {
    var _loop_1 = function (sideData, idx) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (idx) }, { class: "relative rounded-md border p-4" }));
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid gap-4 md:grid-cols-2" }));
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        var __VLS_46 = InputGroup_vue_1.default;
        // @ts-ignore
        var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            modelValue: (sideData.name),
            label: "Side name",
        }));
        var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
                modelValue: (sideData.name),
                label: "Side name",
            }], __VLS_functionalComponentArgsRest(__VLS_47), false));
        var __VLS_51 = StandardIdentitySelect_vue_1.default;
        // @ts-ignore
        var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            modelValue: (sideData.standardIdentity),
            fillColor: (sideData.symbolOptions.fillColor),
        }));
        var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
                modelValue: (sideData.standardIdentity),
                fillColor: (sideData.symbolOptions.fillColor),
            }], __VLS_functionalComponentArgsRest(__VLS_52), false));
        var __VLS_56 = SimpleDivider_vue_1.default || SimpleDivider_vue_1.default;
        // @ts-ignore
        var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56(__assign({ class: "mt-4 mb-4" })));
        var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([__assign({ class: "mt-4 mb-4" })], __VLS_functionalComponentArgsRest(__VLS_57), false));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        var __VLS_61 = __VLS_59.slots.default;
        // @ts-ignore
        [form, noInitialOrbat,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-6" }));
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        for (var _d = 0, _e = __VLS_vFor((sideData.units)); _d < _e.length; _d++) {
            var _f = _e[_d], unit = _f[0], i = _f[1];
            (i);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-end gap-4 md:grid md:grid-cols-2" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            var __VLS_62 = InputGroup_vue_1.default;
            // @ts-ignore
            var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                label: "Root unit name",
                modelValue: (unit.rootUnitName),
            }));
            var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{
                    label: "Root unit name",
                    modelValue: (unit.rootUnitName),
                }], __VLS_functionalComponentArgsRest(__VLS_63), false));
            var __VLS_67 = NewMilitarySymbol_vue_1.default;
            // @ts-ignore
            var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                size: (32),
                sidc: (__VLS_ctx.unitSidc(unit, sideData)),
                options: (__assign(__assign({}, sideData.symbolOptions), { outlineWidth: 8 })),
            }));
            var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{
                    size: (32),
                    sidc: (__VLS_ctx.unitSidc(unit, sideData)),
                    options: (__assign(__assign({}, sideData.symbolOptions), { outlineWidth: 8 })),
                }], __VLS_functionalComponentArgsRest(__VLS_68), false));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 grid gap-4 md:grid-cols-2" }));
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            var __VLS_72 = SymbolCodeSelect_vue_1.default;
            // @ts-ignore
            var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72(__assign({ class: "" }, { label: "Main icon", modelValue: (unit.rootUnitIcon), items: (__VLS_ctx.iconItems(sideData.standardIdentity)), symbolOptions: (sideData.symbolOptions) })));
            var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ class: "" }, { label: "Main icon", modelValue: (unit.rootUnitIcon), items: (__VLS_ctx.iconItems(sideData.standardIdentity)), symbolOptions: (sideData.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_73), false));
            /** @type {__VLS_StyleScopedClasses['']} */ ;
            var __VLS_77 = SymbolCodeSelect_vue_1.default;
            // @ts-ignore
            var __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77(__assign({ class: "w-full" }, { label: "Echelon", modelValue: (unit.rootUnitEchelon), items: (__VLS_ctx.echelonItems(sideData.standardIdentity)), symbolOptions: (sideData.symbolOptions) })));
            var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign({ class: "w-full" }, { label: "Echelon", modelValue: (unit.rootUnitEchelon), items: (__VLS_ctx.echelonItems(sideData.standardIdentity)), symbolOptions: (sideData.symbolOptions) })], __VLS_functionalComponentArgsRest(__VLS_78), false));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            if (i < sideData.units.length - 1) {
                var __VLS_82 = SimpleDivider_vue_1.default;
                // @ts-ignore
                var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({}));
                var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_83), false));
            }
            // @ts-ignore
            [unitSidc, iconItems, helpers_1.echelonItems,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-6 flex justify-end gap-x-2" }));
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-x-2']} */ ;
        var __VLS_87 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87(__assign({ 'onClick': {} }, { variant: "link", type: "button", size: "sm", disabled: (!sideData.units.length) })));
        var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "link", type: "button", size: "sm", disabled: (!sideData.units.length) })], __VLS_functionalComponentArgsRest(__VLS_88), false));
        var __VLS_92 = void 0;
        var __VLS_93 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.noInitialOrbat))
                        return;
                    __VLS_ctx.removeUnit(sideData, sideData.units[sideData.units.length - 1]);
                    // @ts-ignore
                    [removeUnit,];
                } });
        var __VLS_94 = __VLS_90.slots.default;
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-border" }));
        /** @type {__VLS_StyleScopedClasses['text-border']} */ ;
        var __VLS_95 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
        button_1.Button;
        // @ts-ignore
        var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
        var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_96), false));
        var __VLS_100 = void 0;
        var __VLS_101 = ({ click: {} },
            { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.noInitialOrbat))
                        return;
                    __VLS_ctx.addRootUnit(sideData);
                    // @ts-ignore
                    [addRootUnit,];
                } });
        var __VLS_102 = __VLS_98.slots.default;
        // @ts-ignore
        [];
        if (idx === __VLS_ctx.form.sides.length - 1) {
            var __VLS_103 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
            button_1.Button;
            // @ts-ignore
            var __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103(__assign({ 'onClick': {} }, { variant: "link", size: "sm" })));
            var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_104), false));
            var __VLS_108 = void 0;
            var __VLS_109 = ({ click: {} },
                { onClick: function () {
                        var _a = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            _a[_i] = arguments[_i];
                        }
                        var $event = _a[0];
                        if (!(!__VLS_ctx.noInitialOrbat))
                            return;
                        if (!(idx === __VLS_ctx.form.sides.length - 1))
                            return;
                        __VLS_ctx.form.sides.pop();
                        // @ts-ignore
                        [form, form,];
                    } });
            var __VLS_110 = __VLS_106.slots.default;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    };
    var __VLS_59, __VLS_90, __VLS_91, __VLS_98, __VLS_99, __VLS_106, __VLS_107;
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.form.sides)); _i < _b.length; _i++) {
        var _c = _b[_i], sideData = _c[0], idx = _c[1];
        _loop_1(sideData, idx);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "mt-6 flex justify-end" }));
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    var __VLS_111 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })));
    var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_112), false));
    var __VLS_116 = void 0;
    var __VLS_117 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(!__VLS_ctx.noInitialOrbat))
                    return;
                __VLS_ctx.addSide();
                // @ts-ignore
                [addSide,];
            } });
    var __VLS_118 = __VLS_114.slots.default;
    // @ts-ignore
    [];
    var __VLS_114;
    var __VLS_115;
}
// @ts-ignore
[];
var __VLS_36;
var __VLS_119 = FormCard_vue_1.default || FormCard_vue_1.default;
// @ts-ignore
var __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    label: "Scenario start time",
}));
var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([{
        label: "Scenario start time",
    }], __VLS_functionalComponentArgsRest(__VLS_120), false));
var __VLS_124 = __VLS_122.slots.default;
{
    var __VLS_125 = __VLS_122.slots.description;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    // @ts-ignore
    [];
}
var __VLS_126 = TimezoneSelect_vue_1.default;
// @ts-ignore
var __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
    label: "Time zone",
    modelValue: (__VLS_ctx.timeZone),
}));
var __VLS_128 = __VLS_127.apply(void 0, __spreadArray([{
        label: "Time zone",
        modelValue: (__VLS_ctx.timeZone),
    }], __VLS_functionalComponentArgsRest(__VLS_127), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 gap-6" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_131 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
    label: "Year",
    type: "number",
    modelValue: (__VLS_ctx.year),
}));
var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([{
        label: "Year",
        type: "number",
        modelValue: (__VLS_ctx.year),
    }], __VLS_functionalComponentArgsRest(__VLS_132), false));
var __VLS_136 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
    label: "Month",
    type: "number",
    modelValue: (__VLS_ctx.month),
}));
var __VLS_138 = __VLS_137.apply(void 0, __spreadArray([{
        label: "Month",
        type: "number",
        modelValue: (__VLS_ctx.month),
    }], __VLS_functionalComponentArgsRest(__VLS_137), false));
var __VLS_141 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
    label: "Day",
    type: "number",
    modelValue: (__VLS_ctx.day),
}));
var __VLS_143 = __VLS_142.apply(void 0, __spreadArray([{
        label: "Day",
        type: "number",
        modelValue: (__VLS_ctx.day),
    }], __VLS_functionalComponentArgsRest(__VLS_142), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-6" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_146 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
    label: "Hour",
    modelValue: (__VLS_ctx.hour),
    type: "number",
    min: "0",
    max: "23",
}));
var __VLS_148 = __VLS_147.apply(void 0, __spreadArray([{
        label: "Hour",
        modelValue: (__VLS_ctx.hour),
        type: "number",
        min: "0",
        max: "23",
    }], __VLS_functionalComponentArgsRest(__VLS_147), false));
var __VLS_151 = InputGroup_vue_1.default;
// @ts-ignore
var __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
    label: "Minute",
    modelValue: (__VLS_ctx.minute),
    type: "number",
    min: "0",
    max: "59",
}));
var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([{
        label: "Minute",
        modelValue: (__VLS_ctx.minute),
        type: "number",
        min: "0",
        max: "59",
    }], __VLS_functionalComponentArgsRest(__VLS_152), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground font-mono" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
(__VLS_ctx.resDateTime.format());
// @ts-ignore
[timeZone, year, month, day, hour, minute, resDateTime,];
var __VLS_122;
var __VLS_156 = FormCard_vue_1.default || FormCard_vue_1.default;
// @ts-ignore
var __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
    label: "Symbology standard",
    description: "Select the symbology standard you prefer to use.",
}));
var __VLS_158 = __VLS_157.apply(void 0, __spreadArray([{
        label: "Symbology standard",
        description: "Select the symbology standard you prefer to use.",
    }], __VLS_functionalComponentArgsRest(__VLS_157), false));
var __VLS_161 = __VLS_159.slots.default;
var __VLS_162 = RadioGroupList_vue_1.default;
// @ts-ignore
var __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
    items: (__VLS_ctx.standardSettings),
    modelValue: (__VLS_ctx.newScenario.symbologyStandard),
}));
var __VLS_164 = __VLS_163.apply(void 0, __spreadArray([{
        items: (__VLS_ctx.standardSettings),
        modelValue: (__VLS_ctx.newScenario.symbologyStandard),
    }], __VLS_functionalComponentArgsRest(__VLS_163), false));
// @ts-ignore
[standardSettings, newScenario,];
var __VLS_159;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end space-x-3 px-4 sm:px-0" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-0']} */ ;
var __VLS_167;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    type: "submit",
}));
var __VLS_169 = __VLS_168.apply(void 0, __spreadArray([{
        type: "submit",
    }], __VLS_functionalComponentArgsRest(__VLS_168), false));
var __VLS_172 = __VLS_170.slots.default;
// @ts-ignore
[];
var __VLS_170;
var __VLS_173;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    asChild: true,
    variant: "secondary",
}));
var __VLS_175 = __VLS_174.apply(void 0, __spreadArray([{
        asChild: true,
        variant: "secondary",
    }], __VLS_functionalComponentArgsRest(__VLS_174), false));
var __VLS_178 = __VLS_176.slots.default;
var __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
var __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    to: "/",
}));
var __VLS_181 = __VLS_180.apply(void 0, __spreadArray([{
        to: "/",
    }], __VLS_functionalComponentArgsRest(__VLS_180), false));
var __VLS_184 = __VLS_182.slots.default;
// @ts-ignore
[];
var __VLS_182;
// @ts-ignore
[];
var __VLS_176;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
