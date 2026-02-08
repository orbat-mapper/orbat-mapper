"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePersonnelEditStore = exports.useEquipmentEditStore = exports.useSuppliesEditStore = exports.useToeEditStore = void 0;
var pinia_1 = require("pinia");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
exports.useToeEditStore = (0, pinia_1.defineStore)("toeStore", function () {
    var isToeEditMode = (0, vue_1.ref)(false);
    var toeEditMode = (0, core_1.useLocalStorage)("toeStoreEditMode", "assigned");
    var toggleEditToeMode = (0, core_1.useToggle)(isToeEditMode);
    var showAssigned = (0, core_1.useLocalStorage)("toeStoreShowAssigned", true);
    var showOnHand = (0, core_1.useLocalStorage)("toeStoreShowOnHand", true);
    var showPercentage = (0, core_1.useLocalStorage)("toeStoreShowPercentage", true);
    var changeMode = (0, core_1.useLocalStorage)("toeStoreChangeMode", "absolute");
    return {
        isToeEditMode: isToeEditMode,
        toggleEditToeMode: toggleEditToeMode,
        toeEditMode: toeEditMode,
        showAssigned: showAssigned,
        showOnHand: showOnHand,
        showPercentage: showPercentage,
        changeMode: changeMode,
    };
});
exports.useSuppliesEditStore = (0, pinia_1.defineStore)("suppliesStore", function () {
    var isSuppliesEditMode = (0, vue_1.ref)(false);
    var isOnHandMode = (0, core_1.useLocalStorage)("suppliesStoreIsOnHandMode", false);
    var isDiffMode = (0, core_1.useLocalStorage)("suppliesStoreIsDiffMode", false);
    var diffValue = (0, vue_1.ref)(1);
    return {
        isSuppliesEditMode: isSuppliesEditMode,
        isDiffMode: isDiffMode,
        isOnHandMode: isOnHandMode,
        diffValue: diffValue,
    };
});
exports.useEquipmentEditStore = (0, pinia_1.defineStore)("equipmentStore", function () {
    var isEditMode = (0, vue_1.ref)(false);
    var isOnHandMode = (0, core_1.useLocalStorage)("equipmentStoreIsOnHandMode", false);
    var isDiffMode = (0, core_1.useLocalStorage)("equipmentStoreIsDiffMode", false);
    var showAddForm = (0, core_1.useLocalStorage)("equipmentStoreShowAddForm", false);
    var diffValue = (0, vue_1.ref)(1);
    var includeSubordinates = (0, core_1.useLocalStorage)("equipmentStoreIncludeSubordinates", true);
    return {
        isEditMode: isEditMode,
        isDiffMode: isDiffMode,
        isOnHandMode: isOnHandMode,
        diffValue: diffValue,
        showAddForm: showAddForm,
        includeSubordinates: includeSubordinates,
    };
});
exports.usePersonnelEditStore = (0, pinia_1.defineStore)("personnelStore", function () {
    var isEditMode = (0, vue_1.ref)(false);
    var isOnHandMode = (0, core_1.useLocalStorage)("personnelStoreIsOnHandMode", false);
    var isDiffMode = (0, core_1.useLocalStorage)("personnelStoreIsDiffMode", false);
    var showAddForm = (0, core_1.useLocalStorage)("personnelStoreShowAddForm", false);
    var diffValue = (0, vue_1.ref)(1);
    var includeSubordinates = (0, core_1.useLocalStorage)("personnelStoreIncludeSubordinates", true);
    return {
        isEditMode: isEditMode,
        isDiffMode: isDiffMode,
        isOnHandMode: isOnHandMode,
        diffValue: diffValue,
        showAddForm: showAddForm,
        includeSubordinates: includeSubordinates,
    };
});
