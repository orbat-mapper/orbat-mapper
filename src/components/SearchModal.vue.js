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
var vue_1 = require("vue");
var vue_global_events_1 = require("vue-global-events");
var SimpleModal_vue_1 = require("./SimpleModal.vue");
var core_1 = require("@vueuse/core");
var SearchModalInput_vue_1 = require("./SearchModalInput.vue");
var SearchUnitHit_vue_1 = require("./SearchUnitHit.vue");
var ToggleField_vue_1 = require("./ToggleField.vue");
var utils_1 = require("../utils");
var SearchFeatureHit_vue_1 = require("./SearchFeatureHit.vue");
var fuzzysort = require("fuzzysort");
var injects_1 = require("@/components/injects");
var open = defineModel({ default: false });
var emit = defineEmits(["select-unit", "select-layer", "select-feature"]);
var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, geo = _a.geo, getUnitById = _a.helpers.getUnitById;
var query = (0, vue_1.ref)("");
var debouncedQuery = (0, core_1.useDebounce)(query, 200);
var currentHitIndex = (0, vue_1.ref)(0);
var limitToPosition = (0, vue_1.ref)(false);
var unitHits = (0, vue_1.computed)(function () {
    var q = debouncedQuery.value.trim();
    if (!q)
        return [];
    var hits = fuzzysort.go(q, unitActions.units.value, { keys: ["name", "shortName"] });
    currentHitIndex.value = 0;
    return hits
        .filter(function (h) {
        var _a, _b;
        if (limitToPosition.value)
            return (_b = (_a = getUnitById(h.obj.id)) === null || _a === void 0 ? void 0 : _a._state) === null || _b === void 0 ? void 0 : _b.location;
        return true;
    })
        .slice(0, 10)
        .map(function (u, i) {
        var parent = u.obj._pid && __assign({}, getUnitById(u.obj._pid));
        if (parent) {
            parent.symbolOptions = unitActions.getCombinedSymbolOptions(parent);
        }
        return {
            name: u.obj.name,
            sidc: u.obj.sidc,
            id: u.obj.id,
            parent: parent,
            highlight: u[0] &&
                fuzzysort.highlight(__assign(__assign({}, u[0]), { score: u.score, target: (0, utils_1.htmlTagEscape)(u[0].target) })),
            score: u.score,
            category: "Units",
            symbolOptions: unitActions.getCombinedSymbolOptions(u.obj),
        };
    });
});
var featureHits = (0, vue_1.computed)(function () {
    var q = debouncedQuery.value.trim();
    if (!q)
        return [];
    var hits = fuzzysort.go(q, geo.itemsInfo.value, { key: ["name"] });
    currentHitIndex.value = 0;
    return hits.slice(0, 10).map(function (u, i) { return (__assign(__assign({}, u.obj), { highlight: fuzzysort.highlight(__assign(__assign({}, u), { target: (0, utils_1.htmlTagEscape)(u.target) })), score: u.score, category: "Features" })); });
});
var hits = (0, vue_1.computed)(function () {
    var combinedHits = [unitHits.value, featureHits.value].sort(function (a, b) {
        var _a, _b, _c, _d;
        var scoreA = (_b = (_a = a[0]) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 1000;
        var scoreB = (_d = (_c = b[0]) === null || _c === void 0 ? void 0 : _c.score) !== null && _d !== void 0 ? _d : 1000;
        return scoreB - scoreA;
    });
    return __spreadArray([], combinedHits.flat(), true).map(function (e, index) { return (__assign(__assign({}, e), { index: index })); });
});
var groupedHits = (0, vue_1.computed)(function () {
    return (0, utils_1.groupBy)(hits.value, "category");
});
function doKbd(direction) {
    var nHits = hits.value.length;
    if (direction === "up") {
        if (currentHitIndex.value === 0) {
            currentHitIndex.value = nHits - 1;
        }
        else
            currentHitIndex.value = currentHitIndex.value - 1;
    }
    else if (direction === "down") {
        currentHitIndex.value++;
        if (currentHitIndex.value >= nHits) {
            currentHitIndex.value = 0;
        }
    }
}
function onSelect(index) {
    var i = index === undefined ? currentHitIndex.value : index;
    if (!hits.value.length)
        return;
    var item = hits.value[i];
    if (item.category === "Units")
        emit("select-unit", item.id);
    if (item.category === "Features") {
        if (item.type === "layer")
            emit("select-layer", item.id);
        else
            emit("select-feature", item.id, item._pid);
    }
    open.value = false;
}
var __VLS_defaultModels = {
    'modelValue': false,
};
var __VLS_modelEmit;
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = SimpleModal_vue_1.default || SimpleModal_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.open),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.open),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
var __VLS_7 = SearchModalInput_vue_1.default;
// @ts-ignore
var __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    modelValue: (__VLS_ctx.query),
}));
var __VLS_9 = __VLS_8.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.query),
    }], __VLS_functionalComponentArgsRest(__VLS_8), false));
var __VLS_12 = ToggleField_vue_1.default || ToggleField_vue_1.default;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12(__assign({ class: "my-4" }, { modelValue: (__VLS_ctx.limitToPosition) })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "my-4" }, { modelValue: (__VLS_ctx.limitToPosition) })], __VLS_functionalComponentArgsRest(__VLS_13), false));
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
var __VLS_17 = __VLS_15.slots.default;
// @ts-ignore
[open, query, limitToPosition,];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
for (var _i = 0, _b = __VLS_vFor((__VLS_ctx.groupedHits)); _i < _b.length; _i++) {
    var _c = _b[_i][0], source = _c[0], hits_1 = _c[1];
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (source);
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "space-y-1.5" }));
    /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
    var _loop_1 = function (hit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onSelect(hit.index);
                // @ts-ignore
                [groupedHits, onSelect,];
            } }, { type: "button" }), { class: "hover:border-army flex w-full items-center rounded border border-transparent p-2 hover:border hover:bg-red-100 focus:ring-3" }), { class: (hit.index === __VLS_ctx.currentHitIndex ? 'bg-blue-200' : 'bg-muted') }));
        /** @type {__VLS_StyleScopedClasses['hover:border-army']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-red-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-3']} */ ;
        if (hit.category === 'Units') {
            var __VLS_18 = SearchUnitHit_vue_1.default;
            // @ts-ignore
            var __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                unit: (hit),
            }));
            var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([{
                    unit: (hit),
                }], __VLS_functionalComponentArgsRest(__VLS_19), false));
        }
        else if (hit.category === 'Features') {
            var __VLS_23 = SearchFeatureHit_vue_1.default;
            // @ts-ignore
            var __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
                feature: (hit),
            }));
            var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
                    feature: (hit),
                }], __VLS_functionalComponentArgsRest(__VLS_24), false));
        }
        // @ts-ignore
        [currentHitIndex,];
    };
    for (var _d = 0, _e = __VLS_vFor((hits_1)); _d < _e.length; _d++) {
        var hit = _e[_d][0];
        _loop_1(hit);
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.open) {
    var __VLS_28 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.GlobalEvents | typeof __VLS_components.GlobalEvents} */
    vue_global_events_1.GlobalEvents;
    // @ts-ignore
    var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28(__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} })));
    var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([__assign(__assign({ 'onKeydown': {} }, { 'onKeydown': {} }), { 'onKeydown': {} })], __VLS_functionalComponentArgsRest(__VLS_29), false));
    var __VLS_33 = void 0;
    var __VLS_34 = ({ keydown: {} },
        { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.doKbd('down');
                // @ts-ignore
                [open, doKbd,];
            } });
    var __VLS_35 = ({ keydown: {} },
        { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.doKbd('up');
                // @ts-ignore
                [doKbd,];
            } });
    var __VLS_36 = ({ keydown: {} },
        { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.onSelect();
                // @ts-ignore
                [onSelect,];
            } });
    var __VLS_31;
    var __VLS_32;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: __assign(__assign({}, {}), {}),
    __typeProps: {},
});
exports.default = {};
