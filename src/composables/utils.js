"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doFocus = void 0;
exports.biSyncDelayedRef = biSyncDelayedRef;
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
// Based on https://vueuse.org/shared/bisyncref/#usage
function biSyncDelayedRef(a, b, delay) {
    if (delay === void 0) { delay = 200; }
    var flush = "sync";
    var stop1 = (0, vue_1.watch)(a, function (newValue) {
        (0, core_1.useTimeoutFn)(function () {
            b.value = newValue;
        }, delay);
    }, {
        flush: flush,
        immediate: true,
    });
    var stop2 = (0, vue_1.watch)(b, function (newValue) {
        (0, core_1.useTimeoutFn)(function () {
            a.value = newValue;
        }, delay);
    }, {
        flush: flush,
        immediate: true,
    });
    return function () {
        stop1();
        stop2();
    };
}
var doFocus = function (_a) {
    var el = _a.el;
    el === null || el === void 0 ? void 0 : el.focus();
};
exports.doFocus = doFocus;
