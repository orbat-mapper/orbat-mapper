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
var lucide_vue_next_1 = require("lucide-vue-next");
var button_1 = require("@/components/ui/button");
var textarea_1 = require("@/components/ui/textarea");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var components_1 = require("@vueuse/components");
var core_1 = require("@vueuse/core");
var OrbatTreeNode_vue_1 = require("@/views/texttoorbat/OrbatTreeNode.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var IconBrowserModal_vue_1 = require("@/views/texttoorbat/IconBrowserModal.vue");
var PatternMappingModal_vue_1 = require("@/views/texttoorbat/PatternMappingModal.vue");
var resizable_1 = require("@/components/ui/resizable");
var textToOrbat_ts_1 = require("@/views/texttoorbat/textToOrbat.ts");
var notifications_1 = require("@/composables/notifications");
var files_1 = require("@/utils/files");
var scenariostore_1 = require("@/scenariostore");
var names_1 = require("@/router/names");
var localdb_1 = require("@/scenariostore/localdb");
var originalTitle = (0, core_1.useTitle)().value;
(0, core_1.useTitle)("Text to ORBAT");
var breakpoints = (0, core_1.useBreakpoints)(core_1.breakpointsTailwind);
var isMobile = breakpoints.smallerOrEqual("sm");
var showDebug = (0, vue_1.ref)(false);
var showIconBrowser = (0, vue_1.ref)(false);
var showPatternMapping = (0, vue_1.ref)(false);
var isOpeningScenario = (0, vue_1.ref)(false);
var inputText = (0, vue_1.ref)("1st Infantry Division\n" +
    "  1st Brigade\n" +
    "    1st Tank Battalion\n" +
    "    2nd Art Battalion\n" +
    "  2nd Cdo Btn\n" +
    "    3rd RA\n" +
    "    4th Eng \n" +
    "  Artillery Coy");
// Indentation configuration: number of spaces to insert for a tab (from utils)
var INDENT = " ".repeat(textToOrbat_ts_1.INDENT_SIZE);
function handleTab(event) {
    var textarea = event.target;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    // Insert spaces (configured by INDENT_SIZE) at cursor position instead of a literal tab
    inputText.value =
        inputText.value.substring(0, start) + INDENT + inputText.value.substring(end);
    // Move cursor after the inserted indent
    (0, vue_1.nextTick)(function () {
        textarea.selectionStart = textarea.selectionEnd = start + textToOrbat_ts_1.INDENT_SIZE;
    });
}
// Insert a newline and preserve leading indentation of the current line
function handleEnter(event) {
    var textarea = event.target;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var val = inputText.value;
    // Find start index of the current line
    var lastNewline = val.lastIndexOf("\n", start - 1);
    var lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    // Extract the text from lineStart up to cursor to detect leading whitespace
    var lineSlice = val.substring(lineStart, start);
    var indentMatch = lineSlice.match(/^[\t ]*/);
    var indent = indentMatch ? indentMatch[0] : "";
    // Replace selection with newline + indent
    inputText.value = val.substring(0, start) + "\n" + indent + val.substring(end);
    // Place cursor after the inserted indent
    (0, vue_1.nextTick)(function () {
        var pos = start + 1 + indent.length;
        textarea.selectionStart = textarea.selectionEnd = pos;
    });
}
// Remove one indentation level (tab or up to INDENT_SIZE spaces) from selected lines or current line
function handleShiftTab(event) {
    var _a;
    var textarea = event.target;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var val = inputText.value;
    // Determine the range of full lines to operate on
    var selLineStart = val.lastIndexOf("\n", start - 1) === -1 ? 0 : val.lastIndexOf("\n", start - 1) + 1;
    var selLineEndIdx = val.indexOf("\n", end);
    if (selLineEndIdx === -1)
        selLineEndIdx = val.length;
    var originalMiddle = val.substring(selLineStart, selLineEndIdx);
    var origLines = originalMiddle.split("\n");
    var removedPerLine = [];
    var newLines = origLines.map(function (line, idx) {
        if (line.length === 0) {
            removedPerLine[idx] = 0;
            return line;
        }
        if (line.startsWith("\t")) {
            // If the text contains literal tabs (from older content), remove a single tab
            removedPerLine[idx] = 1;
            return line.substring(1);
        }
        // count leading spaces
        var match = line.match(/^[ ]*/);
        var leadingSpaces = match ? match[0].length : 0;
        var remove = Math.min(leadingSpaces, textToOrbat_ts_1.INDENT_SIZE);
        removedPerLine[idx] = remove;
        return line.substring(remove);
    });
    var newMiddle = newLines.join("\n");
    inputText.value =
        val.substring(0, selLineStart) + newMiddle + val.substring(selLineEndIdx);
    // Calculate cursor/selection adjustment
    // Find cursor line index and column within originalMiddle
    var posWithin = start - selLineStart;
    var pos = 0;
    var cursorLine = origLines.length - 1;
    var cursorCol = 0;
    for (var i = 0; i < origLines.length; i++) {
        var l = origLines[i].length;
        if (posWithin <= pos + l) {
            cursorLine = i;
            cursorCol = posWithin - pos;
            break;
        }
        pos += l + 1; // +1 for newline
    }
    var removedBeforeCursor = removedPerLine.slice(0, cursorLine).reduce(function (a, b) { return a + b; }, 0) +
        Math.min((_a = removedPerLine[cursorLine]) !== null && _a !== void 0 ? _a : 0, cursorCol);
    var totalRemoved = removedPerLine.reduce(function (a, b) { return a + b; }, 0);
    var newStart = Math.max(0, start - removedBeforeCursor);
    var newEnd = Math.max(newStart, end - totalRemoved);
    (0, vue_1.nextTick)(function () {
        textarea.selectionStart = newStart;
        textarea.selectionEnd = newEnd;
    });
}
var parsedUnits = (0, vue_1.computed)(function () { return (0, textToOrbat_ts_1.parseTextToUnits)(inputText.value); });
var spatialIllusionsOrbat = (0, vue_1.computed)(function () {
    return (0, textToOrbat_ts_1.convertParsedUnitsToSpatialIllusions)(parsedUnits.value);
});
var orbatMapperScenario = (0, vue_1.computed)(function () {
    return (0, textToOrbat_ts_1.convertParsedUnitsToOrbatMapperScenario)(parsedUnits.value);
});
var sendNotification = (0, notifications_1.useNotifications)().send;
var router = (0, vue_router_1.useRouter)();
var scenario = (0, scenariostore_1.useScenario)().scenario;
function handleDownloadSpatialIllusions() {
    return __awaiter(this, void 0, void 0, function () {
        var payload, blob, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (parsedUnits.value.length === 0) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    payload = spatialIllusionsOrbat.value;
                    blob = new Blob([JSON.stringify(payload, null, 2)], {
                        type: "application/json",
                    });
                    return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(blob, "spatial-illusions-orbat.json", {
                            mimeTypes: ["application/json"],
                            extensions: [".json"],
                        })];
                case 2:
                    _a.sent();
                    sendNotification({ message: "Spatial Illusions JSON ready for download" });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sendNotification({
                        message: "Failed to download Spatial Illusions JSON",
                        type: "error",
                    });
                    console.error(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleDownloadOrbatMapperScenario() {
    return __awaiter(this, void 0, void 0, function () {
        var payload, blob, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (parsedUnits.value.length === 0) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    payload = orbatMapperScenario.value;
                    blob = new Blob([JSON.stringify(payload, null, 2)], {
                        type: "application/json",
                    });
                    return [4 /*yield*/, (0, files_1.saveBlobToLocalFile)(blob, "orbat-mapper-scenario.json", {
                            mimeTypes: ["application/json"],
                            extensions: [".json"],
                        })];
                case 2:
                    _a.sent();
                    sendNotification({ message: "ORBAT Mapper scenario ready for download" });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    sendNotification({
                        message: "Failed to download ORBAT Mapper scenario",
                        type: "error",
                    });
                    console.error(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleOpenScenario() {
    return __awaiter(this, void 0, void 0, function () {
        var payload, addScenario, storedScenario, scenarioId, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (parsedUnits.value.length === 0 || isOpeningScenario.value) {
                        return [2 /*return*/];
                    }
                    isOpeningScenario.value = true;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    payload = orbatMapperScenario.value;
                    scenario.value.io.loadFromObject(payload);
                    (_b = (_a = scenario.value.store).clearUndoRedoStack) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return [4 /*yield*/, (0, localdb_1.useIndexedDb)()];
                case 2:
                    addScenario = (_c.sent()).addScenario;
                    storedScenario = scenario.value.io.serializeToObject();
                    return [4 /*yield*/, addScenario(storedScenario, storedScenario.id)];
                case 3:
                    scenarioId = _c.sent();
                    return [4 /*yield*/, router.push({ name: names_1.MAP_EDIT_MODE_ROUTE, params: { scenarioId: scenarioId } })];
                case 4:
                    _c.sent();
                    sendNotification({ message: "Scenario opened in editor" });
                    return [3 /*break*/, 7];
                case 5:
                    error_3 = _c.sent();
                    sendNotification({
                        message: "Failed to open scenario",
                        type: "error",
                    });
                    console.error(error_3);
                    return [3 /*break*/, 7];
                case 6:
                    isOpeningScenario.value = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
(0, vue_1.onUnmounted)(function () {
    (0, core_1.useTitle)(originalTitle);
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-screen flex-col" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "bg-muted flex items-center justify-between border-b px-4 py-2" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ to: "/" }, { class: "text-muted-foreground hover:text-foreground" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ to: "/" }, { class: "text-muted-foreground hover:text-foreground" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeftIcon} */
lucide_vue_next_1.ArrowLeftIcon;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ class: "size-5" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ class: "size-5" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['size-5']} */ ;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)(__assign({ class: "text-lg font-semibold" }));
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400" }));
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-amber-400']} */ ;
var __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.UseDark | typeof __VLS_components.UseDark} */
components_1.UseDark;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_12), false));
{
    var __VLS_16 = __VLS_14.slots.default;
    var _a = __VLS_vSlot(__VLS_16)[0], isDark = _a.isDark, toggleDark_1 = _a.toggleDark;
    var __VLS_17 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    var __VLS_22 = void 0;
    var __VLS_23 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                toggleDark_1();
            } });
    var __VLS_24 = __VLS_20.slots.default;
    if (isDark) {
        var __VLS_25 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
        lucide_vue_next_1.SunIcon;
        // @ts-ignore
        var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
        var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
    }
    else {
        var __VLS_30 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.MoonStarIcon} */
        lucide_vue_next_1.MoonStarIcon;
        // @ts-ignore
        var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
        var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_31), false));
    }
    var __VLS_20;
    var __VLS_21;
    __VLS_14.slots['' /* empty slot name completion */];
}
var __VLS_14;
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.ResizablePanelGroup | typeof __VLS_components.ResizablePanelGroup} */
resizable_1.ResizablePanelGroup;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ direction: (__VLS_ctx.isMobile ? 'vertical' : 'horizontal') }, { class: "flex-1" })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ direction: (__VLS_ctx.isMobile ? 'vertical' : 'horizontal') }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
var __VLS_40 = __VLS_38.slots.default;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.ResizablePanel | typeof __VLS_components.ResizablePanel} */
resizable_1.ResizablePanel;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    defaultSize: (50),
    minSize: (20),
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        defaultSize: (50),
        minSize: (20),
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = __VLS_44.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full flex-col" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted/50 border-b px-4 py-2" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-muted-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-1 text-xs" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "hidden sm:inline" }));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-2 flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47(__assign({ 'onClick': {} }, { variant: "ghost", size: "sm", title: "View pattern mappings" })));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "sm", title: "View pattern mappings" })], __VLS_functionalComponentArgsRest(__VLS_48), false));
var __VLS_52;
var __VLS_53 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showPatternMapping = true;
            // @ts-ignore
            [isMobile, showPatternMapping,];
        } });
var __VLS_54 = __VLS_50.slots.default;
var __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.MapIcon} */
lucide_vue_next_1.MapIcon;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55(__assign({ class: "mr-1 size-4" })));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ class: "mr-1 size-4" })], __VLS_functionalComponentArgsRest(__VLS_56), false));
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[];
var __VLS_50;
var __VLS_51;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ 'onClick': {} }, { variant: "ghost", size: "sm", title: "Browse icon codes" })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "sm", title: "Browse icon codes" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_65;
var __VLS_66 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showIconBrowser = true;
            // @ts-ignore
            [showIconBrowser,];
        } });
var __VLS_67 = __VLS_63.slots.default;
var __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.BookOpenIcon} */
lucide_vue_next_1.BookOpenIcon;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ class: "mr-1 size-4" })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ class: "mr-1 size-4" })], __VLS_functionalComponentArgsRest(__VLS_69), false));
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[];
var __VLS_63;
var __VLS_64;
var __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.Textarea} */
textarea_1.Textarea;
// @ts-ignore
var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { modelValue: (__VLS_ctx.inputText) }), { class: "flex-1 resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0" }), { placeholder: "\u0031\u0073\u0074\u0020\u0049\u006e\u0066\u0061\u006e\u0074\u0072\u0079\u0020\u0044\u0069\u0076\u0069\u0073\u0069\u006f\u006e\u000a\u0020\u0020\u0031\u0073\u0074\u0020\u0042\u0072\u0069\u0067\u0061\u0064\u0065\u000a\u0020\u0020\u0020\u0020\u0031\u0073\u0074\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0020\u0020\u0032\u006e\u0064\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0032\u006e\u0064\u0020\u0042\u0072\u0069\u0067\u0061\u0064\u0065\u000a\u0020\u0020\u0020\u0020\u0033\u0072\u0064\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0020\u0020\u0034\u0074\u0068\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0041\u0072\u0074\u0069\u006c\u006c\u0065\u0072\u0079\u0020\u0052\u0065\u0067\u0069\u006d\u0065\u006e\u0074" })));
var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} }), { modelValue: (__VLS_ctx.inputText) }), { class: "flex-1 resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0" }), { placeholder: "\u0031\u0073\u0074\u0020\u0049\u006e\u0066\u0061\u006e\u0074\u0072\u0079\u0020\u0044\u0069\u0076\u0069\u0073\u0069\u006f\u006e\u000a\u0020\u0020\u0031\u0073\u0074\u0020\u0042\u0072\u0069\u0067\u0061\u0064\u0065\u000a\u0020\u0020\u0020\u0020\u0031\u0073\u0074\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0020\u0020\u0032\u006e\u0064\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0032\u006e\u0064\u0020\u0042\u0072\u0069\u0067\u0061\u0064\u0065\u000a\u0020\u0020\u0020\u0020\u0033\u0072\u0064\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0020\u0020\u0034\u0074\u0068\u0020\u0042\u0061\u0074\u0074\u0061\u006c\u0069\u006f\u006e\u000a\u0020\u0020\u0041\u0072\u0074\u0069\u006c\u006c\u0065\u0072\u0079\u0020\u0052\u0065\u0067\u0069\u006d\u0065\u006e\u0074" })], __VLS_functionalComponentArgsRest(__VLS_74), false));
var __VLS_78;
var __VLS_79 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.handleTab) });
var __VLS_80 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.handleShiftTab) });
var __VLS_81 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.handleEnter) });
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-0']} */ ;
var __VLS_76;
var __VLS_77;
// @ts-ignore
[inputText, handleTab, handleShiftTab, handleEnter,];
var __VLS_44;
var __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.ResizableHandle} */
resizable_1.ResizableHandle;
// @ts-ignore
var __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    withHandle: true,
}));
var __VLS_84 = __VLS_83.apply(void 0, __spreadArray([{
        withHandle: true,
    }], __VLS_functionalComponentArgsRest(__VLS_83), false));
var __VLS_87;
/** @ts-ignore @type {typeof __VLS_components.ResizablePanel | typeof __VLS_components.ResizablePanel} */
resizable_1.ResizablePanel;
// @ts-ignore
var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    defaultSize: (50),
    minSize: (20),
}));
var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([{
        defaultSize: (50),
        minSize: (20),
    }], __VLS_functionalComponentArgsRest(__VLS_88), false));
var __VLS_92 = __VLS_90.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full flex-col overflow-hidden" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted/50 flex items-center justify-between border-b px-4 py-2" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-muted-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-1 text-xs" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
(__VLS_ctx.parsedUnits.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93(__assign({ 'onClick': {} }, { size: "sm", disabled: (__VLS_ctx.parsedUnits.length === 0 || __VLS_ctx.isOpeningScenario), title: "Open in Scenario Editor" })));
var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "sm", disabled: (__VLS_ctx.parsedUnits.length === 0 || __VLS_ctx.isOpeningScenario), title: "Open in Scenario Editor" })], __VLS_functionalComponentArgsRest(__VLS_94), false));
var __VLS_98;
var __VLS_99 = ({ click: {} },
    { onClick: (__VLS_ctx.handleOpenScenario) });
var __VLS_100 = __VLS_96.slots.default;
var __VLS_101;
/** @ts-ignore @type {typeof __VLS_components.ExternalLinkIcon} */
lucide_vue_next_1.ExternalLinkIcon;
// @ts-ignore
var __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101(__assign({ class: "mr-1 size-4" })));
var __VLS_103 = __VLS_102.apply(void 0, __spreadArray([__assign({ class: "mr-1 size-4" })], __VLS_functionalComponentArgsRest(__VLS_102), false));
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[parsedUnits, parsedUnits, isOpeningScenario, handleOpenScenario,];
var __VLS_96;
var __VLS_97;
var __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenu | typeof __VLS_components.DropdownMenu} */
dropdown_menu_1.DropdownMenu;
// @ts-ignore
var __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({}));
var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_107), false));
var __VLS_111 = __VLS_109.slots.default;
var __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuTrigger | typeof __VLS_components.DropdownMenuTrigger} */
dropdown_menu_1.DropdownMenuTrigger;
// @ts-ignore
var __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    asChild: true,
}));
var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([{
        asChild: true,
    }], __VLS_functionalComponentArgsRest(__VLS_113), false));
var __VLS_117 = __VLS_115.slots.default;
var __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    variant: "ghost",
    size: "sm",
    disabled: (__VLS_ctx.parsedUnits.length === 0),
    title: "Download ORBAT formats",
}));
var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([{
        variant: "ghost",
        size: "sm",
        disabled: (__VLS_ctx.parsedUnits.length === 0),
        title: "Download ORBAT formats",
    }], __VLS_functionalComponentArgsRest(__VLS_119), false));
var __VLS_123 = __VLS_121.slots.default;
var __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.DownloadIcon} */
lucide_vue_next_1.DownloadIcon;
// @ts-ignore
var __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124(__assign({ class: "mr-1 size-4" })));
var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ class: "mr-1 size-4" })], __VLS_functionalComponentArgsRest(__VLS_125), false));
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
// @ts-ignore
[parsedUnits,];
var __VLS_121;
// @ts-ignore
[];
var __VLS_115;
var __VLS_129;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuContent | typeof __VLS_components.DropdownMenuContent} */
dropdown_menu_1.DropdownMenuContent;
// @ts-ignore
var __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
    align: "end",
}));
var __VLS_131 = __VLS_130.apply(void 0, __spreadArray([{
        align: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_130), false));
var __VLS_134 = __VLS_132.slots.default;
var __VLS_135;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135(__assign({ 'onClick': {} })));
var __VLS_137 = __VLS_136.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_136), false));
var __VLS_140;
var __VLS_141 = ({ click: {} },
    { onClick: (__VLS_ctx.handleDownloadSpatialIllusions) });
var __VLS_142 = __VLS_138.slots.default;
// @ts-ignore
[handleDownloadSpatialIllusions,];
var __VLS_138;
var __VLS_139;
var __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.DropdownMenuItem | typeof __VLS_components.DropdownMenuItem} */
dropdown_menu_1.DropdownMenuItem;
// @ts-ignore
var __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143(__assign({ 'onClick': {} })));
var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_144), false));
var __VLS_148;
var __VLS_149 = ({ click: {} },
    { onClick: (__VLS_ctx.handleDownloadOrbatMapperScenario) });
var __VLS_150 = __VLS_146.slots.default;
// @ts-ignore
[handleDownloadOrbatMapperScenario,];
var __VLS_146;
var __VLS_147;
// @ts-ignore
[];
var __VLS_132;
// @ts-ignore
[];
var __VLS_109;
var __VLS_151 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
    modelValue: (__VLS_ctx.showDebug),
}));
var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showDebug),
    }], __VLS_functionalComponentArgsRest(__VLS_152), false));
var __VLS_156 = __VLS_154.slots.default;
// @ts-ignore
[showDebug,];
var __VLS_154;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1 overflow-y-auto p-4" }));
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
if (__VLS_ctx.parsedUnits.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-center" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "space-y-2" }));
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.parsedUnits)); _i < _b.length; _i++) {
        var unit = _b[_i][0];
        var __VLS_157 = OrbatTreeNode_vue_1.default;
        // @ts-ignore
        var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
            key: (unit.id),
            unit: (unit),
            showDebug: (__VLS_ctx.showDebug),
        }));
        var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([{
                key: (unit.id),
                unit: (unit),
                showDebug: (__VLS_ctx.showDebug),
            }], __VLS_functionalComponentArgsRest(__VLS_158), false));
        // @ts-ignore
        [parsedUnits, parsedUnits, showDebug,];
    }
}
// @ts-ignore
[];
var __VLS_90;
// @ts-ignore
[];
var __VLS_38;
var __VLS_162 = IconBrowserModal_vue_1.default;
// @ts-ignore
var __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
    modelValue: (__VLS_ctx.showIconBrowser),
}));
var __VLS_164 = __VLS_163.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showIconBrowser),
    }], __VLS_functionalComponentArgsRest(__VLS_163), false));
var __VLS_167 = PatternMappingModal_vue_1.default;
// @ts-ignore
var __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    modelValue: (__VLS_ctx.showPatternMapping),
}));
var __VLS_169 = __VLS_168.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.showPatternMapping),
    }], __VLS_functionalComponentArgsRest(__VLS_168), false));
// @ts-ignore
[showPatternMapping, showIconBrowser,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
