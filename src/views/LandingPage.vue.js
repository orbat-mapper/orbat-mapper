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
var names_1 = require("@/router/names");
// ... existing imports
var lucide_vue_next_1 = require("lucide-vue-next");
var ProseSection_vue_1 = require("../components/ProseSection.vue");
var LandingPageScenarios_vue_1 = require("./LandingPageScenarios.vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var outline_1 = require("@heroicons/vue/24/outline");
var button_1 = require("@/components/ui/button");
var components_1 = require("@vueuse/components");
var features = [
    {
        name: "Create ORBATs",
        description: "Quickly build ORBATs.",
    },
    {
        name: "Draw features",
        description: "",
    },
    {
        name: "Client side only",
        description: "Everything is stored on your computer.",
    },
    {
        name: "Grid edit moe",
        description: "Efficient editing.",
    },
    {
        name: "Export to KML/KMZ",
        description: "View your scenario in 3D with Google Earth.",
    },
    {
        name: "Export as GeoJSON",
        description: "",
    },
    {
        name: "Import MilX",
        description: "Import military map overlays from map.army.",
    },
    {
        name: "Import GeoJSON",
        description: "",
    },
];
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-full flex-col" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "bg-muted relative top-0 right-0 left-0 flex items-center justify-center gap-8 p-1 text-center" }));
/** @type {__VLS_StyleScopedClasses['bg-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://github.com/orbat-mapper/orbat-mapper" }, { class: "underline" }));
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.GithubIcon} */
vue_mdi_1.IconGithub;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "inline size-6 sm:size-10" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "inline size-6 sm:size-10" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['size-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:size-10']} */ ;
var __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.UseDark | typeof __VLS_components.UseDark} */
components_1.UseDark;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
{
    var __VLS_10 = __VLS_8.slots.default;
    var _a = __VLS_vSlot(__VLS_10)[0], isDark = _a.isDark, toggleDark_1 = _a.toggleDark;
    var __VLS_11 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11(__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })));
    var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "ghost", size: "icon", title: "Toggle dark mode" })], __VLS_functionalComponentArgsRest(__VLS_12), false));
    var __VLS_16 = void 0;
    var __VLS_17 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                toggleDark_1();
            } });
    var __VLS_18 = __VLS_14.slots.default;
    if (isDark) {
        var __VLS_19 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
        lucide_vue_next_1.SunIcon;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_20), false));
    }
    else {
        var __VLS_24 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.MoonStarIcon} */
        lucide_vue_next_1.MoonStarIcon;
        // @ts-ignore
        var __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
        var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_25), false));
    }
    var __VLS_14;
    var __VLS_15;
    __VLS_8.slots['' /* empty slot name completion */];
}
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "mt-16 sm:mt-24" }));
/** @type {__VLS_StyleScopedClasses['mt-16']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mt-24']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl px-4 sm:px-6" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center" }));
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)(__assign({ class: "text-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-6xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-red-900 dark:text-red-900/90" }));
/** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-red-900/90']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground absolute text-sm tracking-normal uppercase" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mx-auto mt-3 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "mt-4" }));
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
button_1.Button;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    asChild: true,
    variant: "link",
}));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
        asChild: true,
        variant: "link",
    }], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34 = __VLS_32.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://docs.orbat-mapper.app/guide/about-orbat-mapper",
    target: "_blank",
});
var __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.ExternalLinkIcon} */
lucide_vue_next_1.ExternalLinkIcon;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35(__assign({ class: "text-muted-foreground -ml-1" })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground -ml-1" })], __VLS_functionalComponentArgsRest(__VLS_36), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['-ml-1']} */ ;
var __VLS_32;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "scenarios",
});
var __VLS_40 = LandingPageScenarios_vue_1.default;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign({ class: "mt-16" })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ class: "mt-16" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
/** @type {__VLS_StyleScopedClasses['mt-16']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ id: "features" }, { class: "bg-muted/40 dark:bg-muted/20" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/40']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-muted/20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-16']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:py-24']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-3xl text-center" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-heading text-3xl font-bold tracking-tight" }));
/** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground mt-4 text-lg" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)(__assign({ class: "mt-12 space-y-10 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8" }));
/** @type {__VLS_StyleScopedClasses['mt-12']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:space-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-x-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-y-12']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:gap-x-8']} */ ;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.features)); _i < _b.length; _i++) {
    var feature = _b[_i][0];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (feature.name) }, { class: "relative" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    var __VLS_45 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CheckIcon} */
    outline_1.CheckIcon;
    // @ts-ignore
    var __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45(__assign({ class: "text-accent-foreground absolute h-6 w-6" }, { 'aria-hidden': "true" })));
    var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ class: "text-accent-foreground absolute h-6 w-6" }, { 'aria-hidden': "true" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
    /** @type {__VLS_StyleScopedClasses['text-accent-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-heading ml-9 text-lg leading-6 font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-heading']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (feature.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)(__assign({ class: "text-muted-foreground mt-2 ml-9 text-base" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    (feature.description);
    // @ts-ignore
    [features,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ id: "links" }, { class: "" }));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_50 = ProseSection_vue_1.default || ProseSection_vue_1.default;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50(__assign({ class: "" })));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign({ class: "" })], __VLS_functionalComponentArgsRest(__VLS_51), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_55 = __VLS_53.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-center" }));
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 place-items-center gap-4" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "aspect-w-5 aspect-h-2 overflow-hidden rounded-lg dark:bg-slate-400" }));
/** @type {__VLS_StyleScopedClasses['aspect-w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['aspect-h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)(__assign({ src: "/images/orbat-chart-demo-min.png", width: "2136", height: "1780" }, { class: "object-cover object-top" }));
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['object-top']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "flex flex-col gap-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
var __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56(__assign({ to: ({ name: __VLS_ctx.TEXT_TO_ORBAT_ROUTE }) }, { class: "shrink-0" })));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.TEXT_TO_ORBAT_ROUTE }) }, { class: "shrink-0" })], __VLS_functionalComponentArgsRest(__VLS_57), false));
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
var __VLS_61 = __VLS_59.slots.default;
// @ts-ignore
[names_1.TEXT_TO_ORBAT_ROUTE,];
var __VLS_59;
var __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62(__assign({ to: ({ name: __VLS_ctx.ORBAT_CHART_ROUTE }) }, { class: "text-muted-foreground" })));
var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([__assign({ to: ({ name: __VLS_ctx.ORBAT_CHART_ROUTE }) }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_63), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_67 = __VLS_65.slots.default;
// @ts-ignore
[names_1.ORBAT_CHART_ROUTE,];
var __VLS_65;
var __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign({ to: "/storymode" }, { class: "text-muted-foreground" })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ to: "/storymode" }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_69), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_73 = __VLS_71.slots.default;
// @ts-ignore
[];
var __VLS_71;
var __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74(__assign({ to: "/testgrid" }, { class: "text-muted-foreground" })));
var __VLS_76 = __VLS_75.apply(void 0, __spreadArray([__assign({ to: "/testgrid" }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_75), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_79 = __VLS_77.slots.default;
// @ts-ignore
[];
var __VLS_77;
var __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80(__assign({ to: "/testgrid2" }, { class: "text-muted-foreground" })));
var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([__assign({ to: "/testgrid2" }, { class: "text-muted-foreground" })], __VLS_functionalComponentArgsRest(__VLS_81), false));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
var __VLS_85 = __VLS_83.slots.default;
// @ts-ignore
[];
var __VLS_83;
// @ts-ignore
[];
var __VLS_53;
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "bg-muted/40" }));
/** @type {__VLS_StyleScopedClasses['bg-muted/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8" }));
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:py-24']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "-mb-6 columns-2 font-medium sm:flex sm:justify-center sm:space-x-12" }, { 'aria-label': "Footer" }));
/** @type {__VLS_StyleScopedClasses['-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['columns-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:space-x-12']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-6" }));
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://docs.orbat-mapper.app/guide/about-orbat-mapper" }, { class: "text-muted-foreground hover:text-foreground text-sm leading-6" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-6" }));
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://docs.orbat-mapper.app/guide/getting-started" }, { class: "text-muted-foreground hover:text-foreground text-sm leading-6" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-6" }));
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://docs.orbat-mapper.app/resources/tools" }, { class: "text-muted-foreground hover:text-foreground text-sm leading-6" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "pb-6" }));
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://docs.orbat-mapper.app/support" }, { class: "text-muted-foreground hover:text-foreground text-sm leading-6" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-10 flex justify-center space-x-10" }));
/** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://github.com/orbat-mapper/orbat-mapper" }, { class: "text-muted-foreground hover:text-foreground" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-foreground']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "sr-only" }));
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign({ class: "h-6 w-6" }, { fill: "currentColor", viewBox: "0 0 24 24", 'aria-hidden': "true" }));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'fill-rule': "evenodd",
    d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
    'clip-rule': "evenodd",
});
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
