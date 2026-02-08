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
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var PanelHeading_vue_1 = require("@/components/PanelHeading.vue");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var ScenarioEventDropdownMenu_vue_1 = require("@/modules/scenarioeditor/ScenarioEventDropdownMenu.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var button_1 = require("@/components/ui/button");
var props = withDefaults(defineProps(), {
    selectOnly: false,
    hideDropdown: false,
});
var emit = defineEmits(["event-click"]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _a.store, _b = _a.time, goToScenarioEvent = _b.goToScenarioEvent, deleteScenarioEvent = _b.deleteScenarioEvent, updateScenarioEvent = _b.updateScenarioEvent, addScenarioEvent = _b.addScenarioEvent;
var getModalTimestamp = (0, utils_1.injectStrict)(injects_1.timeModalKey).getModalTimestamp;
var activeScenarioEventId = (0, selectedStore_1.useSelectedItems)().activeScenarioEventId;
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var events = (0, vue_1.computed)(function () { return store.state.events.map(function (id) { return store.state.eventMap[id]; }); });
var t = (0, vue_1.computed)(function () { return store.state.currentTime; });
function onEventClick(event) {
    if (!props.selectOnly)
        goToScenarioEvent(event);
    emit("event-click", event);
}
function onAction(action, eventId) {
    return __awaiter(this, void 0, void 0, function () {
        var scenarioEvent, _a, newTimestamp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    scenarioEvent = store.state.eventMap[eventId];
                    if (!scenarioEvent)
                        return [2 /*return*/];
                    _a = action;
                    switch (_a) {
                        case "changeTime": return [3 /*break*/, 1];
                        case "delete": return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 4];
                case 1: return [4 /*yield*/, getModalTimestamp(scenarioEvent.startTime, {
                        timeZone: store.state.info.timeZone,
                        title: "Set scenario event time",
                    })];
                case 2:
                    newTimestamp = _b.sent();
                    if (newTimestamp !== undefined) {
                        updateScenarioEvent(eventId, { startTime: newTimestamp });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    deleteScenarioEvent(eventId);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function addEvent() {
    var day = new Date(t.value).getDate();
    activeScenarioEventId.value = addScenarioEvent({
        title: "Event ".concat(day),
        startTime: t.value,
    });
}
var __VLS_defaults = {
    selectOnly: false,
    hideDropdown: false,
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "p-0.5" }));
/** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
var __VLS_0 = PanelHeading_vue_1.default || PanelHeading_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flow-root" }));
/** @type {__VLS_StyleScopedClasses['flow-root']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var _loop_1 = function (event_1, eventIdx) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ key: (event_1.id) }, { class: "group flex" }));
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex-auto pb-4" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    if (eventIdx !== __VLS_ctx.events.length - 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)(__assign({ class: "bg-muted-foreground/30 absolute top-2 left-2 -ml-px h-full w-0.5" }, { 'aria-hidden': "true" }));
        /** @type {__VLS_StyleScopedClasses['bg-muted-foreground/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-ml-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex space-x-4" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onEventClick(event_1);
            // @ts-ignore
            [events, events, onEventClick,];
        } }, { class: "ring-ring mt-1 flex size-4 items-center justify-center rounded-full ring-4" }), { class: ({
            'bg-muted': event_1.startTime > __VLS_ctx.t,
            'bg-background': event_1.startTime < __VLS_ctx.t,
            'bg-accent-foreground': event_1.startTime === __VLS_ctx.t,
        }) }));
    /** @type {__VLS_StyleScopedClasses['ring-ring']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-accent-foreground']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onEventClick(event_1);
            // @ts-ignore
            [onEventClick, t, t, t,];
        } }, { class: "min-w-0 flex-1 cursor-pointer text-sm" }));
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-xs font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.fmt.scenarioDateFormatter.format(event_1.startTime));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (event_1.title);
    if (event_1.subTitle) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        (event_1.subTitle);
    }
    if (!__VLS_ctx.hideDropdown) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" }));
        /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-focus-within:opacity-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
        var __VLS_6 = ScenarioEventDropdownMenu_vue_1.default;
        // @ts-ignore
        var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onAction': {} }, { hideEdit: true })));
        var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { hideEdit: true })], __VLS_functionalComponentArgsRest(__VLS_7), false));
        var __VLS_11 = void 0;
        var __VLS_12 = ({ action: {} },
            { onAction: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(!__VLS_ctx.hideDropdown))
                        return;
                    __VLS_ctx.onAction($event, event_1.id);
                    // @ts-ignore
                    [fmt, hideDropdown, onAction,];
                } });
    }
    // @ts-ignore
    [];
};
var __VLS_9, __VLS_10;
for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.events)); _i < _c.length; _i++) {
    var _d = _c[_i], event_1 = _d[0], eventIdx = _d[1];
    _loop_1(event_1, eventIdx);
}
if (!__VLS_ctx.selectOnly) {
    var __VLS_13 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign(__assign({ 'onClick': {} }, { size: "sm", variant: "secondary" }), { class: "mt-4" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { size: "sm", variant: "secondary" }), { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_18 = void 0;
    var __VLS_19 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(!__VLS_ctx.selectOnly))
                    return;
                __VLS_ctx.addEvent();
                // @ts-ignore
                [selectOnly, addEvent,];
            } });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    var __VLS_20 = __VLS_16.slots.default;
    // @ts-ignore
    [];
    var __VLS_16;
    var __VLS_17;
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
