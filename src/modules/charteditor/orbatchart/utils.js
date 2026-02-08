"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkTree = walkTree;
exports.createElement = createElement;
exports.flattenArray = flattenArray;
exports.arrSum = arrSum;
function walkTree(root, callback) {
    var level = 0;
    function helper(currentUnit, parent) {
        callback(currentUnit, level, parent);
        if (currentUnit.subUnits) {
            level += 1;
            for (var _i = 0, _a = currentUnit.subUnits; _i < _a.length; _i++) {
                var subUnit = _a[_i];
                helper(subUnit, currentUnit);
            }
            level -= 1;
        }
    }
    helper(root, null);
}
function createElement(elementName) {
    return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}
function flattenArray(array) {
    var _a;
    return (_a = []).concat.apply(_a, array);
    // return array.reduce((acc, val) => acc.concat(val), []);
}
function arrSum(array) {
    return array.reduce(function (a, b) { return a + b; }, 0);
}
