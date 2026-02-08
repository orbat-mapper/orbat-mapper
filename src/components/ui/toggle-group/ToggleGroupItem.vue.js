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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@vueuse/core");
var reka_ui_1 = require("reka-ui");
var vue_1 = require("vue");
var utils_1 = require("@/lib/utils");
var toggle_1 = require("@/components/ui/toggle");
var props = defineProps();
var context = (0, vue_1.inject)("toggleGroup");
var delegatedProps = (0, core_1.reactiveOmit)(props, "class", "size", "variant");
var forwardedProps = (0, reka_ui_1.useForwardProps)(delegatedProps);
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.ToggleGroupItem | typeof __VLS_components.ToggleGroupItem} */
reka_ui_1.ToggleGroupItem;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "toggle-group-item", dataVariant: (((_a = __VLS_ctx.context) === null || _a === void 0 ? void 0 : _a.variant) || __VLS_ctx.variant), dataSize: (((_b = __VLS_ctx.context) === null || _b === void 0 ? void 0 : _b.size) || __VLS_ctx.size), dataSpacing: ((_c = __VLS_ctx.context) === null || _c === void 0 ? void 0 : _c.spacing) }, (__VLS_ctx.forwardedProps)), { class: (__VLS_ctx.cn(__VLS_ctx.toggleVariants({
        variant: ((_d = __VLS_ctx.context) === null || _d === void 0 ? void 0 : _d.variant) || __VLS_ctx.variant,
        size: ((_e = __VLS_ctx.context) === null || _e === void 0 ? void 0 : _e.size) || __VLS_ctx.size,
    }), 'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10', 'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "toggle-group-item", dataVariant: (((_f = __VLS_ctx.context) === null || _f === void 0 ? void 0 : _f.variant) || __VLS_ctx.variant), dataSize: (((_g = __VLS_ctx.context) === null || _g === void 0 ? void 0 : _g.size) || __VLS_ctx.size), dataSpacing: ((_h = __VLS_ctx.context) === null || _h === void 0 ? void 0 : _h.spacing) }, (__VLS_ctx.forwardedProps)), { class: (__VLS_ctx.cn(__VLS_ctx.toggleVariants({
            variant: ((_j = __VLS_ctx.context) === null || _j === void 0 ? void 0 : _j.variant) || __VLS_ctx.variant,
            size: ((_k = __VLS_ctx.context) === null || _k === void 0 ? void 0 : _k.size) || __VLS_ctx.size,
        }), 'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10', 'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var slotProps = __VLS_vSlot(__VLS_6)[0];
    var __VLS_7 = __assign({}, (slotProps));
    // @ts-ignore
    [context, context, context, context, context, variant, variant, size, size, forwardedProps, utils_1.cn, toggle_1.toggleVariants,];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
