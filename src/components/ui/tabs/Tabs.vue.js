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
var core_1 = require("@vueuse/core");
var reka_ui_1 = require("reka-ui");
var utils_1 = require("@/lib/utils");
var props = defineProps();
var emits = defineEmits();
var delegatedProps = (0, core_1.reactiveOmit)(props, "class");
var forwarded = (0, reka_ui_1.useForwardPropsEmits)(delegatedProps, emits);
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.TabsRoot | typeof __VLS_components.TabsRoot} */
reka_ui_1.TabsRoot;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign(__assign({ dataSlot: "tabs" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('flex flex-col gap-2', props.class)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ dataSlot: "tabs" }, (__VLS_ctx.forwarded)), { class: (__VLS_ctx.cn('flex flex-col gap-2', props.class)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
{
    var __VLS_6 = __VLS_3.slots.default;
    var slotProps = __VLS_vSlot(__VLS_6)[0];
    var __VLS_7 = __assign({}, (slotProps));
    // @ts-ignore
    [forwarded, utils_1.cn,];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
// @ts-ignore
var __VLS_8 = __VLS_7;
// @ts-ignore
[];
var __VLS_base = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_export = {};
exports.default = {};
