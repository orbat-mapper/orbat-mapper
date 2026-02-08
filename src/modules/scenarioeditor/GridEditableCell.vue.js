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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var utils_1 = require("@/composables/utils");
var helpers_1 = require("@/components/helpers");
var props = withDefaults(defineProps(), { cellType: "text" });
var emit = defineEmits(["update", "nextCell", "active", "edit"]);
var editMode = (0, vue_1.ref)(false);
var selected = (0, vue_1.ref)(false);
var root = (0, vue_1.ref)(null);
var timeoutId = -1;
var justFocused = false;
var valueCopy = "";
var iValue = (0, vue_1.ref)("");
var externalEdit = (0, vue_1.computed)(function () { return ["sidc", "markdown"].includes(props.cellType); });
function enterEditMode(initialValue) {
    if (editMode.value)
        return;
    valueCopy = props.value;
    iValue.value = initialValue !== null && initialValue !== void 0 ? initialValue : (props.value || "");
    editMode.value = true;
}
function doCancel() {
    var _a;
    iValue.value = valueCopy || "";
    editMode.value = false;
    (_a = root.value) === null || _a === void 0 ? void 0 : _a.focus();
}
function onFocus() {
    justFocused = true;
    selected.value = true;
    timeoutId = window.setTimeout(function () { return (justFocused = false); }, 500);
    emit("active");
}
function onBlur() {
    clearTimeout(timeoutId);
    selected.value = false;
}
function onEnter() {
    var _a;
    if (externalEdit.value) {
        handleExternalEdit();
        return;
    }
    if (!editMode.value) {
        enterEditMode();
    }
    else {
        (_a = root.value) === null || _a === void 0 ? void 0 : _a.focus();
        emit("nextCell", root.value);
    }
}
function onEditBlur() {
    selected.value = false;
    editMode.value = false;
    if (iValue.value !== valueCopy)
        emit("update", iValue.value);
}
function onClick() {
    if (!justFocused) {
        if (externalEdit.value) {
            handleExternalEdit();
        }
        else {
            enterEditMode();
        }
    }
}
function onKeydown(event) {
    if (editMode.value)
        return;
    if (["INPUT", "TEXTAREA"].includes(event.target.tagName))
        return;
    if ((0, helpers_1.isTypedCharValid)(event)) {
        enterEditMode("");
    }
}
function handleExternalEdit() {
    emit("edit", props.value);
}
var __VLS_defaults = { cellType: "text" };
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onKeydown: (__VLS_ctx.onKeydown) }, { onKeydown: (__VLS_ctx.onEnter) }), { onKeydown: (__VLS_ctx.doCancel) }), { onClick: (__VLS_ctx.onClick) }), { onFocus: (__VLS_ctx.onFocus) }), { onBlur: (__VLS_ctx.onBlur) }), { ref: "root" }), { class: "editable-cell border-card text-muted-foreground focus-within:border-ring truncate border-2 px-3 py-3 text-sm whitespace-nowrap outline-0" }), { tabindex: "0", id: ("cell-".concat(__VLS_ctx.rowIndex, "-").concat(__VLS_ctx.colIndex)) }));
/** @type {__VLS_StyleScopedClasses['editable-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['border-card']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:border-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-0']} */ ;
if (__VLS_ctx.editMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign({ onSubmit: (__VLS_ctx.) }));
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)(__assign(__assign(__assign(__assign(__assign({ 'onVue:mounted': (__VLS_ctx.doFocus) }, { onFocus: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.editMode))
                return;
            __VLS_ctx.selected = true;
            // @ts-ignore
            [onKeydown, onEnter, doCancel, onClick, onFocus, onBlur, rowIndex, colIndex, editMode, , utils_1.doFocus, selected,];
        } }), { onBlur: (__VLS_ctx.onEditBlur) }), { type: "text" }), { class: "text-foreground m-0 -my-3 w-full border-none bg-transparent p-0 focus:ring-0" }), { value: (__VLS_ctx.iValue) }));
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['m-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['-my-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-0']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ([{ 'cursor-pointer': __VLS_ctx.externalEdit }, 'text-foreground']) }));
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
    (__VLS_ctx.value);
}
// @ts-ignore
[onEditBlur, iValue, externalEdit, value,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
