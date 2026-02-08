"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.valueUpdater = valueUpdater;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function valueUpdater(updaterOrValue, ref) {
    ref.value =
        typeof updaterOrValue === "function" ? updaterOrValue(ref.value) : updaterOrValue;
}
