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
var MapContainer_vue_1 = require("@/components/MapContainer.vue");
var core_1 = require("@vueuse/core");
var StoryModeContent_vue_1 = require("./StoryModeContent.vue");
var testStory_1 = require("@/testdata/testStory");
var proj_1 = require("ol/proj");
var dayjs_1 = require("dayjs");
var layers_1 = require("@/geo/layers");
var unitStyles_1 = require("@/geo/unitStyles");
var SlideOver_vue_1 = require("../../components/SlideOver.vue");
var outline_1 = require("@heroicons/vue/24/outline");
var NumberInputGroup_vue_1 = require("../../components/NumberInputGroup.vue");
var MeasurementToolbar_vue_1 = require("../../components/MeasurementToolbar.vue");
var geoUnitLayers_1 = require("@/composables/geoUnitLayers");
var injects_1 = require("@/components/injects");
var featureStyles_1 = require("@/geo/featureStyles");
var scenarioFeatureLayers_1 = require("@/modules/scenarioeditor/scenarioFeatureLayers");
var mapSettingsStore_ts_1 = require("@/stores/mapSettingsStore.ts");
var props = defineProps();
(0, vue_1.provide)(injects_1.activeScenarioKey, props.activeScenario);
var scnFeatures = (0, featureStyles_1.useFeatureStyles)(props.activeScenario.geo);
(0, vue_1.provide)(injects_1.activeFeatureStylesKey, scnFeatures);
var state = props.activeScenario.store.state;
var originalTitle = (0, core_1.useTitle)().value;
var windowTitle = (0, vue_1.computed)(function () { return state.info.name; });
var mapIsReady = (0, vue_1.ref)(false);
var sidebarIsOpen = (0, vue_1.ref)(false);
var toggleSidebar = (0, core_1.useToggle)(sidebarIsOpen);
var mapRef = (0, vue_1.shallowRef)();
var settingsStore = (0, mapSettingsStore_ts_1.useMapSettingsStore)();
(0, core_1.useTitle)(windowTitle);
(0, vue_1.onMounted)(function () {
    window.scrollTo(0, 0);
});
(0, vue_1.onUnmounted)(function () {
    (0, core_1.useTitle)(originalTitle);
});
var _a = (0, geoUnitLayers_1.useUnitLayer)({
    activeScenario: props.activeScenario,
}), unitLayer = _a.unitLayer, drawUnits = _a.drawUnits, animateUnits = _a.animateUnits;
function onMapReady(olMap) {
    mapRef.value = olMap;
    mapIsReady.value = true;
    var view = mapRef.value.getView();
    var _a = testStory_1.chapter.view, center = _a.center, rest = __rest(_a, ["center"]);
    var time = dayjs_1.default.utc(testStory_1.chapter.startTime);
    props.activeScenario.time.setCurrentTime(time.valueOf());
    var loadScenarioLayers = (0, scenarioFeatureLayers_1.useScenarioFeatureLayers)(mapRef.value).initializeFeatureLayersFromStore;
    loadScenarioLayers();
    olMap.addLayer(unitLayer);
    drawUnits();
    (0, vue_1.watch)(function () { return state.currentTime; }, function () { return loadScenarioLayers(); });
    view.animate(__assign(__assign({}, rest), { center: (0, proj_1.fromLonLat)(center, view.getProjection()), duration: 0 }));
}
function onUpdateState(state) {
    var _this = this;
    if (state.time) {
        var time = dayjs_1.default.utc(state.time);
        props.activeScenario.time.setCurrentTime(time.valueOf());
        animateUnits();
    }
    if (state.view) {
        var view_1 = mapRef.value.getView();
        var _a = state.view, center_1 = _a.center, zoom_1 = _a.zoom, duration_1 = _a.duration, rest = __rest(_a, ["center", "zoom", "duration"]);
        // view.animate(
        //   {
        //     duration: 2000,
        //     ...rest,
        //     center: center && fromLonLat(center, view.getProjection()),
        //   },
        //   () => (doneAnimating.value = true)
        // );
        if (center_1)
            (0, core_1.invoke)(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, layers_1.flyTo)(view_1, {
                                location: (0, proj_1.fromLonLat)(center_1, view_1.getProjection()),
                                zoom: zoom_1,
                                duration: duration_1,
                            })];
                        case 1:
                            _a.sent();
                            // await until(doneAnimating).toBe(true);
                            console.log("done animating");
                            return [2 /*return*/];
                    }
                });
            }); });
    }
    console.log("On update state", state);
}
(0, vue_1.watch)(settingsStore, function () {
    (0, unitStyles_1.clearUnitStyleCache)();
    drawUnits();
});
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pt-4 md:flex md:h-screen md:flex-col" }));
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "absolute inset-x-0 top-0 h-4 border-b bg-amber-200 text-center text-xs text-amber-700" }));
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "bg-muted relative w-full p-4 md:shrink-0" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
(__VLS_ctx.state.info.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleSidebar();
        // @ts-ignore
        [state, toggleSidebar,];
    } }, { type: "button" }), { class: "bg-opacity-75 text-muted-foreground hover:text-muted-foreground focus:ring-ring bg-background hover:bg-muted fixed top-2 right-4 z-20 inline-flex items-center justify-center rounded-md p-2 focus:ring-2 focus:ring-offset-2 focus:outline-hidden" }));
/** @type {__VLS_StyleScopedClasses['bg-opacity-75']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
if (!__VLS_ctx.sidebarIsOpen) {
    var __VLS_0 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.MenuIcon} */
    outline_1.Bars3Icon;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "block h-6 w-6" }, { 'aria-hidden': "true" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "block h-6 w-6" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
}
else {
    var __VLS_5 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.XIcon} */
    outline_1.XMarkIcon;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ class: "block h-6 w-6" }, { 'aria-hidden': "true" })));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "block h-6 w-6" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "md:flex md:min-h-0 md:flex-auto" }));
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['md:min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "bg-background relative sticky top-0 z-10 h-[45vh] w-full shadow-md md:static md:h-full md:shadow-none" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[45vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['md:static']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:shadow-none']} */ ;
var __VLS_10 = MapContainer_vue_1.default;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10(__assign({ 'onReady': {} })));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ 'onReady': {} })], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_15;
var __VLS_16 = ({ ready: {} },
    { onReady: (__VLS_ctx.onMapReady) });
var __VLS_13;
var __VLS_14;
if (__VLS_ctx.mapRef) {
    var __VLS_17 = MeasurementToolbar_vue_1.default;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ olMap: (__VLS_ctx.mapRef) }, { class: "absolute bottom-2 left-2" })));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ olMap: (__VLS_ctx.mapRef) }, { class: "absolute bottom-2 left-2" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-2']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "bg-muted/50 w-full overflow-auto border md:max-w-sm lg:max-w-lg" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:max-w-lg']} */ ;
var __VLS_22 = StoryModeContent_vue_1.default;
// @ts-ignore
var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign({ 'onUpdateState': {} })));
var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign({ 'onUpdateState': {} })], __VLS_functionalComponentArgsRest(__VLS_23), false));
var __VLS_27;
var __VLS_28 = ({ updateState: {} },
    { onUpdateState: (__VLS_ctx.onUpdateState) });
var __VLS_25;
var __VLS_26;
var __VLS_29 = SlideOver_vue_1.default || SlideOver_vue_1.default;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    modelValue: (__VLS_ctx.sidebarIsOpen),
    title: "Settings",
}));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.sidebarIsOpen),
        title: "Settings",
    }], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34 = __VLS_32.slots.default;
var __VLS_35 = NumberInputGroup_vue_1.default;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    label: "Symbol size",
    modelValue: (__VLS_ctx.settingsStore.mapIconSize),
}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{
        label: "Symbol size",
        modelValue: (__VLS_ctx.settingsStore.mapIconSize),
    }], __VLS_functionalComponentArgsRest(__VLS_36), false));
// @ts-ignore
[sidebarIsOpen, sidebarIsOpen, onMapReady, mapRef, mapRef, onUpdateState, settingsStore,];
var __VLS_32;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
