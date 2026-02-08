"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCustomSymbolTableStore = exports.useFillColorTableStore = exports.useUnitPersonnelTableStore = exports.useUnitEquipmentTableStore = exports.useUnitSupplyTableStore = exports.useSupplyUoMTableStore = exports.usePersonnelTableStore = exports.useEquipmentTableStore = exports.useSupplyClassTableStore = exports.useSupplyCategoryTableStore = void 0;
var pinia_1 = require("pinia");
var core_1 = require("@vueuse/core");
function tableStoreFactory(storeName) {
    return (0, pinia_1.defineStore)(storeName, function () {
        var columnVisibility = (0, core_1.useLocalStorage)(storeName + "-columnVisibility", {});
        var columnSizing = (0, core_1.useLocalStorage)(storeName + "-columnWidth", {});
        var columnSorting = (0, core_1.useLocalStorage)(storeName + "-sorting", []);
        return { columnVisibility: columnVisibility, columnSizing: columnSizing, columnSorting: columnSorting };
    });
}
exports.useSupplyCategoryTableStore = tableStoreFactory("supplyCategoryTableStore");
exports.useSupplyClassTableStore = tableStoreFactory("supplyClassTableStore");
exports.useEquipmentTableStore = tableStoreFactory("equipmentTableStore");
exports.usePersonnelTableStore = tableStoreFactory("personnelTableStore");
exports.useSupplyUoMTableStore = tableStoreFactory("supplyUoMTableStore");
exports.useUnitSupplyTableStore = tableStoreFactory("unitSupplyTableStore");
exports.useUnitEquipmentTableStore = tableStoreFactory("unitEquipmentTableStore");
exports.useUnitPersonnelTableStore = tableStoreFactory("unitPersonnelTableStore");
exports.useFillColorTableStore = tableStoreFactory("fillColorTableStore");
exports.useCustomSymbolTableStore = tableStoreFactory("customSymbolTableStore");
