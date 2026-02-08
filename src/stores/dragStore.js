"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDragStore = void 0;
exports.useActiveUnitStore = useActiveUnitStore;
var pinia_1 = require("pinia");
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var selectedStore_1 = require("@/stores/selectedStore");
exports.useDragStore = (0, pinia_1.defineStore)("drag", {
    state: function () { return ({
        draggedUnit: null,
        draggedFiles: null,
        draggedFeature: null,
    }); },
});
function useActiveUnitStore() {
    var _a = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), unitActions = _a.unitActions, store = _a.store, _b = _a.helpers, getUnitById = _b.getUnitById, getSideById = _b.getSideById, getSideGroupById = _b.getSideGroupById;
    var activeUnitId = (0, selectedStore_1.useSelectedItems)().activeUnitId;
    var activeParentId = (0, utils_1.injectStrict)(injects_1.activeParentKey);
    var activeUnit = (0, vue_1.computed)(function () { return (activeUnitId.value && getUnitById(activeUnitId.value)) || null; });
    var activeParent = (0, vue_1.computed)(function () {
        return (activeParentId.value && unitActions.getUnitOrSideGroup(activeParentId.value)) ||
            null;
    });
    var activeUnitParentIds = (0, vue_1.computed)(function () {
        if (!activeUnitId.value)
            return [];
        var parents = unitActions.getUnitHierarchy(activeUnitId.value).parents;
        return parents.map(function (p) { return p.id; });
    });
    function resetActiveParent() {
        var _a, _b;
        var firstSideId = store.state.sides[0];
        var firstGroup = (_a = getSideById(firstSideId)) === null || _a === void 0 ? void 0 : _a.groups[0];
        activeParentId.value = (_b = getSideGroupById(firstGroup)) === null || _b === void 0 ? void 0 : _b.subUnits[0];
    }
    return {
        activeUnitId: activeUnitId,
        activeUnit: activeUnit,
        activeParent: activeParent,
        activeParentId: activeParentId,
        resetActiveParent: resetActiveParent,
        activeUnitParentIds: activeUnitParentIds,
        clearActiveUnit: function () {
            activeUnitId.value = null;
        },
        setActiveUnit: function (unit) {
            activeUnitId.value = unit.id;
        },
        toggleActiveUnit: function (unit) {
            if (activeUnitId.value === unit.id) {
                this.clearActiveUnit();
            }
            else {
                activeUnitId.value = unit.id;
            }
        },
    };
}
