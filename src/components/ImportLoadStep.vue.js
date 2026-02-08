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
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var notifications_1 = require("@/composables/notifications");
var nprogress_1 = require("nprogress");
var core_1 = require("@vueuse/core");
var importExportStore_1 = require("@/stores/importExportStore");
var scenarioImport_1 = require("@/composables/scenarioImport");
var fileHandling_1 = require("@/importexport/fileHandling");
var dragStore_1 = require("@/stores/dragStore");
var utils_1 = require("@/utils");
var ImportLoadStepBrowser_vue_1 = require("@/modules/scenarioeditor/ImportLoadStepBrowser.vue");
var button_1 = require("@/components/ui/button");
var field_1 = require("@/components/ui/field");
var radio_group_1 = require("@/components/ui/radio-group");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var input_1 = require("@/components/ui/input");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var emit = defineEmits();
var formatItems = [
    { label: "MilX", value: "milx" },
    { label: "GeoJSON", value: "geojson" },
    { label: "Spatial Illusions ORBAT builder", value: "unitgenerator" },
    { label: "Order of Battle Generator", value: "orbatgenerator" },
    { label: "KML/KMZ", value: "kml" },
    { label: "XLSX", value: "xlsx" },
];
var sourceItems = [
    { label: "Local file", value: "file", description: "Upload from your computer" },
    { label: "URL", value: "url", description: "Load from a web address" },
    { label: "Browser", value: "browser", description: "Open a saved scenario" },
    { label: "Paste text", value: "string", description: "Paste raw data directly" },
];
var stringSource = (0, vue_1.ref)("");
var urlSource = (0, vue_1.ref)("");
var currentFilename = (0, vue_1.ref)("");
var objectUrl = (0, vue_1.ref)("");
var fileInfo = (0, vue_1.shallowRef)();
var fileInfos = (0, vue_1.shallowRef)([]);
var isError = (0, vue_1.ref)(false);
var errorMessage = (0, vue_1.ref)("");
var store = (0, importExportStore_1.useImportStore)();
var dragStore = (0, dragStore_1.useDragStore)();
var dropZoneRef = (0, vue_1.ref)();
var isOverDropZone = (0, core_1.useDropZone)(dropZoneRef, onDrop).isOverDropZone;
var guessedFormat = (0, vue_1.ref)("unknown");
var form = (0, vue_1.ref)({
    format: store.format,
    includeFeatures: false,
    includeUnits: true,
    fileName: "scenario.geojson",
    embedIcons: true,
    useShortName: true,
});
var send = (0, notifications_1.useNotifications)().send;
var isMilx = (0, vue_1.computed)(function () { return form.value.format === "milx"; });
var isGeojson = (0, vue_1.computed)(function () { return form.value.format === "geojson"; });
var isUnitGenerator = (0, vue_1.computed)(function () { return form.value.format === "unitgenerator"; });
var isOrbatGenerator = (0, vue_1.computed)(function () { return form.value.format === "orbatgenerator"; });
var _a = (0, scenarioImport_1.useScenarioImport)(), importMilxString = _a.importMilxString, importJsonString = _a.importJsonString;
function onBrowserLoad(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fileInfo.value = {
                format: "orbatmapper",
                dataAsString: "",
                objectUrl: "",
                isInvalid: false,
                errors: [],
                dialect: "unknown",
                isZipped: false,
                isJson: false,
                fileName: "indexed-db",
                hasMultipleFiles: false,
                fileSize: 0,
            };
            emit("loaded", "orbatmapper", data, fileInfo.value);
            return [2 /*return*/];
        });
    });
}
function onLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var format, data, kmls, data, data, data, data, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = form.value.format;
                    nprogress_1.default.start();
                    if (!(format === "milx" && stringSource.value)) return [3 /*break*/, 2];
                    return [4 /*yield*/, importMilxString(stringSource.value)];
                case 1:
                    data = _a.sent();
                    send({ message: "Loaded data as ".concat(format) });
                    nprogress_1.default.done();
                    emit("loaded", "milx", data, fileInfo.value);
                    _a.label = 2;
                case 2:
                    if (format === "kml" && stringSource.value) {
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        kmls = fileInfos.value.filter(function (f) { return f.format === "kml"; });
                        emit("lod", {
                            format: "kml",
                            data: kmls.map(function (d) { return d.objectUrl; }),
                            fileInfo: fileInfos.value,
                        });
                    }
                    if (format === "image" && objectUrl.value) {
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        emit("loaded", "image", objectUrl.value, fileInfo.value);
                    }
                    if (format === "geojson" && stringSource.value) {
                        data = importJsonString(stringSource.value);
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        emit("loaded", "geojson", data, fileInfo.value);
                    }
                    if (format === "unitgenerator" && stringSource.value) {
                        data = importJsonString(stringSource.value);
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        console.log(data);
                        emit("loaded", "unitgenerator", data, fileInfo.value);
                    }
                    if (format === "orbatgenerator" && stringSource.value) {
                        data = importJsonString(stringSource.value);
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        emit("loaded", "orbatgenerator", data, fileInfo.value);
                    }
                    if (format === "orbatmapper" && stringSource.value) {
                        data = importJsonString(stringSource.value);
                        nprogress_1.default.done();
                        emit("loaded", "orbatmapper", data, fileInfo.value);
                    }
                    if (format === "orbatmapper-encrypted" && stringSource.value) {
                        data = importJsonString(stringSource.value);
                        nprogress_1.default.done();
                        emit("loaded", "orbatmapper-encrypted", data, fileInfo.value);
                    }
                    if (format === "xlsx" && stringSource.value) {
                        send({ message: "Loaded data as ".concat(format) });
                        emit("loaded", "xlsx", stringSource.value, fileInfo.value);
                    }
                    if (format === "csv" && stringSource.value) {
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        emit("loaded", "csv", stringSource.value, fileInfo.value);
                    }
                    if (format === "tsv" && stringSource.value) {
                        send({ message: "Loaded data as ".concat(format) });
                        nprogress_1.default.done();
                        emit("loaded", "tsv", stringSource.value, fileInfo.value);
                    }
                    nprogress_1.default.done();
                    return [2 /*return*/];
            }
        });
    });
}
function onDrop(files) {
    if (files) {
        handleFiles(files);
        dragStore.draggedFiles = null;
    }
}
var onFileLoad = function (e) {
    var _a;
    var target = e.target;
    if (!((_a = target === null || target === void 0 ? void 0 : target.files) === null || _a === void 0 ? void 0 : _a.length))
        return;
    handleFiles(Array.from(target.files));
};
var onUrlLoad = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, response, buffer, file, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = urlSource.value;
                if (!url)
                    return [2 /*return*/];
                if (!(0, utils_1.isUrl)(url)) {
                    isError.value = true;
                    errorMessage.value = "The url ".concat(url, " is not a valid url.");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, fetch(url)];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.arrayBuffer()];
            case 3:
                buffer = _a.sent();
                file = new File([buffer], url.split("/").pop() || "", {
                    type: response.headers.get("Content-Type") || "",
                });
                return [4 /*yield*/, handleFiles([file])];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                send({ message: "Failed to load ".concat(url, ": ").concat(e_1 === null || e_1 === void 0 ? void 0 : e_1.message) });
                isError.value = true;
                errorMessage.value = "Failed to load ".concat(url, ": ").concat(e_1 === null || e_1 === void 0 ? void 0 : e_1.message);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
function handleFiles(files) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, files_1, f, _a, _b, info, file;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fileInfos.value = [];
                    _i = 0, files_1 = files;
                    _c.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    f = files_1[_i];
                    _b = (_a = fileInfos.value).push;
                    return [4 /*yield*/, (0, fileHandling_1.guessImportFormat)(f)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    info = fileInfos.value[0];
                    file = files[0];
                    currentFilename.value = file.name;
                    fileInfo.value = info;
                    if (info.isInvalid) {
                        info.errors.forEach(function (message) { return send({ message: message }); });
                        return [2 /*return*/];
                    }
                    stringSource.value = info.dataAsString;
                    objectUrl.value = info.objectUrl;
                    guessedFormat.value = info.format;
                    if (!(info.format !== "unknown")) return [3 /*break*/, 6];
                    form.value.format = info.format;
                    return [4 /*yield*/, onLoad()];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
(0, vue_1.onMounted)(function () {
    if (dragStore.draggedFiles)
        onDrop(dragStore.draggedFiles);
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import data",
    subtitle: "Import data for use in your scenario",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import data",
        subtitle: "Import data for use in your scenario",
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
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true, disabled: (!__VLS_ctx.stringSource) }), { class: "flex-1 sm:flex-none" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true, disabled: (!__VLS_ctx.stringSource) }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ click: {} },
        { onClick: (__VLS_ctx.onLoad) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_23 = __VLS_19.slots.default;
    // @ts-ignore
    [stringSource, onLoad,];
    var __VLS_19;
    var __VLS_20;
    // @ts-ignore
    [];
}
{
    var __VLS_24 = __VLS_3.slots.sidebar;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
    field_1.FieldSet;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = __VLS_28.slots.default;
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = __VLS_34.slots.default;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_38), false));
    var __VLS_42 = __VLS_40.slots.default;
    // @ts-ignore
    [];
    var __VLS_40;
    var __VLS_43 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
    radio_group_1.RadioGroup;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ modelValue: (__VLS_ctx.store.inputSource) }, { class: "mt-3 flex flex-col gap-2" })));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.store.inputSource) }, { class: "mt-3 flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_44), false));
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_48 = __VLS_46.slots.default;
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.sourceItems)); _i < _b.length; _i++) {
        var item = _b[_i][0];
        var __VLS_49 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            key: (item.value),
            for: (item.value),
        }));
        var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{
                key: (item.value),
                for: (item.value),
            }], __VLS_functionalComponentArgsRest(__VLS_50), false));
        var __VLS_54 = __VLS_52.slots.default;
        var __VLS_55 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            orientation: "horizontal",
        }));
        var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{
                orientation: "horizontal",
            }], __VLS_functionalComponentArgsRest(__VLS_56), false));
        var __VLS_60 = __VLS_58.slots.default;
        var __VLS_61 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({}));
        var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_62), false));
        var __VLS_66 = __VLS_64.slots.default;
        var __VLS_67 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
        field_1.FieldTitle;
        // @ts-ignore
        var __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
        var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_68), false));
        var __VLS_72 = __VLS_70.slots.default;
        (item.label);
        // @ts-ignore
        [store, sourceItems,];
        var __VLS_70;
        var __VLS_73 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
        field_1.FieldDescription;
        // @ts-ignore
        var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({}));
        var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_74), false));
        var __VLS_78 = __VLS_76.slots.default;
        (item.description);
        // @ts-ignore
        [];
        var __VLS_76;
        // @ts-ignore
        [];
        var __VLS_64;
        var __VLS_79 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            id: (item.value),
            value: (item.value),
        }));
        var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{
                id: (item.value),
                value: (item.value),
            }], __VLS_functionalComponentArgsRest(__VLS_80), false));
        // @ts-ignore
        [];
        var __VLS_58;
        // @ts-ignore
        [];
        var __VLS_52;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_46;
    // @ts-ignore
    [];
    var __VLS_28;
    if (__VLS_ctx.stringSource) {
        var __VLS_84 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
        field_1.FieldSet;
        // @ts-ignore
        var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84(__assign({ class: "space-y-3" })));
        var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ class: "space-y-3" })], __VLS_functionalComponentArgsRest(__VLS_85), false));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        var __VLS_89 = __VLS_87.slots.default;
        var __VLS_90 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({}));
        var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_91), false));
        var __VLS_95 = __VLS_93.slots.default;
        // @ts-ignore
        [stringSource,];
        var __VLS_93;
        if (__VLS_ctx.guessedFormat) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-accent-foreground font-medium" }));
            /** @type {__VLS_StyleScopedClasses['text-accent-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.guessedFormat);
        }
        var __VLS_96 = SimpleSelect_vue_1.default;
        // @ts-ignore
        var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            label: "Override format",
            items: (__VLS_ctx.formatItems),
            modelValue: (__VLS_ctx.form.format),
        }));
        var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([{
                label: "Override format",
                items: (__VLS_ctx.formatItems),
                modelValue: (__VLS_ctx.form.format),
            }], __VLS_functionalComponentArgsRest(__VLS_97), false));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "prose prose-sm dark:prose-invert" }));
        /** @type {__VLS_StyleScopedClasses['prose']} */ ;
        /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:prose-invert']} */ ;
        if (__VLS_ctx.isMilx) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: "https://www.map.army/",
            });
        }
        else if (__VLS_ctx.isGeojson) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
        else if (__VLS_ctx.isUnitGenerator) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: "https://spatialillusions.com/unitgenerator2/",
                target: "_blank",
            });
        }
        else if (__VLS_ctx.isOrbatGenerator) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: "https://www.orbatgenerator.com/",
                target: "_blank",
            });
        }
        if (__VLS_ctx.isMilx) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
            /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        }
        // @ts-ignore
        [guessedFormat, guessedFormat, formatItems, form, isMilx, isMilx, isGeojson, isUnitGenerator, isOrbatGenerator,];
        var __VLS_87;
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full min-h-0 flex-col" }, { ref: "dropZoneRef" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
if (__VLS_ctx.store.inputSource === 'file') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex min-h-0 flex-1 flex-col p-6" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "hover:border-muted-foreground relative flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2" }, { class: (__VLS_ctx.isOverDropZone ? 'cursor-crosshair border-green-500' : '') }));
    /** @type {__VLS_StyleScopedClasses['hover:border-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-offset-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-within:ring-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign({ onChange: (__VLS_ctx.onFileLoad) }, { type: "file", id: "file", multiple: true }), { class: "absolute inset-0 opacity-0" }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ for: "file" }, { class: "hover:text-accent-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2" }));
    /** @type {__VLS_StyleScopedClasses['hover:text-accent-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base" }));
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    if (__VLS_ctx.currentFilename) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-accent-foreground font-mono" }));
        /** @type {__VLS_StyleScopedClasses['text-accent-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.currentFilename);
    }
}
else if (__VLS_ctx.store.inputSource === 'string') {
    var __VLS_101 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101(__assign({ class: "min-h-0 flex-1 p-6" })));
    var __VLS_103 = __VLS_102.apply(void 0, __spreadArray([__assign({ class: "min-h-0 flex-1 p-6" })], __VLS_functionalComponentArgsRest(__VLS_102), false));
    /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    var __VLS_106 = __VLS_104.slots.default;
    var __VLS_107 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        for: "rawText",
    }));
    var __VLS_109 = __VLS_108.apply(void 0, __spreadArray([{
            for: "rawText",
        }], __VLS_functionalComponentArgsRest(__VLS_108), false));
    var __VLS_112 = __VLS_110.slots.default;
    // @ts-ignore
    [store, store, isOverDropZone, onFileLoad, currentFilename, currentFilename,];
    var __VLS_110;
    var __VLS_113 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Textarea} */
    textarea_1.Textarea;
    // @ts-ignore
    var __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113(__assign({ id: "rawText" }, { class: "min-h-0 flex-1" })));
    var __VLS_115 = __VLS_114.apply(void 0, __spreadArray([__assign({ id: "rawText" }, { class: "min-h-0 flex-1" })], __VLS_functionalComponentArgsRest(__VLS_114), false));
    /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    var __VLS_118 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
    var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_119), false));
    var __VLS_123 = __VLS_121.slots.default;
    // @ts-ignore
    [];
    var __VLS_121;
    // @ts-ignore
    [];
    var __VLS_104;
}
else if (__VLS_ctx.store.inputSource === 'url') {
    var __VLS_124 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124(__assign({ class: "flex-1 p-6" })));
    var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ class: "flex-1 p-6" })], __VLS_functionalComponentArgsRest(__VLS_125), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    var __VLS_129 = __VLS_127.slots.default;
    var __VLS_130 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        for: "urlSource",
    }));
    var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([{
            for: "urlSource",
        }], __VLS_functionalComponentArgsRest(__VLS_131), false));
    var __VLS_135 = __VLS_133.slots.default;
    // @ts-ignore
    [store,];
    var __VLS_133;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_136 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Input} */
    input_1.Input;
    // @ts-ignore
    var __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
        id: "urlSource",
        modelValue: (__VLS_ctx.urlSource),
        type: "text",
    }));
    var __VLS_138 = __VLS_137.apply(void 0, __spreadArray([{
            id: "urlSource",
            modelValue: (__VLS_ctx.urlSource),
            type: "text",
        }], __VLS_functionalComponentArgsRest(__VLS_137), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "shrink-0" }));
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    var __VLS_141 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141(__assign({ 'onClick': {} }, { variant: "outline" })));
    var __VLS_143 = __VLS_142.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline" })], __VLS_functionalComponentArgsRest(__VLS_142), false));
    var __VLS_146 = void 0;
    var __VLS_147 = ({ click: {} },
        { onClick: (__VLS_ctx.onUrlLoad) });
    var __VLS_148 = __VLS_144.slots.default;
    // @ts-ignore
    [urlSource, onUrlLoad,];
    var __VLS_144;
    var __VLS_145;
    var __VLS_149 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({}));
    var __VLS_151 = __VLS_150.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_150), false));
    var __VLS_154 = __VLS_152.slots.default;
    // @ts-ignore
    [];
    var __VLS_152;
    // @ts-ignore
    [];
    var __VLS_127;
}
else if (__VLS_ctx.store.inputSource === 'browser') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-0 flex-1 overflow-y-auto" }));
    /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    var __VLS_155 = ImportLoadStepBrowser_vue_1.default;
    // @ts-ignore
    var __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155(__assign({ 'onLoaded': {} })));
    var __VLS_157 = __VLS_156.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} })], __VLS_functionalComponentArgsRest(__VLS_156), false));
    var __VLS_160 = void 0;
    var __VLS_161 = ({ loaded: {} },
        { onLoaded: (__VLS_ctx.onBrowserLoad) });
    var __VLS_158;
    var __VLS_159;
}
if ((__VLS_ctx.isError && __VLS_ctx.errorMessage) || __VLS_ctx.objectUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "px-6 pb-6" }));
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    if (__VLS_ctx.isError && __VLS_ctx.errorMessage) {
        var __VLS_162 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Alert | typeof __VLS_components.Alert} */
        alert_1.Alert;
        // @ts-ignore
        var __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
            variant: "destructive",
        }));
        var __VLS_164 = __VLS_163.apply(void 0, __spreadArray([{
                variant: "destructive",
            }], __VLS_functionalComponentArgsRest(__VLS_163), false));
        var __VLS_167 = __VLS_165.slots.default;
        var __VLS_168 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertCircleIcon} */
        lucide_vue_next_1.AlertCircleIcon;
        // @ts-ignore
        var __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
        var __VLS_170 = __VLS_169.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_169), false));
        var __VLS_173 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertTitle | typeof __VLS_components.AlertTitle} */
        alert_1.AlertTitle;
        // @ts-ignore
        var __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({}));
        var __VLS_175 = __VLS_174.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_174), false));
        var __VLS_178 = __VLS_176.slots.default;
        // @ts-ignore
        [store, onBrowserLoad, isError, isError, errorMessage, errorMessage, objectUrl,];
        var __VLS_176;
        var __VLS_179 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.AlertDescription | typeof __VLS_components.AlertDescription} */
        alert_1.AlertDescription;
        // @ts-ignore
        var __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({}));
        var __VLS_181 = __VLS_180.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_180), false));
        var __VLS_184 = __VLS_182.slots.default;
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
        var __VLS_182;
        // @ts-ignore
        [];
        var __VLS_165;
    }
    if (__VLS_ctx.objectUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ src: (__VLS_ctx.objectUrl), alt: "Loaded image" }, { class: "mt-4 max-h-64" }));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-64']} */ ;
    }
}
// @ts-ignore
[objectUrl, objectUrl,];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
});
exports.default = {};
