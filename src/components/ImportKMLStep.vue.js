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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var lucide_vue_next_1 = require("lucide-vue-next");
var files_1 = require("@/utils/files");
var AlertWarning_vue_1 = require("@/components/AlertWarning.vue");
var button_1 = require("@/components/ui/button");
var field_1 = require("@/components/ui/field");
var input_1 = require("@/components/ui/input");
var ImportedFileList_vue_1 = require("@/components/ImportedFileList.vue");
var spinner_1 = require("@/components/ui/spinner");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var kml_1 = require("@/importexport/kml");
var checkbox_1 = require("@/components/ui/checkbox");
var collapsible_1 = require("@/components/ui/collapsible");
var InputCheckbox_vue_1 = require("@/components/InputCheckbox.vue");
var __VLS_props = defineProps();
var loadedData = __VLS_props.loadedData;
var emit = defineEmits(["cancel", "loaded"]);
var geo = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).geo;
var onImageLayerSelectHook = (0, utils_1.injectStrict)(injects_1.searchActionsKey).onImageLayerSelectHook;
var isProcessing = (0, vue_1.ref)(true);
var parsedDataMap = (0, vue_1.shallowRef)(new Map());
var form = (0, vue_1.ref)({
    fileOptions: [],
    layerNames: loadedData.fileInfo.map(function (f) { return (0, files_1.stripFileExtension)(f.fileName); }),
    extractStyles: true,
    showPointNames: true,
});
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, blobUrl, index, _b, layerName, selectedFolders, indeterminateFolders, parsedKmlData, kmlDom, folders, _c, folders_1, folderElement, xmlAsString, kmlBlob, newBlobUrl, newLayer;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _i = 0, _a = loadedData.data;
                    _e.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    blobUrl = _a[_i];
                    index = loadedData.data.indexOf(blobUrl);
                    _b = form.value.fileOptions[index], layerName = _b.layerName, selectedFolders = _b.selectedFolders, indeterminateFolders = _b.indeterminateFolders;
                    parsedKmlData = parsedDataMap.value.get(blobUrl);
                    if (!parsedKmlData)
                        return [3 /*break*/, 3];
                    kmlDom = parsedKmlData.kmlDom, folders = parsedKmlData.folders;
                    // remove unselected folders from the DOM
                    for (_c = 0, folders_1 = folders; _c < folders_1.length; _c++) {
                        folderElement = folders_1[_c][0];
                        if (!selectedFolders.has(folderElement) &&
                            !indeterminateFolders.has(folderElement)) {
                            (_d = folderElement.parentElement) === null || _d === void 0 ? void 0 : _d.removeChild(folderElement);
                        }
                    }
                    xmlAsString = new XMLSerializer().serializeToString(kmlDom);
                    kmlBlob = new Blob([xmlAsString], {
                        type: "application/vnd.google-earth.kml+xml",
                    });
                    newBlobUrl = URL.createObjectURL(kmlBlob);
                    URL.revokeObjectURL(blobUrl);
                    newLayer = geo.addMapLayer({
                        url: newBlobUrl,
                        name: layerName || "KML Layer ".concat(index + 1),
                        extractStyles: form.value.extractStyles,
                        showPointNames: form.value.showPointNames,
                        id: (0, utils_1.nanoid)(),
                        type: "KMLLayer",
                    });
                    return [4 /*yield*/, onImageLayerSelectHook.trigger({ layerId: newLayer.id })];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    emit("loaded");
                    return [2 /*return*/];
            }
        });
    });
}
function onCancel() {
    emit("cancel");
}
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var fileInfoArray, _i, _a, _b, index, blobUrl, kmlDom, folders;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                isProcessing.value = true;
                fileInfoArray = [];
                _i = 0, _a = loadedData.data.entries();
                _e.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                _b = _a[_i], index = _b[0], blobUrl = _b[1];
                return [4 /*yield*/, (0, kml_1.getKmlAsDom)(blobUrl)];
            case 2:
                kmlDom = _e.sent();
                folders = new Map((0, kml_1.getKmlFolders)(kmlDom));
                parsedDataMap.value.set(blobUrl, {
                    folders: folders,
                    kmlDom: kmlDom,
                });
                fileInfoArray.push({
                    layerName: (0, files_1.stripFileExtension)((_d = (_c = loadedData.fileInfo[index]) === null || _c === void 0 ? void 0 : _c.fileName) !== null && _d !== void 0 ? _d : "KML Layer ".concat(index + 1)),
                    selectedFolders: new Set(__spreadArray([], folders.keys(), true)),
                    indeterminateFolders: new Set(),
                });
                _e.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                form.value.fileOptions = fileInfoArray;
                isProcessing.value = false;
                (0, vue_1.triggerRef)(parsedDataMap);
                return [2 /*return*/];
        }
    });
}); });
function toggleSelectedFolders(fileImportOptions) {
    var _a;
    var selectedFolders = fileImportOptions.selectedFolders, indeterminateFolders = fileImportOptions.indeterminateFolders;
    if (selectedFolders.size) {
        selectedFolders.clear();
        indeterminateFolders.clear();
        return;
    }
    var index = form.value.fileOptions.indexOf(fileImportOptions);
    for (var _i = 0, _b = ((_a = parsedDataMap.value.get(loadedData.data[index])) === null || _a === void 0 ? void 0 : _a.folders) || []; _i < _b.length; _i++) {
        var k = _b[_i][0];
        selectedFolders.add(k);
    }
}
function updateSelectedFolders(element, _a, value) {
    var selectedFolders = _a.selectedFolders, indeterminateFolders = _a.indeterminateFolders;
    var parentFolder = element.parentElement;
    if (value === true) {
        selectedFolders.add(element);
        indeterminateFolders.delete(element);
        var childFolders = (0, kml_1.getAllChildFoldersFromElement)(element);
        for (var _i = 0, childFolders_1 = childFolders; _i < childFolders_1.length; _i++) {
            var child = childFolders_1[_i];
            selectedFolders.add(child);
            indeterminateFolders.delete(child);
        }
    }
    else if (value === false) {
        selectedFolders.delete(element);
        var childFolders = (0, kml_1.getAllChildFoldersFromElement)(element);
        for (var _b = 0, childFolders_2 = childFolders; _b < childFolders_2.length; _b++) {
            var child = childFolders_2[_b];
            selectedFolders.delete(child);
            indeterminateFolders.delete(child);
        }
    }
    if (parentFolder) {
        indeterminateFolders.add(parentFolder);
    }
    else {
    }
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import KML",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import KML",
        helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
        hasSidebar: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.actions;
    if (__VLS_ctx.isProcessing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground flex items-center gap-2 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        var __VLS_8 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Spinner} */
        spinner_1.Spinner;
        // @ts-ignore
        var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
        var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_9), false));
    }
    var __VLS_13 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = void 0;
    var __VLS_19 = ({ click: {} },
        { onClick: (__VLS_ctx.onCancel) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_20 = __VLS_16.slots.default;
    // @ts-ignore
    [isProcessing, onCancel,];
    var __VLS_16;
    var __VLS_17;
    var __VLS_21 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_22), false));
    var __VLS_26 = void 0;
    var __VLS_27 = ({ click: {} },
        { onClick: (__VLS_ctx.onLoad) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_28 = __VLS_24.slots.default;
    // @ts-ignore
    [onLoad,];
    var __VLS_24;
    var __VLS_25;
    // @ts-ignore
    [];
}
{
    var __VLS_29 = __VLS_3.slots.sidebar;
    if (!__VLS_ctx.isProcessing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-6" }));
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        var _loop_1 = function (fileFormData, index) {
            (index);
            var __VLS_30 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
            field_1.Field;
            // @ts-ignore
            var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
            var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
            var __VLS_35 = __VLS_33.slots.default;
            var __VLS_36 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
            field_1.FieldLabel;
            // @ts-ignore
            var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
                for: "layerName-0",
            }));
            var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
                    for: "layerName-0",
                }], __VLS_functionalComponentArgsRest(__VLS_37), false));
            var __VLS_41 = __VLS_39.slots.default;
            // @ts-ignore
            [isProcessing, form,];
            var __VLS_42 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Input} */
            input_1.Input;
            // @ts-ignore
            var __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                id: ("layerName-".concat(index)),
                modelValue: (fileFormData.layerName),
            }));
            var __VLS_44 = __VLS_43.apply(void 0, __spreadArray([{
                    id: ("layerName-".concat(index)),
                    modelValue: (fileFormData.layerName),
                }], __VLS_functionalComponentArgsRest(__VLS_43), false));
            var __VLS_47 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
            field_1.FieldDescription;
            // @ts-ignore
            var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
            var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_48), false));
            var __VLS_52 = __VLS_50.slots.default;
            ((_a = loadedData.fileInfo[index]) === null || _a === void 0 ? void 0 : _a.fileName);
            // @ts-ignore
            [];
            var __VLS_53 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Collapsible | typeof __VLS_components.Collapsible} */
            collapsible_1.Collapsible;
            // @ts-ignore
            var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({}));
            var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_54), false));
            {
                var __VLS_58 = __VLS_56.slots.default;
                var open_1 = __VLS_vSlot(__VLS_58)[0].open;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                var __VLS_59 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.CollapsibleTrigger | typeof __VLS_components.CollapsibleTrigger} */
                collapsible_1.CollapsibleTrigger;
                // @ts-ignore
                var __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59(__assign({ asChild: true }, { class: "group" })));
                var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign({ asChild: true }, { class: "group" })], __VLS_functionalComponentArgsRest(__VLS_60), false));
                /** @type {__VLS_StyleScopedClasses['group']} */ ;
                var __VLS_64 = __VLS_62.slots.default;
                var __VLS_65 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
                button_1.Button;
                // @ts-ignore
                var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                    type: "button",
                    variant: "outline",
                    size: "sm",
                }));
                var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{
                        type: "button",
                        variant: "outline",
                        size: "sm",
                    }], __VLS_functionalComponentArgsRest(__VLS_66), false));
                var __VLS_70 = __VLS_68.slots.default;
                var __VLS_71 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.ChevronRightIcon} */
                lucide_vue_next_1.ChevronRightIcon;
                // @ts-ignore
                var __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71(__assign({ class: "transition-transform group-data-[state=open]:rotate-90" })));
                var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ class: "transition-transform group-data-[state=open]:rotate-90" })], __VLS_functionalComponentArgsRest(__VLS_72), false));
                /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-data-[state=open]:rotate-90']} */ ;
                // @ts-ignore
                [];
                // @ts-ignore
                [];
                if (open_1) {
                    var __VLS_76 = void 0;
                    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
                    button_1.Button;
                    // @ts-ignore
                    var __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76(__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })));
                    var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "button", variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_77), false));
                    var __VLS_81 = void 0;
                    var __VLS_82 = ({ click: {} },
                        { onClick: function () {
                                var _a = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    _a[_i] = arguments[_i];
                                }
                                var $event = _a[0];
                                if (!(!__VLS_ctx.isProcessing))
                                    return;
                                if (!(open_1))
                                    return;
                                __VLS_ctx.toggleSelectedFolders(fileFormData);
                                // @ts-ignore
                                [toggleSelectedFolders,];
                            } });
                    var __VLS_83 = __VLS_79.slots.default;
                    // @ts-ignore
                    [];
                }
                var __VLS_84 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.CollapsibleContent | typeof __VLS_components.CollapsibleContent} */
                collapsible_1.CollapsibleContent;
                // @ts-ignore
                var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84(__assign({ class: "mt-4 grid grid-cols-1 gap-2" })));
                var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ class: "mt-4 grid grid-cols-1 gap-2" })], __VLS_functionalComponentArgsRest(__VLS_85), false));
                /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                var __VLS_89 = __VLS_87.slots.default;
                var _loop_2 = function (k, v, i) {
                    var __VLS_90 = InputCheckbox_vue_1.default;
                    // @ts-ignore
                    var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90(__assign({ 'onUpdate:modelValue': {} }, { label: (v), key: (i), modelValue: (fileFormData.indeterminateFolders.has(k)
                            ? 'indeterminate'
                            : fileFormData.selectedFolders.has(k)) })));
                    var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([__assign({ 'onUpdate:modelValue': {} }, { label: (v), key: (i), modelValue: (fileFormData.indeterminateFolders.has(k)
                                ? 'indeterminate'
                                : fileFormData.selectedFolders.has(k)) })], __VLS_functionalComponentArgsRest(__VLS_91), false));
                    var __VLS_95 = void 0;
                    var __VLS_96 = ({ 'update:modelValue': {} },
                        { 'onUpdate:modelValue': (function (val) {
                                __VLS_ctx.updateSelectedFolders(k, fileFormData, val);
                            }) });
                    // @ts-ignore
                    [parsedDataMap, updateSelectedFolders,];
                };
                for (var _e = 0, _f = __VLS_vFor(((_b = __VLS_ctx.parsedDataMap.get(loadedData.data[index])) === null || _b === void 0 ? void 0 : _b.folders)); _e < _f.length; _e++) {
                    var _g = _f[_e], _h = _g[0], k = _h[0], v = _h[1], i = _g[1];
                    _loop_2(k, v, i);
                }
                // @ts-ignore
                [];
                // @ts-ignore
                [];
                __VLS_56.slots['' /* empty slot name completion */];
            }
            // @ts-ignore
            [];
            var __VLS_97 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldSeparator} */
            field_1.FieldSeparator;
            // @ts-ignore
            var __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({}));
            var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_98), false));
            // @ts-ignore
            [];
        };
        var __VLS_39, __VLS_50, __VLS_68, __VLS_62, __VLS_79, __VLS_80, __VLS_93, __VLS_94, __VLS_87, __VLS_56, __VLS_33;
        for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.form.fileOptions)); _i < _c.length; _i++) {
            var _d = _c[_i], fileFormData = _d[0], index = _d[1];
            _loop_1(fileFormData, index);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        var __VLS_102 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102(__assign({ orientation: "horizontal" }, { class: "" })));
        var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([__assign({ orientation: "horizontal" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_103), false));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        var __VLS_107 = __VLS_105.slots.default;
        var __VLS_108 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Checkbox} */
        checkbox_1.Checkbox;
        // @ts-ignore
        var __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            modelValue: (__VLS_ctx.form.extractStyles),
            id: "extractStyles",
        }));
        var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.form.extractStyles),
                id: "extractStyles",
            }], __VLS_functionalComponentArgsRest(__VLS_109), false));
        var __VLS_113 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({}));
        var __VLS_115 = __VLS_114.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_114), false));
        var __VLS_118 = __VLS_116.slots.default;
        var __VLS_119 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
            for: "extractStyles",
        }));
        var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([{
                for: "extractStyles",
            }], __VLS_functionalComponentArgsRest(__VLS_120), false));
        var __VLS_124 = __VLS_122.slots.default;
        // @ts-ignore
        [form,];
        var __VLS_122;
        var __VLS_125 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
        field_1.FieldDescription;
        // @ts-ignore
        var __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({}));
        var __VLS_127 = __VLS_126.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_126), false));
        var __VLS_130 = __VLS_128.slots.default;
        // @ts-ignore
        [];
        var __VLS_128;
        // @ts-ignore
        [];
        var __VLS_116;
        // @ts-ignore
        [];
        var __VLS_105;
        var __VLS_131 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131(__assign({ orientation: "horizontal" }, { class: "" })));
        var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([__assign({ orientation: "horizontal" }, { class: "" })], __VLS_functionalComponentArgsRest(__VLS_132), false));
        /** @type {__VLS_StyleScopedClasses['']} */ ;
        var __VLS_136 = __VLS_134.slots.default;
        var __VLS_137 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Checkbox} */
        checkbox_1.Checkbox;
        // @ts-ignore
        var __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
            modelValue: (__VLS_ctx.form.showPointNames),
            id: "showPointNames",
        }));
        var __VLS_139 = __VLS_138.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.form.showPointNames),
                id: "showPointNames",
            }], __VLS_functionalComponentArgsRest(__VLS_138), false));
        var __VLS_142 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({}));
        var __VLS_144 = __VLS_143.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_143), false));
        var __VLS_147 = __VLS_145.slots.default;
        var __VLS_148 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
            for: "showPointNames",
        }));
        var __VLS_150 = __VLS_149.apply(void 0, __spreadArray([{
                for: "showPointNames",
            }], __VLS_functionalComponentArgsRest(__VLS_149), false));
        var __VLS_153 = __VLS_151.slots.default;
        // @ts-ignore
        [form,];
        var __VLS_151;
        var __VLS_154 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
        field_1.FieldDescription;
        // @ts-ignore
        var __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({}));
        var __VLS_156 = __VLS_155.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_155), false));
        var __VLS_159 = __VLS_157.slots.default;
        // @ts-ignore
        [];
        var __VLS_157;
        // @ts-ignore
        [];
        var __VLS_145;
        // @ts-ignore
        [];
        var __VLS_134;
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 p-6" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
var __VLS_160 = ImportedFileList_vue_1.default;
// @ts-ignore
var __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
    importData: (loadedData),
}));
var __VLS_162 = __VLS_161.apply(void 0, __spreadArray([{
        importData: (loadedData),
    }], __VLS_functionalComponentArgsRest(__VLS_161), false));
var __VLS_165 = AlertWarning_vue_1.default || AlertWarning_vue_1.default;
// @ts-ignore
var __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    title: "Warning",
}));
var __VLS_167 = __VLS_166.apply(void 0, __spreadArray([{
        title: "Warning",
    }], __VLS_functionalComponentArgsRest(__VLS_166), false));
var __VLS_170 = __VLS_168.slots.default;
// @ts-ignore
[];
var __VLS_168;
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
