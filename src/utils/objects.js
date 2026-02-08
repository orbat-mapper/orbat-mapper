"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enum2Items = enum2Items;
exports.getChangedValues = getChangedValues;
exports.removeUndefined = removeUndefined;
exports.createNameToIdMap = createNameToIdMap;
exports.createNameToIdMapObject = createNameToIdMapObject;
exports.hashObject = hashObject;
function enum2Items(enumType) {
    return Object.entries(enumType).map(function (_a) {
        var label = _a[0], value = _a[1];
        return ({
            label: label,
            value: value,
        });
    });
}
/**
 * Compares two objects and returns the differences between them.
 *
 * @template T
 * @param {Partial<T>} obj1 - The first object, which may contain a subset of the properties of `T`.
 * @param {T} obj2 - The second object, which is a complete object of type `T`.
 * @returns {Partial<T>} An object containing the properties that have different values between `obj1` and `obj2`.
 */
function getChangedValues(obj1, obj2) {
    var diff = {};
    Object.keys(obj1).forEach(function (key) {
        if (obj2[key] !== obj1[key]) {
            diff[key] = obj1[key];
        }
    });
    return diff;
}
function removeUndefined(obj) {
    return Object.fromEntries(Object.entries(obj).filter(function (_a) {
        var _ = _a[0], v = _a[1];
        return v !== undefined;
    }));
}
/**
 * Creates a map from item names to their IDs.
 *
 * @template T - The type of the items, which must include `name` and `id` properties.
 * @param {Record<string, T>} items - The items to create the map from.
 * @returns {Map<string, string>} A map where the keys are item names and the values are item IDs.
 */
function createNameToIdMap(items) {
    return new Map(Object.values(items).map(function (e) { return [e.name, e.id]; }));
}
/**
 * Creates an object from item names to their IDs.
 *
 * @template T - The type of the items, which must include `name` and `id` properties.
 * @param {Record<string, T>} items - The items to create the object from.
 * @returns {Record<string, string>} An object where the keys are item names and the values are item IDs.
 */
function createNameToIdMapObject(items) {
    return Object.fromEntries(Object.values(items).map(function (e) { return [e.name, e.id]; }));
}
// Simple hash function (djb2 algorithm)
function simpleHash(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + c
    }
    return hash >>> 0; // Convert to unsigned
}
// Stable stringify to guarantee consistent key order
function stableStringify(obj) {
    if (obj === null)
        return "null";
    if (typeof obj !== "object")
        return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return "[" + obj.map(stableStringify).join(",") + "]";
    }
    return ("{" +
        Object.keys(obj)
            .sort()
            .map(function (key) { return JSON.stringify(key) + ":" + stableStringify(obj[key]); })
            .join(",") +
        "}");
}
// Hash a JS object
function hashObject(obj) {
    var str = stableStringify(obj);
    return simpleHash(str).toString(16); // Returns a hex string
}
