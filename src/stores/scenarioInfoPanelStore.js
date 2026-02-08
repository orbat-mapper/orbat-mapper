"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScenarioInfoPanelStore = void 0;
var pinia_1 = require("pinia");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
exports.useScenarioInfoPanelStore = (0, pinia_1.defineStore)("scenarioInfoPanel", function () {
    var tabIndex = (0, vue_1.ref)(0);
    var showAddEquipment = (0, vue_1.ref)(false);
    var toggleAddEquipment = (0, core_1.useToggle)(showAddEquipment);
    var showAddPersonnel = (0, vue_1.ref)(false);
    var toggleAddPersonnel = (0, core_1.useToggle)(showAddPersonnel);
    var showAddGroup = (0, vue_1.ref)(false);
    var toggleAddGroup = (0, core_1.useToggle)(showAddGroup);
    var showAddSupplies = (0, vue_1.ref)(false);
    var toggleAddSupplies = (0, core_1.useToggle)(showAddSupplies);
    return {
        tabIndex: tabIndex,
        showAddEquipment: showAddEquipment,
        toggleAddEquipment: toggleAddEquipment,
        showAddPersonnel: showAddPersonnel,
        toggleAddPersonnel: toggleAddPersonnel,
        showAddGroup: showAddGroup,
        toggleAddGroup: toggleAddGroup,
        showAddSupplies: showAddSupplies,
        toggleAddSupplies: toggleAddSupplies,
    };
});
