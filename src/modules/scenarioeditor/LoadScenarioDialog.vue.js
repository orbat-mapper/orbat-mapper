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
var LoadScenarioPanel_vue_1 = require("@/modules/scenarioeditor/LoadScenarioPanel.vue");
var LoadScenarioUrlForm_vue_1 = require("@/modules/scenarioeditor/LoadScenarioUrlForm.vue");
var browserScenarios_1 = require("@/composables/browserScenarios");
var tabs_1 = require("@/components/ui/tabs");
var vue_1 = require("vue");
var names_1 = require("@/router/names");
var SortDropdown_vue_1 = require("@/components/SortDropdown.vue");
var ScenarioLinkCard_vue_1 = require("@/components/ScenarioLinkCard.vue");
var NewSimpleModal_vue_1 = require("@/components/NewSimpleModal.vue");
var button_1 = require("@/components/ui/button");
var vue_2 = require("vue");
var DecryptScenarioModal = (0, vue_2.defineAsyncComponent)(function () { return Promise.resolve().then(function () { return require("@/components/DecryptScenarioModal.vue"); }); });
var open = defineModel({ default: false });
var inputSource = (0, vue_1.ref)("browser");
var showDecryptModal = (0, vue_1.ref)(false);
var currentEncryptedScenario = (0, vue_1.ref)(null);
var _a = (0, browserScenarios_1.useBrowserScenarios)(), loadScenario = _a.loadScenario, storedScenarios = _a.storedScenarios, sortOptions = _a.sortOptions, onAction = _a.onAction;
function onLoaded(scenario) {
    if (scenario.type === "ORBAT-mapper-encrypted") {
        currentEncryptedScenario.value = scenario;
        showDecryptModal.value = true;
        return;
    }
    loadScenario(scenario);
    open.value = false;
}
function onDecrypted(scenario) {
    loadScenario(scenario);
    open.value = false;
    showDecryptModal.value = false;
    currentEncryptedScenario.value = null;
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
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Load scenario" }, { class: "sm:max-w-xl md:max-w-4xl" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.open), dialogTitle: "Load scenario" }, { class: "sm:max-w-xl md:max-w-4xl" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['sm:max-w-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-4xl']} */ ;
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ modelValue: (__VLS_ctx.inputSource) }, { class: "mt-4" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.inputSource) }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_11 = __VLS_9.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-x-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-x-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "bg-transparent p-0" })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "bg-transparent p-0" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0']} */ ;
var __VLS_17 = __VLS_15.slots.default;
var __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18(__assign({ value: "browser" }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none" })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ value: "browser" }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none" })], __VLS_functionalComponentArgsRest(__VLS_19), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:bg-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-none']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:shadow-none']} */ ;
var __VLS_23 = __VLS_21.slots.default;
// @ts-ignore
[open, inputSource,];
var __VLS_21;
var __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24(__assign({ value: "external" }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none" })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ value: "external" }, { class: "text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none" })], __VLS_functionalComponentArgsRest(__VLS_25), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:bg-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-none']} */ ;
/** @type {__VLS_StyleScopedClasses['data-[state=active]:shadow-none']} */ ;
var __VLS_29 = __VLS_27.slots.default;
// @ts-ignore
[];
var __VLS_27;
// @ts-ignore
[];
var __VLS_15;
var __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30(__assign({ value: "browser" }, { class: "mt-4" })));
var __VLS_32 = __VLS_31.apply(void 0, __spreadArray([__assign({ value: "browser" }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_31), false));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_35 = __VLS_33.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "flex items-center justify-end border-b border-gray-200 pb-5" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-3 flex items-center sm:mt-0 sm:ml-4" }));
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:ml-4']} */ ;
var __VLS_36 = SortDropdown_vue_1.default;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36(__assign({ class: "mr-4" }, { options: (__VLS_ctx.sortOptions) })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ class: "mr-4" }, { options: (__VLS_ctx.sortOptions) })], __VLS_functionalComponentArgsRest(__VLS_37), false));
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
var __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    asChild: true,
    variant: "secondary",
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        asChild: true,
        variant: "secondary",
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_46 = __VLS_44.slots.default;
var __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    to: ({ name: __VLS_ctx.NEW_SCENARIO_ROUTE }),
}));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{
        to: ({ name: __VLS_ctx.NEW_SCENARIO_ROUTE }),
    }], __VLS_functionalComponentArgsRest(__VLS_48), false));
var __VLS_52 = __VLS_50.slots.default;
// @ts-ignore
[sortOptions, names_1.NEW_SCENARIO_ROUTE,];
var __VLS_50;
// @ts-ignore
[];
var __VLS_44;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
var _loop_1 = function (info) {
    var __VLS_53 = ScenarioLinkCard_vue_1.default;
    // @ts-ignore
    var __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53(__assign({ 'onAction': {} }, { key: (info.id), data: (info) })));
    var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { key: (info.id), data: (info) })], __VLS_functionalComponentArgsRest(__VLS_54), false));
    var __VLS_58 = void 0;
    var __VLS_59 = ({ action: {} },
        { onAction: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onAction($event, info);
                // @ts-ignore
                [storedScenarios, onAction,];
            } });
    // @ts-ignore
    [];
};
var __VLS_56, __VLS_57;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.storedScenarios)); _i < _b.length; _i++) {
    var info = _b[_i][0];
    _loop_1(info);
}
// @ts-ignore
[];
var __VLS_33;
var __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60(__assign({ value: "external" }, { class: "mt-6" })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ value: "external" }, { class: "mt-6" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
var __VLS_65 = __VLS_63.slots.default;
var __VLS_66 = LoadScenarioPanel_vue_1.default;
// @ts-ignore
var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ 'onLoaded': {} }, { class: "h-40" })));
var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} }, { class: "h-40" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
var __VLS_71;
var __VLS_72 = ({ loaded: {} },
    { onLoaded: (__VLS_ctx.onLoaded) });
/** @type {__VLS_StyleScopedClasses['h-40']} */ ;
var __VLS_69;
var __VLS_70;
var __VLS_73 = LoadScenarioUrlForm_vue_1.default;
// @ts-ignore
var __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73(__assign({ 'onLoaded': {} }, { class: "mt-4" })));
var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([__assign({ 'onLoaded': {} }, { class: "mt-4" })], __VLS_functionalComponentArgsRest(__VLS_74), false));
var __VLS_78;
var __VLS_79 = ({ loaded: {} },
    { onLoaded: (__VLS_ctx.onLoaded) });
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_76;
var __VLS_77;
// @ts-ignore
[onLoaded, onLoaded,];
var __VLS_63;
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.showDecryptModal && __VLS_ctx.currentEncryptedScenario) {
    var __VLS_80 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.DecryptScenarioModal} */
    DecryptScenarioModal;
    // @ts-ignore
    var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80(__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })));
    var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([__assign({ 'onDecrypted': {} }, { modelValue: (__VLS_ctx.showDecryptModal), encryptedScenario: (__VLS_ctx.currentEncryptedScenario) })], __VLS_functionalComponentArgsRest(__VLS_81), false));
    var __VLS_85 = void 0;
    var __VLS_86 = ({ decrypted: {} },
        { onDecrypted: (__VLS_ctx.onDecrypted) });
    var __VLS_83;
    var __VLS_84;
}
// @ts-ignore
[showDecryptModal, showDecryptModal, currentEncryptedScenario, currentEncryptedScenario, onDecrypted,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
