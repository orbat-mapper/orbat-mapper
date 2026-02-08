"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImmerStore = useImmerStore;
/**
 * A custom store based on https://github.com/Korijn/vue-store
 */
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var immer_1 = require("immer");
var rfc6902_1 = require("rfc6902");
(0, immer_1.enablePatches)();
(0, immer_1.setAutoFreeze)(false);
function applyPatchWrapper(state, patches) {
    var convertedPatches = patches.map(function (_a) {
        var value = _a.value, path = _a.path, op = _a.op;
        return { value: value, op: op, path: "/".concat(path.join("/")) };
    });
    (0, rfc6902_1.applyPatch)(state, convertedPatches);
}
function useImmerStore(baseState) {
    var state = (0, vue_1.reactive)(baseState);
    var past = (0, vue_1.shallowReactive)([]);
    var future = (0, vue_1.shallowReactive)([]);
    var canUndo = (0, vue_1.computed)(function () { return past.length > 0; });
    var canRedo = (0, vue_1.computed)(function () { return future.length > 0; });
    var undoRedoHook = (0, core_1.createEventHook)();
    var update = function (updater, meta, force) {
        if (force === void 0) { force = false; }
        var _a = (0, immer_1.produceWithPatches)((0, vue_1.toRaw)(state), updater), patches = _a[1], inversePatches = _a[2];
        if (patches.length === 0 && !force)
            return;
        applyPatchWrapper(state, patches);
        past.push({ patches: patches, inversePatches: inversePatches, meta: meta });
        future.splice(0);
    };
    function groupUpdate(updates, meta) {
        var preLength = past.length;
        updates();
        var diff = past.length - preLength;
        if (diff <= 0)
            return;
        var elems = [];
        for (var i = 0; i < diff; i++)
            elems.push(past.pop());
        var mergedPatches = [];
        var mergedInversePatches = [];
        elems.forEach(function (_a) {
            var patches = _a.patches, inversePatches = _a.inversePatches;
            mergedPatches.push.apply(mergedPatches, patches);
            mergedInversePatches.push.apply(mergedInversePatches, inversePatches);
        });
        past.push({ patches: mergedPatches, inversePatches: mergedInversePatches, meta: meta });
    }
    var undo = function () {
        if (!canUndo.value)
            return false;
        var _a = past.pop(), patches = _a.patches, inversePatches = _a.inversePatches, meta = _a.meta;
        applyPatchWrapper(state, inversePatches);
        future.unshift({ patches: patches, inversePatches: inversePatches, meta: meta });
        undoRedoHook.trigger({ patch: inversePatches, meta: meta, action: "undo" });
        return true;
    };
    var redo = function () {
        if (!canRedo.value)
            return false;
        var _a = future.shift(), patches = _a.patches, inversePatches = _a.inversePatches, meta = _a.meta;
        applyPatchWrapper(state, patches);
        past.push({ patches: patches, inversePatches: inversePatches, meta: meta });
        undoRedoHook.trigger({ patch: patches, meta: meta, action: "redo" });
        return true;
    };
    var clearUndoRedoStack = function () {
        past.splice(0);
        future.splice(0);
    };
    return {
        state: state,
        update: update,
        redo: redo,
        undo: undo,
        clearUndoRedoStack: clearUndoRedoStack,
        canRedo: canRedo,
        canUndo: canUndo,
        groupUpdate: groupUpdate,
        onUndoRedo: undoRedoHook.on,
    };
}
