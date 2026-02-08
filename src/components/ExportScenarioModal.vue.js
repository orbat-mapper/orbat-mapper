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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var vue_1 = require("vue");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var scenarioExport_ts_1 = require("@/importexport/export/scenarioExport.ts");
var notifications_1 = require("@/composables/notifications");
var nprogress_1 = require("nprogress");
var core_1 = require("@vueuse/core");
var ExportSettingsXlsx_vue_1 = require("@/components/ExportSettingsXlsx.vue");
var ExportSettingsCsv_vue_1 = require("@/components/ExportSettingsCsv.vue");
var ExportSettingsSpatialIllusions_vue_1 = require("@/components/ExportSettingsSpatialIllusions.vue");
var ExportSettingsGeoJson_vue_1 = require("@/components/ExportSettingsGeoJson.vue");
var DocLink_vue_1 = require("@/components/DocLink.vue");
var ExportSettingsOrbatMapper_vue_1 = require("@/components/ExportSettingsOrbatMapper.vue");
var ExportSettingsKmlKmz_vue_1 = require("@/components/ExportSettingsKmlKmz.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var importExportStore_1 = require("@/stores/importExportStore");
var button_1 = require("@/components/ui/button");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var open = defineModel({ default: false });
var emit = defineEmits(["cancel"]);
var _b = (0, scenarioExport_ts_1.useScenarioExport)(), downloadAsGeoJSON = _b.downloadAsGeoJSON, downloadAsKML = _b.downloadAsKML, downloadAsKMZ = _b.downloadAsKMZ, downloadAsXlsx = _b.downloadAsXlsx, downloadAsCsv = _b.downloadAsCsv, downloadAsMilx = _b.downloadAsMilx, downloadAsSpatialIllusions = _b.downloadAsSpatialIllusions, downloadAsOrbatMapper = _b.downloadAsOrbatMapper;
var store = (0, importExportStore_1.useExportStore)();
var formatItems = [
    { label: "ORBAT Mapper", value: "orbatmapper" },
    { label: "GeoJSON", value: "geojson" },
    { label: "KML", value: "kml" },
    { label: "KMZ", value: "kmz" },
    { label: "XLSX", value: "xlsx" },
    { label: "CSV/TSV", value: "csv" },
    { label: "MilX", value: "milx" },
    { label: "Spatial Illusions ORBAT builder", value: "unitgenerator" },
];
var form = (0, core_1.useLocalStorage)("exportSettings", {
    format: (_a = store.currentFormat) !== null && _a !== void 0 ? _a : "orbatmapper",
    includeFeatures: false,
    includeUnits: true,
    includeSelectedUnitsOnly: false,
    sideGroups: [],
    fileName: "scenario.json",
    embedIcons: true,
    useShortName: true,
    oneSheetPerSide: true,
    columns: [],
    locationFormat: "json",
    separator: ",",
    oneFolderPerSide: true,
    folderMode: "side",
    customColors: true,
    rootUnit: "",
    maxLevels: 3,
    includeIdInProperties: false,
    includeId: true,
    iconScale: 1.5,
    labelScale: 1,
    drawSymbolOutline: true,
    outlineColor: "rgba(255,255,255,0.8)",
    outlineWidth: 8,
    renderAmplifiers: false,
    timeMode: "current",
    exportEventId: "",
    exportEventIds: [],
    useRadioFolder: true,
}, { writeDefaults: true });
var send = (0, notifications_1.useNotifications)().send;
var format = (0, vue_1.computed)(function () { return form.value.format; });
var isGeojson = (0, vue_1.computed)(function () { return form.value.format === "geojson"; });
var isKml = (0, vue_1.computed)(function () { return form.value.format === "kml"; });
var isKmz = (0, vue_1.computed)(function () { return form.value.format === "kmz"; });
var isMilx = (0, vue_1.computed)(function () { return form.value.format === "milx"; });
function onExport(e) {
    return __awaiter(this, void 0, void 0, function () {
        var format;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = form.value.format;
                    nprogress_1.default.start();
                    if (!(format === "geojson")) return [3 /*break*/, 2];
                    return [4 /*yield*/, downloadAsGeoJSON(form.value)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 2:
                    if (!(format === "kml")) return [3 /*break*/, 4];
                    return [4 /*yield*/, downloadAsKML(form.value)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 4:
                    if (!(format === "kmz")) return [3 /*break*/, 6];
                    return [4 /*yield*/, downloadAsKMZ(form.value)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 6:
                    if (!(format === "xlsx")) return [3 /*break*/, 8];
                    return [4 /*yield*/, downloadAsXlsx(form.value)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 8:
                    if (!(format === "csv")) return [3 /*break*/, 10];
                    return [4 /*yield*/, downloadAsCsv(form.value)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 10:
                    if (!(format === "milx")) return [3 /*break*/, 12];
                    return [4 /*yield*/, downloadAsMilx(form.value)];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 12:
                    if (!(format === "unitgenerator")) return [3 /*break*/, 14];
                    return [4 /*yield*/, downloadAsSpatialIllusions(form.value)];
                case 13:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 14:
                    if (!(format === "orbatmapper")) return [3 /*break*/, 16];
                    return [4 /*yield*/, downloadAsOrbatMapper(form.value)];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16:
                    nprogress_1.default.done();
                    if (!store.keepOpen)
                        open.value = false;
                    store.currentFormat = format;
                    send({ message: "Exported scenario as ".concat(format) });
                    return [2 /*return*/];
            }
        });
    });
}
function onCancel() {
    open.value = false;
    store.currentFormat = format.value;
    emit("cancel");
}
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = NewSimpleModal_vue_1.default || NewSimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: "Export scenario" }), { class: "sm:max-w-xl md:max-w-4xl" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), dialogTitle: "Export scenario" }), { class: "sm:max-w-xl md:max-w-4xl" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ cancel: {} },
    { onCancel: (__VLS_ctx.onCancel) });
var __VLS_7 = {};
/** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-4xl']} */ ;
var __VLS_8 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-1 text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.onExport) }, { class: "mt-4 space-y-6" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
var __VLS_9 = SimpleSelect_vue_1.default || SimpleSelect_vue_1.default;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    label: "Select export format",
    items: (__VLS_ctx.formatItems),
    modelValue: (__VLS_ctx.form.format),
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        label: "Select export format",
        items: (__VLS_ctx.formatItems),
        modelValue: (__VLS_ctx.form.format),
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_14 = __VLS_12.slots.default;
{
    var __VLS_15 = __VLS_12.slots.hint;
    var __VLS_16 = DocLink_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        href: "https://docs.orbat-mapper.app/guide/export-data",
    }));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
            href: "https://docs.orbat-mapper.app/guide/export-data",
        }], __VLS_functionalComponentArgsRest(__VLS_17), false));
    // @ts-ignore
    [open, onCancel, onExport, formatItems, form,];
}
// @ts-ignore
[];
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
if (__VLS_ctx.isKml) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else if (__VLS_ctx.isKmz) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
if (__VLS_ctx.format === 'xlsx') {
    var __VLS_21 = ExportSettingsXlsx_vue_1.default;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        format: (__VLS_ctx.format),
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{
            format: (__VLS_ctx.format),
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_22), false));
}
else if (__VLS_ctx.format === 'csv') {
    var __VLS_26 = ExportSettingsCsv_vue_1.default;
    // @ts-ignore
    var __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        format: (__VLS_ctx.format),
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([{
            format: (__VLS_ctx.format),
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_27), false));
}
else if (__VLS_ctx.format === 'unitgenerator') {
    var __VLS_31 = ExportSettingsSpatialIllusions_vue_1.default;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        format: (__VLS_ctx.format),
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
            format: (__VLS_ctx.format),
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_32), false));
}
else if (__VLS_ctx.format === 'orbatmapper') {
    var __VLS_36 = ExportSettingsOrbatMapper_vue_1.default;
    // @ts-ignore
    var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_37), false));
}
else if (__VLS_ctx.format === 'geojson') {
    var __VLS_41 = ExportSettingsGeoJson_vue_1.default;
    // @ts-ignore
    var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        format: (__VLS_ctx.format),
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
            format: (__VLS_ctx.format),
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_42), false));
}
else if (__VLS_ctx.format === 'kml' || __VLS_ctx.format === 'kmz') {
    var __VLS_46 = ExportSettingsKmlKmz_vue_1.default;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        format: (__VLS_ctx.format),
        modelValue: (__VLS_ctx.form),
    }));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
            format: (__VLS_ctx.format),
            modelValue: (__VLS_ctx.form),
        }], __VLS_functionalComponentArgsRest(__VLS_47), false));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_51 = InputCheckbox_vue_1.default;
    // @ts-ignore
    var __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        label: "Include units",
        description: "Units with a location at current scenario time",
        modelValue: (__VLS_ctx.form.includeUnits),
    }));
    var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
            label: "Include units",
            description: "Units with a location at current scenario time",
            modelValue: (__VLS_ctx.form.includeUnits),
        }], __VLS_functionalComponentArgsRest(__VLS_52), false));
    if (!__VLS_ctx.isMilx) {
        var __VLS_56 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            label: "Include scenario features",
            modelValue: (__VLS_ctx.form.includeFeatures),
            description: "",
        }));
        var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([{
                label: "Include scenario features",
                modelValue: (__VLS_ctx.form.includeFeatures),
                description: "",
            }], __VLS_functionalComponentArgsRest(__VLS_57), false));
    }
    if (__VLS_ctx.isMilx) {
        var __VLS_61 = InputCheckbox_vue_1.default;
        // @ts-ignore
        var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
            label: ('Use one layer per side'),
            modelValue: (__VLS_ctx.form.oneFolderPerSide),
        }));
        var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{
                label: ('Use one layer per side'),
                modelValue: (__VLS_ctx.form.oneFolderPerSide),
            }], __VLS_functionalComponentArgsRest(__VLS_62), false));
    }
}
if (__VLS_ctx.isKmz || __VLS_ctx.isKml) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
if (__VLS_ctx.isMilx) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "flex items-center justify-between space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_66 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
    modelValue: (__VLS_ctx.store.keepOpen),
}));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.store.keepOpen),
    }], __VLS_functionalComponentArgsRest(__VLS_67), false));
var __VLS_71 = __VLS_69.slots.default;
// @ts-ignore
[form, form, form, form, form, form, form, form, form, isKml, isKml, isKmz, isKmz, format, format, format, format, format, format, format, format, format, format, format, format, isMilx, isMilx, isMilx, store,];
var __VLS_69;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
var __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    type: "submit",
    size: "sm",
}));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{
        type: "submit",
        size: "sm",
    }], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77 = __VLS_75.slots.default;
// @ts-ignore
[];
var __VLS_75;
var __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_79), false));
var __VLS_83;
var __VLS_84 = ({ click: {} },
    { onClick: (__VLS_ctx.onCancel) });
var __VLS_85 = __VLS_81.slots.default;
// @ts-ignore
[onCancel,];
var __VLS_81;
var __VLS_82;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
