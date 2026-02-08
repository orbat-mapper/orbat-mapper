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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_router_1 = require("vue-router");
var names_1 = require("@/router/names");
var LoadScenarioPanel_vue_1 = require("@/modules/scenarioeditor/LoadScenarioPanel.vue");
var LoadScenarioFromUrlPanel_vue_1 = require("@/modules/scenarioeditor/LoadScenarioFromUrlPanel.vue");
var ScenarioLinkCard_vue_1 = require("@/components/ScenarioLinkCard.vue");
var SortDropdown_vue_1 = require("@/components/SortDropdown.vue");
var browserScenarios_1 = require("@/composables/browserScenarios");
var button_1 = require("@/components/ui/button");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var LoadScenarioFromClipboardPanel_vue_1 = require("@/modules/scenarioeditor/LoadScenarioFromClipboardPanel.vue");
var DecryptScenarioModal = (0, vue_1.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/DecryptScenarioModal.vue"); }); });
var _a = (0, browserScenarios_1.useBrowserScenarios)(), storedScenarios = _a.storedScenarios, sortOptions = _a.sortOptions, onAction = _a.onAction, loadScenario = _a.loadScenario;
var router = (0, vue_router_1.useRouter)();
var getScenarioTo = function (scenarioId) {
    return {
        name: names_1.MAP_EDIT_MODE_ROUTE,
        params: { scenarioId: "demo-".concat(scenarioId) },
    };
};
var newScenario = function () {
    router.push({ name: names_1.NEW_SCENARIO_ROUTE });
};
var showDecryptModal = (0, vue_1.ref)(false);
var currentEncryptedScenario = (0, vue_1.ref)(null);
function onLoaded(scenario) {
    if (scenario.type === "ORBAT-mapper-encrypted") {
        currentEncryptedScenario.value = scenario;
        showDecryptModal.value = true;
        return;
    }
    loadScenario(scenario);
}
function onDecrypted(scenario) {
    loadScenario(scenario);
    showDecryptModal.value = false;
    currentEncryptedScenario.value = null;
}
var clipboardPanelRef = (0, vue_1.ref)(null);
(0, core_1.useEventListener)("paste", function (event) {
    var _a, _b;
    var target = event.target;
    if (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable) {
        return;
    }
    var text = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text");
    if (text) {
        (_b = clipboardPanelRef.value) === null || _b === void 0 ? void 0 : _b.processContent(text);
    }
});
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background relative py-5" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-3xl p-4 text-center" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-heading text-3xl font-bold tracking-tight" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
if (__VLS_ctx.storedScenarios.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mx-auto max-w-7xl p-6" }));
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "border-border border-b pb-5 sm:flex sm:items-center sm:justify-between" }));
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-foreground text-base leading-6 font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-3 flex items-center gap-1 sm:mt-0 sm:ml-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:mt-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:ml-4']} */ ;
    var __VLS_0 = SortDropdown_vue_1.default;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        options: (__VLS_ctx.sortOptions),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            options: (__VLS_ctx.sortOptions),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_5 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        asChild: true,
    }));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{
            asChild: true,
        }], __VLS_functionalComponentArgsRest(__VLS_6), false));
    var __VLS_10 = __VLS_8.slots.default;
    var __VLS_11 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
    routerLink;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        to: ({ name: __VLS_ctx.NEW_SCENARIO_ROUTE }),
    }));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
            to: ({ name: __VLS_ctx.NEW_SCENARIO_ROUTE }),
        }], __VLS_functionalComponentArgsRest(__VLS_12), false));
    var __VLS_16 = __VLS_14.slots.default;
    // @ts-ignore
    [storedScenarios, sortOptions, names_1.NEW_SCENARIO_ROUTE,];
    var __VLS_14;
    // @ts-ignore
    [];
    var __VLS_8;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
    var _loop_1 = function (info) {
        var __VLS_17 = ScenarioLinkCard_vue_1.default;
        // @ts-ignore
        var __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17(__assign({ 'onAction': {} }, { key: (info.id), data: (info) })));
        var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { key: (info.id), data: (info) })], __VLS_functionalComponentArgsRest(__VLS_18), false));
        var __VLS_22 = void 0;
        var __VLS_23 = ({ action: {} },
            { onAction: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.storedScenarios.length > 0))
                        return;
                    __VLS_ctx.onAction($event, info);
                    // @ts-ignore
                    [storedScenarios, onAction,];
                } });
        // @ts-ignore
        [];
    };
    var __VLS_20, __VLS_21;
    for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.storedScenarios)); _i < _b.length; _i++) {
        var info = _b[_i][0];
        _loop_1(info);
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mb-2" }));
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "bg-muted/50 text-muted-foreground relative top-0 right-0 left-0 p-4 text-center text-sm" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-3xl px-4 text-center" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-lg" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mx-auto max-w-7xl p-6" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
for (var _c = 0, _d = __VLS_vFor((__VLS_ctx.DEMO_SCENARIOS)); _c < _d.length; _c++) {
    var scenario = _d[_c][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ key: (scenario.name) }, { class: "divide-border bg-card text-card-foreground focus-within:border-primary col-span-1 flex flex-col divide-y overflow-hidden rounded-lg border text-center shadow-sm" }));
    /** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-card-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-within:border-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    var __VLS_24 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
    routerLink;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign(__assign({ to: (__VLS_ctx.getScenarioTo(scenario.id)) }, { class: "flex flex-1 flex-col" }), { draggable: "false" })));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign(__assign({ to: (__VLS_ctx.getScenarioTo(scenario.id)) }, { class: "flex flex-1 flex-col" }), { draggable: "false" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    var __VLS_29 = __VLS_27.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ class: "bg-muted mx-auto h-52 w-full shrink-0 object-cover object-top" }, { src: (scenario.imageUrl), alt: "", draggable: "false" }));
    /** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-52']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-top']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "text-heading mt-6 text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (scenario.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)(__assign({ class: "mt-1 flex grow flex-col justify-between p-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['grow']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)(__assign({ class: "sr-only" }));
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)(__assign({ class: "text-muted-foreground text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (scenario.summary);
    // @ts-ignore
    [browserScenarios_1.DEMO_SCENARIOS, getScenarioTo,];
    var __VLS_27;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "col-span-1 flex" }));
/** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.newScenario) }, { type: "button" }), { class: "border-border hover:border-border/80 focus:ring-ring relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:ring-2 focus:ring-offset-2 focus:outline-hidden" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-border/80']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['p-12']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign({ class: "text-muted-foreground mx-auto h-12 w-12" }, { xmlns: "http://www.w3.org/2000/svg", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", 'aria-hidden': "true" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-foreground mt-2 block text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "col-span-1 flex" }));
/** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
var __VLS_30 = LoadScenarioPanel_vue_1.default;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ 'onLoaded': {} })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} })], __VLS_functionalComponentArgsRest(__VLS_31), false));
var __VLS_35;
var __VLS_36 = ({ loaded: {} },
    { onLoaded: (__VLS_ctx.onLoaded) });
var __VLS_33;
var __VLS_34;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "col-span-1 flex" }));
/** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
var __VLS_37 = LoadScenarioFromUrlPanel_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ 'onLoaded': {} })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42;
var __VLS_43 = ({ loaded: {} },
    { onLoaded: (__VLS_ctx.onLoaded) });
var __VLS_40;
var __VLS_41;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "col-span-1 flex" }));
/** @type {__VLS_StyleScopedClasses['col-span-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
var __VLS_44 = LoadScenarioFromClipboardPanel_vue_1.default;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44(__assign({ 'onLoaded': {} }, { ref: "clipboardPanelRef" })));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} }, { ref: "clipboardPanelRef" })], __VLS_functionalComponentArgsRest(__VLS_45), false));
var __VLS_49;
var __VLS_50 = ({ loaded: {} },
    { onLoaded: (__VLS_ctx.onLoaded) });
var __VLS_51 = {};
var __VLS_47;
var __VLS_48;
if (__VLS_ctx.showDecryptModal && __VLS_ctx.currentEncryptedScenario) {
    var __VLS_53 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DecryptScenarioModal} */
    DecryptScenarioModal;
    // @ts-ignore
    var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })));
    var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })], __VLS_functionalComponentArgsRest(__VLS_54), false));
    var __VLS_58 = void 0;
    var __VLS_59 = ({ decrypted: {} },
        { onDecrypted: (__VLS_ctx.onDecrypted) });
    var __VLS_56;
    var __VLS_57;
}
// @ts-ignore
var __VLS_52 = __VLS_51;
// @ts-ignore
[newScenario, onLoaded, onLoaded, onLoaded, showDecryptModal, showDecryptModal, currentEncryptedScenario, currentEncryptedScenario, onDecrypted,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
