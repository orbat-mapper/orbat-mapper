"use strict";
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
exports.groupBy = groupBy;
exports.groupByGetter = groupByGetter;
exports.removeElement = removeElement;
exports.moveElement = moveElement;
exports.moveItemMutable = moveItemMutable;
exports.sortBy = sortBy;
exports.mergeArray = mergeArray;
function groupBy(arr, key) {
    return arr.reduce(function (acc, item) {
        acc.set(item[key], __spreadArray(__spreadArray([], (acc.get(item[key]) || []), true), [item], false));
        return acc;
    }, new Map());
}
function groupByGetter(arr, getter) {
    return arr.reduce(function (acc, item) {
        var key = getter(item);
        acc.set(key, __spreadArray(__spreadArray([], (acc.get(key) || []), true), [item], false));
        return acc;
    }, new Map());
}
function removeElement(value, array) {
    var index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
}
// https://gist.github.com/albertein/4496103
function moveElement(array, element, delta) {
    var index = array.indexOf(element);
    var newIndex = index + delta;
    if (newIndex < 0 || newIndex === array.length) {
        return;
    }
    var indexes = [index, newIndex].sort();
    array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]);
}
function moveItemMutable(array, fromIndex, toIndex) {
    if (!(fromIndex >= 0 && fromIndex < array.length))
        return array;
    if (!(toIndex >= 0 && toIndex <= array.length))
        return array;
    var item = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, item);
    return array;
}
// sort array by object property
function sortBy(arr, key, ascending) {
    if (ascending === void 0) { ascending = true; }
    return arr.sort(function (a, b) {
        if (ascending) {
            return (a[key] || "") > (b[key] || "") ? 1 : -1;
        }
        else {
            return (a[key] || "") < (b[key] || "") ? 1 : -1;
        }
    });
}
function mergeArray(a, b, key) {
    var map = new Map();
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var item = a_1[_i];
        map.set(item[key], item);
    }
    for (var _a = 0, b_1 = b; _a < b_1.length; _a++) {
        var item = b_1[_a];
        map.set(item[key], item);
    }
    return Array.from(map.values());
}
