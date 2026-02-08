"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectStrict = injectStrict;
exports.injectStrictWithSelf = injectStrictWithSelf;
// from https://logaretm.com/blog/making-the-most-out-of-vuejs-injections/
var vue_1 = require("vue");
function injectStrict(key, fallback) {
    var resolved = (0, vue_1.inject)(key, fallback);
    if (!resolved) {
        throw new Error("Could not resolve ".concat(key.description));
    }
    return resolved;
}
function injectStrictWithSelf(key) {
    var vm = (0, vue_1.getCurrentInstance)();
    return (vm === null || vm === void 0 ? void 0 : vm.provides[key]) || injectStrict(key);
}
