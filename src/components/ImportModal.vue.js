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
var ImportLoadStep_vue_1 = require("@/components/ImportLoadStep.vue");
var vue_1 = require("vue");
var ImportImageStep_vue_1 = require("@/components/ImportImageStep.vue");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var ImportGeojsonStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportGeojsonStep.vue"); }); });
var DecryptScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/DecryptScenarioModal.vue"); }); });
var ImportSpatialIllusionsStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportSpatialIllusionsStep.vue"); }); });
var ImportOrbatGeneratorStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportOrbatGeneratorStep.vue"); }); });
var ImportMilxStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportMilxStep.vue"); }); });
var ImportKMLStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportKMLStep.vue"); }); });
var ImportSpreadsheetStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportSpreadsheetStep.vue"); }); });
var ImportOrbatMapperStep = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/ImportOrbatMapperStep.vue"); }); });
var importState = (0, vue_1.ref)("select");
var loadedData = (0, vue_1.shallowRef)([]);
var loadedImportData = (0, vue_1.shallowRef)();
var fileInfo = (0, vue_1.shallowRef)();
var emit = defineEmits(["cancel"]);
var open = defineModel({ default: false });
var showDecryptModal = (0, vue_1.ref)(false);
function onLoaded(nextState, data, info) {
    loadedData.value = data;
    if (nextState === "orbatmapper-encrypted") {
        showDecryptModal.value = true;
        return;
    }
    importState.value = nextState;
    fileInfo.value = info;
}
function onDecrypted(scenario) {
    showDecryptModal.value = false;
    loadedData.value = scenario;
    importState.value = "orbatmapper";
}
function onLod(importData) {
    loadedImportData.value = importData;
    importState.value = importData.format;
}
function onImport() {
    open.value = false;
}
function onCancel() {
    var _a;
    open.value = false;
    var objectUrlStates = ["image", "kml"];
    if (objectUrlStates.includes(importState.value) && loadedData.value !== undefined) {
        URL.revokeObjectURL(loadedData.value);
    }
    // clean up loadedImportData
    (_a = loadedImportData.value) === null || _a === void 0 ? void 0 : _a.data.forEach(function (d) {
        if (d instanceof String && d.startsWith("blob:")) {
            URL.revokeObjectURL(d);
        }
    });
    loadedImportData.value = undefined;
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), fixedHeight: true }), { class: "grid h-[90vh] grid-rows-[auto_1fr] sm:max-w-xl md:max-w-4xl lg:max-w-[95vw]" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { modelValue: (__VLS_ctx.open), fixedHeight: true }), { class: "grid h-[90vh] grid-rows-[auto_1fr] sm:max-w-xl md:max-w-4xl lg:max-w-[95vw]" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ cancel: {} },
    { onCancel: (__VLS_ctx.onCancel) });
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-rows-[auto_1fr]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:max-w-[95vw]']} */ ;
var __VLS_7 = __VLS_3.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "-mx-6 flex h-full flex-col overflow-hidden px-0" }));
/** @type {__VLS_StyleScopedClasses['-mx-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['px-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-0 flex-1 overflow-hidden" }));
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
if (__VLS_ctx.importState === 'select') {
    var __VLS_8 = ImportLoadStep_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { 'onLod': {} })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { 'onLod': {} })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = void 0;
    var __VLS_14 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_15 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onLoaded) });
    var __VLS_16 = ({ lod: {} },
        { onLod: (__VLS_ctx.onLod) });
    var __VLS_11;
    var __VLS_12;
}
else if (__VLS_ctx.importState === 'milx') {
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportMilxStep} */
    ImportMilxStep;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    var __VLS_22 = void 0;
    var __VLS_23 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_24 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_20;
    var __VLS_21;
}
else if (__VLS_ctx.importState === 'geojson') {
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportGeojsonStep} */
    ImportGeojsonStep;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = void 0;
    var __VLS_31 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_32 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_28;
    var __VLS_29;
}
else if (__VLS_ctx.importState === 'unitgenerator') {
    var __VLS_33 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportSpatialIllusionsStep} */
    ImportSpatialIllusionsStep;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_38 = void 0;
    var __VLS_39 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_40 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_36;
    var __VLS_37;
}
else if (__VLS_ctx.importState === 'orbatgenerator') {
    var __VLS_41 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportOrbatGeneratorStep} */
    ImportOrbatGeneratorStep;
    // @ts-ignore
    var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })));
    var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: __VLS_ctx.loadedData })], __VLS_functionalComponentArgsRest(__VLS_42), false));
    var __VLS_46 = void 0;
    var __VLS_47 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_48 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_44;
    var __VLS_45;
}
else if (__VLS_ctx.importState === 'image' && __VLS_ctx.fileInfo) {
    var __VLS_49 = ImportImageStep_vue_1.default;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { objectUrl: __VLS_ctx.loadedData, fileInfo: (__VLS_ctx.fileInfo) })));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { objectUrl: __VLS_ctx.loadedData, fileInfo: (__VLS_ctx.fileInfo) })], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_54 = void 0;
    var __VLS_55 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_56 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_52;
    var __VLS_53;
}
else if (((_a = __VLS_ctx.loadedImportData) === null || _a === void 0 ? void 0 : _a.format) === 'kml') {
    var __VLS_57 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportKMLStep} */
    ImportKMLStep;
    // @ts-ignore
    var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { loadedData: (__VLS_ctx.loadedImportData) })));
    var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { loadedData: (__VLS_ctx.loadedImportData) })], __VLS_functionalComponentArgsRest(__VLS_58), false));
    var __VLS_62 = void 0;
    var __VLS_63 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_64 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_60;
    var __VLS_61;
}
else if ((__VLS_ctx.importState === 'xlsx' || __VLS_ctx.importState === 'csv' || __VLS_ctx.importState === 'tsv') &&
    __VLS_ctx.fileInfo) {
    var __VLS_65 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportSpreadsheetStep} */
    ImportSpreadsheetStep;
    // @ts-ignore
    var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { fileInfo: (__VLS_ctx.fileInfo) })));
    var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { fileInfo: (__VLS_ctx.fileInfo) })], __VLS_functionalComponentArgsRest(__VLS_66), false));
    var __VLS_70 = void 0;
    var __VLS_71 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_72 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_68;
    var __VLS_69;
}
else if (__VLS_ctx.importState === 'orbatmapper') {
    var __VLS_73 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.ImportOrbatMapperStep} */
    ImportOrbatMapperStep;
    // @ts-ignore
    var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: (__VLS_ctx.loadedData) })));
    var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign(__assign({ 'onCancel': {} }, { 'onLoaded': {} }), { data: (__VLS_ctx.loadedData) })], __VLS_functionalComponentArgsRest(__VLS_74), false));
    var __VLS_78 = void 0;
    var __VLS_79 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.onCancel) });
    var __VLS_80 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onImport) });
    var __VLS_76;
    var __VLS_77;
}
// @ts-ignore
[open, onCancel, onCancel, onCancel, onCancel, onCancel, onCancel, onCancel, onCancel, onCancel, onCancel, importState, importState, importState, importState, importState, importState, importState, importState, importState, importState, onLoaded, onLod, loadedData, loadedData, loadedData, loadedData, loadedData, loadedData, onImport, onImport, onImport, onImport, onImport, onImport, onImport, onImport, fileInfo, fileInfo, fileInfo, fileInfo, loadedImportData, loadedImportData,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.showDecryptModal && __VLS_ctx.loadedData) {
    var __VLS_81 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DecryptScenarioModal} */
    DecryptScenarioModal;
    // @ts-ignore
    var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81(__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.loadedData) })));
    var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.loadedData) })], __VLS_functionalComponentArgsRest(__VLS_82), false));
    var __VLS_86 = void 0;
    var __VLS_87 = ({ decrypted: {} },
        { onDecrypted: (__VLS_ctx.onDecrypted) });
    var __VLS_84;
    var __VLS_85;
}
// @ts-ignore
[loadedData, loadedData, showDecryptModal, showDecryptModal, onDecrypted,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
