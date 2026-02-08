"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("@/components/ui/field");
var radio_group_1 = require("@/components/ui/radio-group");
var vue_1 = require("vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var scenarioModels_1 = require("@/types/scenarioModels");
var browserScenarios_1 = require("@/composables/browserScenarios");
var newScenarioStore_1 = require("@/scenariostore/newScenarioStore");
var OrbatCellRenderer_vue_1 = require("@/components/OrbatCellRenderer.vue");
var DataGrid_vue_1 = require("@/modules/grid/DataGrid.vue");
var ToggleField_vue_1 = require("@/components/ToggleField.vue");
var notifications_1 = require("@/composables/notifications");
var solid_1 = require("@heroicons/vue/20/solid");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var importExportStore_1 = require("@/stores/importExportStore");
var convertUtils_1 = require("@/importexport/convertUtils");
var dayjs_1 = require("dayjs");
var InlineAlertWarning_vue_1 = require("@/components/InlineAlertWarning.vue");
var supplyManipulations_1 = require("@/scenariostore/supplyManipulations");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var FieldSelect_vue_1 = require("@/components/FieldSelect.vue");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var unitActions = activeScenario.unitActions, settings = activeScenario.settings, scnStore = activeScenario.store, time = activeScenario.time;
var loadScenario = (0, browserScenarios_1.useBrowserScenarios)().loadScenario;
var send = (0, notifications_1.useNotifications)().send;
var store = (0, importExportStore_1.useImportStore)();
var targetState = scnStore.state;
var importMode = (0, vue_1.ref)("side");
var unitImportMode = (0, vue_1.ref)("units-and-state");
var stateMergeMode = (0, vue_1.ref)("replace");
var sideMergeMode = (0, vue_1.ref)("replace");
var groupMergeMode = (0, vue_1.ref)("add_new");
var selectedItems = (0, vue_1.ref)([]);
var selectedEquipment = (0, vue_1.ref)([]);
var selectedPersonnel = (0, vue_1.ref)([]);
var selectedStatuses = (0, vue_1.ref)([]);
var selectedSupplyCategories = (0, vue_1.ref)([]);
var selectedCustomSymbols = (0, vue_1.ref)([]);
var importedState = (0, vue_1.computed)(function () {
    return (0, newScenarioStore_1.prepareScenario)(props.data);
});
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
function getCombinedSymbolOptions(unitOrSideGroup, ignoreUnit) {
    var _a, _b;
    if (ignoreUnit === void 0) { ignoreUnit = false; }
    if (!unitOrSideGroup)
        return {};
    var state = importedState.value;
    var _sid, _gid, reinforcedReduced;
    if ("sidc" in unitOrSideGroup) {
        _sid = unitOrSideGroup._sid;
        _gid = unitOrSideGroup._gid;
        reinforcedReduced = (0, scenarioModels_1.mapReinforcedStatus2Field)(unitOrSideGroup.reinforcedStatus);
    }
    else {
        _sid = unitOrSideGroup._pid;
        _gid = unitOrSideGroup.id;
        ignoreUnit = true;
    }
    return __assign(__assign(__assign(__assign({}, (((_a = state.sideMap[_sid]) === null || _a === void 0 ? void 0 : _a.symbolOptions) || {})), (((_b = state.sideGroupMap[_gid]) === null || _b === void 0 ? void 0 : _b.symbolOptions) || {})), (ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {})), (ignoreUnit ? {} : { reinforcedReduced: reinforcedReduced !== null && reinforcedReduced !== void 0 ? reinforcedReduced : "" }));
}
var stats = (0, vue_1.computed)(function () {
    return {
        units: Object.keys(importedState.value.unitMap).length,
    };
});
var importedSides = (0, vue_1.computed)(function () {
    return importedState.value.sides
        .map(function (id) { return importedState.value.sideMap[id]; })
        .map(function (side) {
        return {
            label: side.name,
            value: side.id,
        };
    });
});
var targetSides = (0, vue_1.computed)(function () {
    return targetState.sides
        .map(function (id) { return targetState.sideMap[id]; })
        .map(function (side) {
        return {
            label: side.name,
            value: side.id,
        };
    });
});
var importedSideGroups = (0, vue_1.computed)(function () {
    var sideId = selectedSourceSideId.value;
    if (!sideId)
        return [];
    var side = importedState.value.sideMap[sideId];
    if (!side)
        return [];
    return side.groups
        .map(function (id) { return importedState.value.sideGroupMap[id]; })
        .map(function (sideGroup) {
        return {
            label: sideGroup.name,
            value: sideGroup.id,
        };
    });
});
var selectedSourceSideId = (0, vue_1.ref)((_a = importedSides.value[0]) === null || _a === void 0 ? void 0 : _a.value);
var selectedTargetSideId = (0, vue_1.ref)((_b = targetSides.value[0]) === null || _b === void 0 ? void 0 : _b.value);
var selectedSourceSideGroupId = (0, vue_1.ref)((_c = importedSideGroups.value[0]) === null || _c === void 0 ? void 0 : _c.value);
var selectedSourceSide = (0, vue_1.computed)(function () {
    return props.data.sides.find(function (s) { return s.id === selectedSourceSideId.value; });
});
var currentData = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    var s = props.data.sides.find(function (s) { return s.id === selectedSourceSideId.value; });
    if (importMode.value === "side") {
        return __spreadArray(__spreadArray([], ((_a = s === null || s === void 0 ? void 0 : s.groups) !== null && _a !== void 0 ? _a : []), true), ((_b = s === null || s === void 0 ? void 0 : s.subUnits) !== null && _b !== void 0 ? _b : []), true);
    }
    var sg = s === null || s === void 0 ? void 0 : s.groups.find(function (g) { return g.id === selectedSourceSideGroupId.value; });
    return (_c = sg === null || sg === void 0 ? void 0 : sg.subUnits) !== null && _c !== void 0 ? _c : [];
});
var currentEquipment = (0, vue_1.computed)(function () {
    var _a;
    return (_a = props.data.equipment) !== null && _a !== void 0 ? _a : [];
});
var currentPersonnel = (0, vue_1.computed)(function () {
    var _a;
    return (_a = props.data.personnel) !== null && _a !== void 0 ? _a : [];
});
var currentUnitStatuses = (0, vue_1.computed)(function () {
    var _a, _b;
    return (_b = (_a = props.data.settings) === null || _a === void 0 ? void 0 : _a.statuses) !== null && _b !== void 0 ? _b : [];
});
var currentSupplyCategories = (0, vue_1.computed)(function () {
    return Object.values(importedState.value.supplyCategoryMap);
});
var currentCustomIcons = (0, vue_1.computed)(function () {
    return Object.values(importedState.value.customSymbolMap);
});
var isSettingsImport = (0, vue_1.computed)(function () {
    return ["statuses", "equipment", "personnel", "supplyCategories", "customSymbols"].includes(importMode.value);
});
var hasExistingUnits = (0, vue_1.computed)(function () {
    return selectedItems.value.some(function (item) { return item.id in targetState.unitMap; });
});
var hasExistingSide = (0, vue_1.computed)(function () {
    return selectedSourceSideId.value in targetState.sideMap;
});
var hasExistingSideGroup = (0, vue_1.computed)(function () {
    return selectedSourceSideGroupId.value in targetState.sideGroupMap;
});
var wantsToImportState = (0, vue_1.computed)(function () {
    return unitImportMode.value === "units-and-state" || unitImportMode.value === "state-only";
});
var sources = [
    { value: "side", label: "Side" },
    {
        value: "group",
        label: "Group",
    },
    { value: "equipment", label: "Equipment" },
    { value: "personnel", label: "Personnel" },
    { value: "statuses", label: "Statuses" },
    {
        value: "supplyCategories",
        label: "Supply",
    },
    {
        value: "customSymbols",
        label: "Symbols",
    },
];
(0, vue_1.watch)(selectedSourceSideId, function (newSide) {
    var side = importedState.value.sideMap[newSide];
    selectedSourceSideGroupId.value = side.groups[0];
});
(0, vue_1.watch)(hasExistingUnits, function (exists) {
    if (!exists && unitImportMode.value === "state-only") {
        unitImportMode.value = "units-and-state";
    }
});
function renderExpandCell(_a) {
    var _b;
    var getValue = _a.getValue, row = _a.row;
    var symbolOptions = getCombinedSymbolOptions(importedState.value.unitMap[row.original.id]);
    symbolOptions.customSymbolMap = (_b = importedState.value.customSymbolMap) !== null && _b !== void 0 ? _b : {};
    return (0, vue_1.h)(OrbatCellRenderer_vue_1.default, {
        value: getValue(),
        sidc: row.original.sidc,
        expanded: row.getIsExpanded(),
        level: row.depth,
        canExpand: row.getCanExpand(),
        onToggle: row.getToggleExpandedHandler(),
        symbolOptions: symbolOptions,
    });
}
var computedColumns = (0, vue_1.computed)(function () {
    return [
        {
            accessorFn: function (f) { return f.name; },
            id: "name",
            cell: renderExpandCell,
            header: function (_a) {
                var table = _a.table;
                return (0, vue_1.h)("button", {
                    type: "button",
                    title: "Expand/collapse all",
                    onClick: table.getToggleAllRowsExpandedHandler(),
                    class: "flex items-center gap-2",
                }, [
                    (0, vue_1.h)(solid_1.ChevronRightIcon, {
                        class: [
                            "size-6 transform transition-transform text-muted-foreground",
                            table.getIsAllRowsExpanded() ? "rotate-90" : "",
                        ],
                    }),
                    "Name",
                ]);
            },
            enableGlobalFilter: false,
            size: 350,
            enableSorting: false,
        },
        {
            accessorFn: function (f) {
                var _a;
                return ((_a = f.state) === null || _a === void 0 ? void 0 : _a.length)
                    ? fmt.trackFormatter.format(+new Date(f.state[f.state.length - 1].t)) +
                        " (".concat(f.state.length, ")")
                    : "";
            },
            id: "t",
            header: "Last state entry",
            enableSorting: false,
            size: 235,
        },
        {
            accessorFn: function (f) {
                return f.id in targetState.unitMap || f.id in targetState.sideGroupMap ? "Yes" : "No";
            },
            id: "exists",
            header: "Exists?",
            enableSorting: false,
            size: 90,
        },
        {
            accessorFn: function (f) {
                var _a, _b;
                if (!((_a = f.state) === null || _a === void 0 ? void 0 : _a.length))
                    return "";
                var existingUnit = targetState.unitMap[f.id];
                if (!existingUnit)
                    return "";
                if (!((_b = existingUnit.state) === null || _b === void 0 ? void 0 : _b.length))
                    return "";
                var lastTimestamp = existingUnit.state[existingUnit.state.length - 1].t;
                var lastSourceTimestamp = f.state[f.state.length - 1].t;
                var diff = +new Date(lastSourceTimestamp) - lastTimestamp;
                if (diff === 0)
                    return "";
                return dayjs_1.default.duration(diff).toISOString();
            },
            id: "diff",
            header: "Diff",
            enableSorting: false,
        },
    ];
});
var equipmentColumns = [
    {
        accessorFn: function (f) { return f.name; },
        id: "name",
        header: "Name",
        size: 400,
    },
    {
        accessorFn: function (f) { return f.description; },
        id: "description",
        header: "Description",
    },
];
var personnelColumns = [
    {
        accessorFn: function (f) { return f.name; },
        id: "name",
        header: "Name",
        size: 400,
    },
    {
        accessorFn: function (f) { return f.description; },
        id: "description",
        header: "Description",
    },
];
var statusColumns = [
    {
        accessorFn: function (f) { return f.name; },
        id: "name",
        header: "Name",
        size: 400,
    },
    {
        accessorFn: function (f) { return f.description; },
        id: "description",
        header: "Description",
    },
];
var supplyCategoryColumns = [
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    {
        id: "class",
        header: "Class",
        accessorFn: function (f) { return (0, supplyManipulations_1.getSupplyClass)(f, importedState.value); },
    },
    {
        id: "unit",
        header: "Unit",
        accessorFn: function (f) { return (0, supplyManipulations_1.getUom)(f, importedState.value); },
        size: 80,
    },
    {
        id: "description",
        header: "Description",
        accessorKey: "description",
        size: 100,
    },
];
var customIconColumns = [
    {
        accessorFn: function (f) { return f.name; },
        id: "name",
        header: "Name",
        size: 400,
    },
    {
        id: "src",
        header: "Icon",
        accessorKey: "src",
        enableSorting: false,
        cell: function (_a) {
            var getValue = _a.getValue;
            return (0, vue_1.h)("img", {
                width: 32,
                height: 32,
                src: getValue(),
            });
        },
        size: 100,
    },
    { id: "id", header: "Id", accessorKey: "id", size: 150 },
    {
        accessorFn: function (f) { return (f.id in targetState.customSymbolMap ? "Yes" : "No"); },
        id: "exists",
        header: "Exists?",
        enableSorting: false,
        size: 90,
    },
];
// check that the item is a unit
function isUnit(item) {
    return "sidc" in item;
}
function onFormSubmit() {
    return __awaiter(this, void 0, void 0, function () {
        var selectedUnitIds;
        return __generator(this, function (_a) {
            selectedUnitIds = new Set(selectedItems.value.filter(isUnit).map(function (u) { return u.id; }));
            console.log("import mode", importMode.value);
            if (importMode.value === "equipment") {
                doEquipmentImport(selectedEquipment.value);
            }
            else if (importMode.value === "personnel") {
                doPersonnelImport(selectedPersonnel.value);
            }
            else if (importMode.value === "statuses") {
                doStatusImport(selectedStatuses.value);
            }
            else if (importMode.value === "supplyCategories") {
                doSupplyCategoryImport(selectedSupplyCategories.value);
            }
            else if (importMode.value === "customSymbols") {
                doCustomSymbolImport(selectedCustomSymbols.value);
            }
            else if (unitImportMode.value === "state-only") {
                doStateOnlyImport(selectedUnitIds);
            }
            else if (importMode.value === "side" && selectedSourceSideId.value) {
                doSideImport(selectedSourceSideId.value);
            }
            else if (importMode.value === "group" && selectedSourceSideGroupId.value) {
                doGroupImport(selectedSourceSideGroupId.value);
            }
            time.setCurrentTime(targetState.currentTime);
            targetState.unitStateCounter++;
            send({
                message: "Imported data from scenario",
                type: "success",
            });
            if (!store.keepOpen)
                emit("loaded");
            return [2 /*return*/];
        });
    });
}
function doEquipmentImport(selectedEquipment) {
    var nameToIdMap = (0, utils_1.createNameToIdMap)(targetState.equipmentMap);
    scnStore.groupUpdate(function () {
        for (var _i = 0, selectedEquipment_1 = selectedEquipment; _i < selectedEquipment_1.length; _i++) {
            var equipment = selectedEquipment_1[_i];
            if (nameToIdMap.has(equipment.name)) {
                continue;
            }
            unitActions.addEquipment(equipment);
        }
    });
}
function doPersonnelImport(selectedPersonnel) {
    var nameToIdMap = (0, utils_1.createNameToIdMap)(targetState.personnelMap);
    scnStore.groupUpdate(function () {
        for (var _i = 0, selectedPersonnel_1 = selectedPersonnel; _i < selectedPersonnel_1.length; _i++) {
            var personnel = selectedPersonnel_1[_i];
            if (nameToIdMap.has(personnel.name)) {
                continue;
            }
            unitActions.addPersonnel(personnel);
        }
    });
}
function doStatusImport(selectedStatuses) {
    var nameToIdMap = (0, utils_1.createNameToIdMap)(targetState.unitStatusMap);
    scnStore.groupUpdate(function () {
        for (var _i = 0, selectedStatuses_1 = selectedStatuses; _i < selectedStatuses_1.length; _i++) {
            var status_1 = selectedStatuses_1[_i];
            if (nameToIdMap.has(status_1.name)) {
                continue;
            }
            unitActions.addUnitStatus(status_1);
        }
    });
}
function doCustomSymbolImport(selectedCustomSymbols) {
    console.log("Importing custom symbols", selectedCustomSymbols);
    scnStore.groupUpdate(function () {
        for (var _i = 0, selectedCustomSymbols_1 = selectedCustomSymbols; _i < selectedCustomSymbols_1.length; _i++) {
            var symbol = selectedCustomSymbols_1[_i];
            settings.addCustomSymbol(symbol);
        }
    });
}
function doSupplyCategoryImport(selectedSupplyCategories) {
    var supplyCategoryNameToIdMap = (0, utils_1.createNameToIdMap)(targetState.supplyCategoryMap);
    var supplyClassNameToIdMap = (0, utils_1.createNameToIdMap)(targetState.supplyClassMap);
    var supplyUomNameToIdMap = (0, utils_1.createNameToIdMap)(targetState.supplyUomMap);
    scnStore.groupUpdate(function () {
        var _a, _b;
        for (var _i = 0, selectedSupplyCategories_1 = selectedSupplyCategories; _i < selectedSupplyCategories_1.length; _i++) {
            var supplyCategory = selectedSupplyCategories_1[_i];
            // skip supply categories with same name as existing ones
            if (supplyCategoryNameToIdMap.has(supplyCategory.name)) {
                continue;
            }
            var supplyClassId = supplyCategory.supplyClass;
            // check if supply class exists
            var supplyClass = importedState.value.supplyClassMap[(_a = supplyCategory.supplyClass) !== null && _a !== void 0 ? _a : ""];
            if (supplyClass) {
                supplyClassId = supplyClassNameToIdMap.get(supplyClass.name);
                if (!supplyClassId) {
                    supplyClassId = unitActions.addSupplyClass(supplyClass);
                }
            }
            // check if uom exists
            var uomId = supplyCategory.uom;
            var uom = importedState.value.supplyUomMap[(_b = supplyCategory.uom) !== null && _b !== void 0 ? _b : ""];
            if (uom) {
                uomId = supplyUomNameToIdMap.get(uom.name);
                if (!uomId) {
                    uomId = unitActions.addSupplyUom(uom);
                }
            }
            unitActions.addSupplyCategory(__assign(__assign({}, supplyCategory), { supplyClass: supplyClassId, uom: uomId }));
        }
    });
}
function doStateOnlyImport(selectedUnitIds) {
    scnStore.groupUpdate(function () {
        var _a, _b;
        var _loop_1 = function (importedUnitId) {
            var importedUnit = importedState.value.unitMap[importedUnitId];
            if (!importedUnit || !((_a = importedUnit.state) === null || _a === void 0 ? void 0 : _a.length)) {
                return "continue";
            }
            var existingUnit = targetState.unitMap[importedUnit.id];
            if (!existingUnit) {
                return "continue";
            }
            if (stateMergeMode.value === "replace" || !((_b = existingUnit.state) === null || _b === void 0 ? void 0 : _b.length)) {
                unitActions.setUnitState(existingUnit.id, importedUnit.state);
            }
            else {
                var lastTimestamp_1 = existingUnit.state[existingUnit.state.length - 1].t;
                var newStates = importedUnit.state.filter(function (s) { return s.t > lastTimestamp_1; });
                if (newStates.length) {
                    unitActions.setUnitState(existingUnit.id, __spreadArray(__spreadArray([], existingUnit.state, true), newStates, true));
                }
            }
        };
        for (var _i = 0, selectedUnitIds_1 = selectedUnitIds; _i < selectedUnitIds_1.length; _i++) {
            var importedUnitId = selectedUnitIds_1[_i];
            _loop_1(importedUnitId);
        }
    });
}
function doSideImport(importedSideId) {
    var sideAlreadyExists = hasExistingSide.value;
    var importedSide = importedState.value.sideMap[importedSideId];
    var createNewId = sideAlreadyExists && sideMergeMode.value === "add_new";
    scnStore.groupUpdate(function () {
        var deletedSideIndex = -1;
        if (sideAlreadyExists && sideMergeMode.value === "replace") {
            deletedSideIndex = targetState.sides.findIndex(function (id) { return id === importedSideId; });
            unitActions.deleteSide(importedSideId);
        }
        var addedSideId = unitActions.addSide(importedSide, {
            addDefaultGroup: false,
            markAsNew: false,
            newId: createNewId,
        });
        if (deletedSideIndex !== -1) {
            var nextSideId = targetState.sides[deletedSideIndex + 1];
            if (nextSideId)
                unitActions.moveSide(addedSideId, nextSideId, "above");
        }
        for (var _i = 0, _a = currentData.value; _i < _a.length; _i++) {
            var item = _a[_i];
            if (isUnit(item)) {
                (0, convertUtils_1.addUnitHierarchy)(item, addedSideId, activeScenario, {
                    newIds: createNewId,
                    includeState: unitImportMode.value === "units-and-state",
                    sourceState: importedState.value,
                });
                continue;
            }
            var groupId = item.id;
            var importedGroup = importedState.value.sideGroupMap[groupId];
            var addedGroupId = unitActions.addSideGroup(addedSideId, __assign(__assign({}, importedGroup), { _isNew: false }), {
                newId: createNewId,
            });
            if (!item.subUnits || !addedGroupId)
                continue;
            for (var _b = 0, _c = item.subUnits; _b < _c.length; _b++) {
                var unit = _c[_b];
                (0, convertUtils_1.addUnitHierarchy)(unit, addedGroupId, activeScenario, {
                    newIds: createNewId,
                    includeState: unitImportMode.value === "units-and-state",
                    sourceState: importedState.value,
                });
            }
        }
    });
}
function doGroupImport(importedGroupId) {
    var importedGroup = importedState.value.sideGroupMap[importedGroupId];
    var targetSideId = selectedTargetSideId.value;
    if (!importedGroup)
        return;
    var groupAlreadyExists = importedGroupId in targetState.sideGroupMap;
    var createNewId = groupAlreadyExists && groupMergeMode.value === "add_new";
    scnStore.groupUpdate(function () {
        var deletedGroupIndex = -1;
        if (groupAlreadyExists && groupMergeMode.value === "replace") {
            deletedGroupIndex = targetState.sideMap[targetSideId].groups.findIndex(function (id) { return id === importedGroupId; });
            unitActions.deleteSideGroup(importedGroupId);
        }
        var importedGroup = importedState.value.sideGroupMap[importedGroupId];
        var addedGroupId = unitActions.addSideGroup(targetSideId, __assign(__assign({}, importedGroup), { _isNew: false }), {
            newId: createNewId,
        });
        if (!addedGroupId)
            return;
        if (deletedGroupIndex !== -1) {
            scnStore.update(function (s) {
                var groups = s.sideMap[targetSideId].groups;
                (0, utils_1.moveItemMutable)(groups, groups.length - 1, deletedGroupIndex);
            });
        }
        for (var _i = 0, _a = currentData.value; _i < _a.length; _i++) {
            var unit = _a[_i];
            (0, convertUtils_1.addUnitHierarchy)(unit, addedGroupId, activeScenario, {
                newIds: createNewId,
                includeState: unitImportMode.value === "units-and-state",
                sourceState: importedState.value,
            });
        }
    });
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import scenario data",
    subtitle: "Import data from another Orbat Mapper scenario",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import scenario data",
        subtitle: "Import data from another Orbat Mapper scenario",
        helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
        hasSidebar: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.actions;
    var __VLS_8 = ToggleField_vue_1.default || ToggleField_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign({ modelValue: (__VLS_ctx.store.keepOpen) }, { class: "mr-4" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.store.keepOpen) }, { class: "mr-4" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
    var __VLS_13 = __VLS_11.slots.default;
    // @ts-ignore
    [store,];
    var __VLS_11;
    var __VLS_14 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_15), false));
    var __VLS_19 = void 0;
    var __VLS_20 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.emit('cancel');
                // @ts-ignore
                [emit,];
            } });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_21 = __VLS_17.slots.default;
    // @ts-ignore
    [];
    var __VLS_17;
    var __VLS_18;
    var __VLS_22 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22(__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_24 = __VLS_23.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { primary: true, small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_23), false));
    var __VLS_27 = void 0;
    var __VLS_28 = ({ click: {} },
        { onClick: (__VLS_ctx.onFormSubmit) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_29 = __VLS_25.slots.default;
    // @ts-ignore
    [onFormSubmit,];
    var __VLS_25;
    var __VLS_26;
    // @ts-ignore
    [];
}
{
    var __VLS_30 = __VLS_3.slots.sidebar;
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Card | typeof __VLS_components.Card} */
    card_1.Card;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_32), false));
    var __VLS_36 = __VLS_34.slots.default;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CardHeader | typeof __VLS_components.CardHeader} */
    card_1.CardHeader;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ class: "py-3" })));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ class: "py-3" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    var __VLS_42 = __VLS_40.slots.default;
    var __VLS_43 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CardTitle | typeof __VLS_components.CardTitle} */
    card_1.CardTitle;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43(__assign({ class: "text-sm" })));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ class: "text-sm" })], __VLS_functionalComponentArgsRest(__VLS_44), false));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    var __VLS_48 = __VLS_46.slots.default;
    (__VLS_ctx.data.name);
    // @ts-ignore
    [data,];
    var __VLS_46;
    if (__VLS_ctx.data.description) {
        var __VLS_49 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.CardDescription | typeof __VLS_components.CardDescription} */
        card_1.CardDescription;
        // @ts-ignore
        var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49(__assign({ class: "text-xs" })));
        var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "text-xs" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        var __VLS_54 = __VLS_52.slots.default;
        (__VLS_ctx.data.description);
        // @ts-ignore
        [data, data,];
        var __VLS_52;
    }
    // @ts-ignore
    [];
    var __VLS_40;
    var __VLS_55 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.CardContent | typeof __VLS_components.CardContent} */
    card_1.CardContent;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55(__assign({ class: "flex items-center justify-between gap-2 py-2" })));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ class: "flex items-center justify-between gap-2 py-2" })], __VLS_functionalComponentArgsRest(__VLS_56), false));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    var __VLS_60 = __VLS_58.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-xs" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.stats.units);
    var __VLS_61 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61(__assign(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" }), { class: "h-auto p-0 text-xs" })));
    var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "button", variant: "link", size: "sm" }), { class: "h-auto p-0 text-xs" })], __VLS_functionalComponentArgsRest(__VLS_62), false));
    var __VLS_66 = void 0;
    var __VLS_67 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.loadScenario(__VLS_ctx.data);
                // @ts-ignore
                [data, stats, loadScenario,];
            } });
    /** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    var __VLS_68 = __VLS_64.slots.default;
    // @ts-ignore
    [];
    var __VLS_64;
    var __VLS_65;
    // @ts-ignore
    [];
    var __VLS_58;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_69 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldGroup | typeof __VLS_components.FieldGroup} */
    field_1.FieldGroup;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({}));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_70), false));
    var __VLS_74 = __VLS_72.slots.default;
    var __VLS_75 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
    field_1.FieldSet;
    // @ts-ignore
    var __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
    var __VLS_77 = __VLS_76.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_76), false));
    var __VLS_80 = __VLS_78.slots.default;
    var __VLS_81 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
    var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_82), false));
    var __VLS_86 = __VLS_84.slots.default;
    // @ts-ignore
    [];
    var __VLS_84;
    var __VLS_87 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldDescription | typeof __VLS_components.FieldDescription} */
    field_1.FieldDescription;
    // @ts-ignore
    var __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({}));
    var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_88), false));
    var __VLS_92 = __VLS_90.slots.default;
    // @ts-ignore
    [];
    var __VLS_90;
    var __VLS_93 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
    radio_group_1.RadioGroup;
    // @ts-ignore
    var __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93(__assign({ modelValue: (__VLS_ctx.importMode) }, { class: "mt-2 grid grid-cols-2 gap-2" })));
    var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.importMode) }, { class: "mt-2 grid grid-cols-2 gap-2" })], __VLS_functionalComponentArgsRest(__VLS_94), false));
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_98 = __VLS_96.slots.default;
    for (var _i = 0, _e = __VLS_vFor((__VLS_ctx.sources)); _i < _e.length; _i++) {
        var _f = _e[_i][0], value = _f.value, label = _f.label;
        var __VLS_99 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
            key: (value),
        }));
        var __VLS_101 = __VLS_100.apply(void 0, __spreadArray([{
                key: (value),
            }], __VLS_functionalComponentArgsRest(__VLS_100), false));
        var __VLS_104 = __VLS_102.slots.default;
        var __VLS_105 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
            orientation: "horizontal",
        }));
        var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([{
                orientation: "horizontal",
            }], __VLS_functionalComponentArgsRest(__VLS_106), false));
        var __VLS_110 = __VLS_108.slots.default;
        var __VLS_111 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111(__assign({ id: (value), value: (value) }, { class: "mt-1" })));
        var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([__assign({ id: (value), value: (value) }, { class: "mt-1" })], __VLS_functionalComponentArgsRest(__VLS_112), false));
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        var __VLS_116 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({}));
        var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_117), false));
        var __VLS_121 = __VLS_119.slots.default;
        var __VLS_122 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
        field_1.FieldTitle;
        // @ts-ignore
        var __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({}));
        var __VLS_124 = __VLS_123.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_123), false));
        var __VLS_127 = __VLS_125.slots.default;
        (label);
        // @ts-ignore
        [importMode, sources,];
        var __VLS_125;
        // @ts-ignore
        [];
        var __VLS_119;
        // @ts-ignore
        [];
        var __VLS_108;
        // @ts-ignore
        [];
        var __VLS_102;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_96;
    // @ts-ignore
    [];
    var __VLS_78;
    // @ts-ignore
    [];
    var __VLS_72;
    if (!__VLS_ctx.isSettingsImport) {
        var __VLS_128 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
        field_1.FieldSet;
        // @ts-ignore
        var __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({}));
        var __VLS_130 = __VLS_129.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_129), false));
        var __VLS_133 = __VLS_131.slots.default;
        var __VLS_134 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({}));
        var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_135), false));
        var __VLS_139 = __VLS_137.slots.default;
        // @ts-ignore
        [isSettingsImport,];
        var __VLS_137;
        var __VLS_140 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
        radio_group_1.RadioGroup;
        // @ts-ignore
        var __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140(__assign({ modelValue: (__VLS_ctx.unitImportMode) }, { class: "mt-2 flex flex-col gap-2" })));
        var __VLS_142 = __VLS_141.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.unitImportMode) }, { class: "mt-2 flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_141), false));
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        var __VLS_145 = __VLS_143.slots.default;
        var __VLS_146 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
            for: "units-only",
        }));
        var __VLS_148 = __VLS_147.apply(void 0, __spreadArray([{
                for: "units-only",
            }], __VLS_functionalComponentArgsRest(__VLS_147), false));
        var __VLS_151 = __VLS_149.slots.default;
        var __VLS_152 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
            orientation: "horizontal",
        }));
        var __VLS_154 = __VLS_153.apply(void 0, __spreadArray([{
                orientation: "horizontal",
            }], __VLS_functionalComponentArgsRest(__VLS_153), false));
        var __VLS_157 = __VLS_155.slots.default;
        var __VLS_158 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
            id: "units-only",
            value: "units-only",
        }));
        var __VLS_160 = __VLS_159.apply(void 0, __spreadArray([{
                id: "units-only",
                value: "units-only",
            }], __VLS_functionalComponentArgsRest(__VLS_159), false));
        var __VLS_163 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({}));
        var __VLS_165 = __VLS_164.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_164), false));
        var __VLS_168 = __VLS_166.slots.default;
        var __VLS_169 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
        field_1.FieldTitle;
        // @ts-ignore
        var __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({}));
        var __VLS_171 = __VLS_170.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_170), false));
        var __VLS_174 = __VLS_172.slots.default;
        // @ts-ignore
        [unitImportMode,];
        var __VLS_172;
        // @ts-ignore
        [];
        var __VLS_166;
        // @ts-ignore
        [];
        var __VLS_155;
        // @ts-ignore
        [];
        var __VLS_149;
        var __VLS_175 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
            for: "units-and-state",
        }));
        var __VLS_177 = __VLS_176.apply(void 0, __spreadArray([{
                for: "units-and-state",
            }], __VLS_functionalComponentArgsRest(__VLS_176), false));
        var __VLS_180 = __VLS_178.slots.default;
        var __VLS_181 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
            orientation: "horizontal",
        }));
        var __VLS_183 = __VLS_182.apply(void 0, __spreadArray([{
                orientation: "horizontal",
            }], __VLS_functionalComponentArgsRest(__VLS_182), false));
        var __VLS_186 = __VLS_184.slots.default;
        var __VLS_187 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
            id: "units-and-state",
            value: "units-and-state",
        }));
        var __VLS_189 = __VLS_188.apply(void 0, __spreadArray([{
                id: "units-and-state",
                value: "units-and-state",
            }], __VLS_functionalComponentArgsRest(__VLS_188), false));
        var __VLS_192 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
        field_1.FieldContent;
        // @ts-ignore
        var __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({}));
        var __VLS_194 = __VLS_193.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_193), false));
        var __VLS_197 = __VLS_195.slots.default;
        var __VLS_198 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
        field_1.FieldTitle;
        // @ts-ignore
        var __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({}));
        var __VLS_200 = __VLS_199.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_199), false));
        var __VLS_203 = __VLS_201.slots.default;
        // @ts-ignore
        [];
        var __VLS_201;
        // @ts-ignore
        [];
        var __VLS_195;
        // @ts-ignore
        [];
        var __VLS_184;
        // @ts-ignore
        [];
        var __VLS_178;
        if (__VLS_ctx.hasExistingUnits) {
            var __VLS_204 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
            field_1.FieldLabel;
            // @ts-ignore
            var __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
                for: "state-only",
            }));
            var __VLS_206 = __VLS_205.apply(void 0, __spreadArray([{
                    for: "state-only",
                }], __VLS_functionalComponentArgsRest(__VLS_205), false));
            var __VLS_209 = __VLS_207.slots.default;
            var __VLS_210 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
            field_1.Field;
            // @ts-ignore
            var __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                orientation: "horizontal",
            }));
            var __VLS_212 = __VLS_211.apply(void 0, __spreadArray([{
                    orientation: "horizontal",
                }], __VLS_functionalComponentArgsRest(__VLS_211), false));
            var __VLS_215 = __VLS_213.slots.default;
            var __VLS_216 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
            radio_group_1.RadioGroupItem;
            // @ts-ignore
            var __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
                id: "state-only",
                value: "state-only",
            }));
            var __VLS_218 = __VLS_217.apply(void 0, __spreadArray([{
                    id: "state-only",
                    value: "state-only",
                }], __VLS_functionalComponentArgsRest(__VLS_217), false));
            var __VLS_221 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
            field_1.FieldContent;
            // @ts-ignore
            var __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({}));
            var __VLS_223 = __VLS_222.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_222), false));
            var __VLS_226 = __VLS_224.slots.default;
            var __VLS_227 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
            field_1.FieldTitle;
            // @ts-ignore
            var __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({}));
            var __VLS_229 = __VLS_228.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_228), false));
            var __VLS_232 = __VLS_230.slots.default;
            // @ts-ignore
            [hasExistingUnits,];
            var __VLS_230;
            // @ts-ignore
            [];
            var __VLS_224;
            // @ts-ignore
            [];
            var __VLS_213;
            // @ts-ignore
            [];
            var __VLS_207;
        }
        // @ts-ignore
        [];
        var __VLS_143;
        // @ts-ignore
        [];
        var __VLS_131;
        if (__VLS_ctx.hasExistingSide || __VLS_ctx.hasExistingSideGroup || __VLS_ctx.hasExistingUnits) {
            var __VLS_233 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldSet | typeof __VLS_components.FieldSet} */
            field_1.FieldSet;
            // @ts-ignore
            var __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({}));
            var __VLS_235 = __VLS_234.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_234), false));
            var __VLS_238 = __VLS_236.slots.default;
            var __VLS_239 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
            field_1.FieldLabel;
            // @ts-ignore
            var __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({}));
            var __VLS_241 = __VLS_240.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_240), false));
            var __VLS_244 = __VLS_242.slots.default;
            // @ts-ignore
            [hasExistingUnits, hasExistingSide, hasExistingSideGroup,];
            var __VLS_242;
            if (__VLS_ctx.hasExistingSide && __VLS_ctx.importMode === 'side' && __VLS_ctx.unitImportMode !== 'state-only') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                var __VLS_245 = InlineAlertWarning_vue_1.default || InlineAlertWarning_vue_1.default;
                // @ts-ignore
                var __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245(__assign({ class: "text-xs" })));
                var __VLS_247 = __VLS_246.apply(void 0, __spreadArray([__assign({ class: "text-xs" })], __VLS_functionalComponentArgsRest(__VLS_246), false));
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                var __VLS_250 = __VLS_248.slots.default;
                ((_d = __VLS_ctx.selectedSourceSide) === null || _d === void 0 ? void 0 : _d.name);
                // @ts-ignore
                [importMode, unitImportMode, hasExistingSide, selectedSourceSide,];
                var __VLS_248;
                var __VLS_251 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
                radio_group_1.RadioGroup;
                // @ts-ignore
                var __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251(__assign({ modelValue: (__VLS_ctx.sideMergeMode) }, { class: "flex flex-col gap-2" })));
                var __VLS_253 = __VLS_252.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.sideMergeMode) }, { class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_252), false));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                var __VLS_256 = __VLS_254.slots.default;
                var __VLS_257 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
                    for: "side-replace",
                }));
                var __VLS_259 = __VLS_258.apply(void 0, __spreadArray([{
                        for: "side-replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_258), false));
                var __VLS_262 = __VLS_260.slots.default;
                var __VLS_263 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_264 = __VLS_asFunctionalComponent1(__VLS_263, new __VLS_263({
                    orientation: "horizontal",
                }));
                var __VLS_265 = __VLS_264.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_264), false));
                var __VLS_268 = __VLS_266.slots.default;
                var __VLS_269 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({
                    id: "side-replace",
                    value: "replace",
                }));
                var __VLS_271 = __VLS_270.apply(void 0, __spreadArray([{
                        id: "side-replace",
                        value: "replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_270), false));
                var __VLS_274 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274({}));
                var __VLS_276 = __VLS_275.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_275), false));
                var __VLS_279 = __VLS_277.slots.default;
                var __VLS_280 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({}));
                var __VLS_282 = __VLS_281.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_281), false));
                var __VLS_285 = __VLS_283.slots.default;
                // @ts-ignore
                [sideMergeMode,];
                var __VLS_283;
                // @ts-ignore
                [];
                var __VLS_277;
                // @ts-ignore
                [];
                var __VLS_266;
                // @ts-ignore
                [];
                var __VLS_260;
                var __VLS_286 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
                    for: "side-add_new",
                }));
                var __VLS_288 = __VLS_287.apply(void 0, __spreadArray([{
                        for: "side-add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_287), false));
                var __VLS_291 = __VLS_289.slots.default;
                var __VLS_292 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
                    orientation: "horizontal",
                }));
                var __VLS_294 = __VLS_293.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_293), false));
                var __VLS_297 = __VLS_295.slots.default;
                var __VLS_298 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_299 = __VLS_asFunctionalComponent1(__VLS_298, new __VLS_298({
                    id: "side-add_new",
                    value: "add_new",
                }));
                var __VLS_300 = __VLS_299.apply(void 0, __spreadArray([{
                        id: "side-add_new",
                        value: "add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_299), false));
                var __VLS_303 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({}));
                var __VLS_305 = __VLS_304.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_304), false));
                var __VLS_308 = __VLS_306.slots.default;
                var __VLS_309 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_310 = __VLS_asFunctionalComponent1(__VLS_309, new __VLS_309({}));
                var __VLS_311 = __VLS_310.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_310), false));
                var __VLS_314 = __VLS_312.slots.default;
                // @ts-ignore
                [];
                var __VLS_312;
                // @ts-ignore
                [];
                var __VLS_306;
                // @ts-ignore
                [];
                var __VLS_295;
                // @ts-ignore
                [];
                var __VLS_289;
                // @ts-ignore
                [];
                var __VLS_254;
            }
            if (__VLS_ctx.hasExistingSideGroup &&
                __VLS_ctx.importMode === 'group' &&
                __VLS_ctx.unitImportMode !== 'state-only') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                var __VLS_315 = InlineAlertWarning_vue_1.default || InlineAlertWarning_vue_1.default;
                // @ts-ignore
                var __VLS_316 = __VLS_asFunctionalComponent1(__VLS_315, new __VLS_315(__assign({ class: "text-xs" })));
                var __VLS_317 = __VLS_316.apply(void 0, __spreadArray([__assign({ class: "text-xs" })], __VLS_functionalComponentArgsRest(__VLS_316), false));
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                var __VLS_320 = __VLS_318.slots.default;
                // @ts-ignore
                [importMode, unitImportMode, hasExistingSideGroup,];
                var __VLS_318;
                var __VLS_321 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
                radio_group_1.RadioGroup;
                // @ts-ignore
                var __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321(__assign({ modelValue: (__VLS_ctx.groupMergeMode) }, { class: "flex flex-col gap-2" })));
                var __VLS_323 = __VLS_322.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.groupMergeMode) }, { class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_322), false));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                var __VLS_326 = __VLS_324.slots.default;
                var __VLS_327 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
                    for: "group-replace",
                }));
                var __VLS_329 = __VLS_328.apply(void 0, __spreadArray([{
                        for: "group-replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_328), false));
                var __VLS_332 = __VLS_330.slots.default;
                var __VLS_333 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_334 = __VLS_asFunctionalComponent1(__VLS_333, new __VLS_333({
                    orientation: "horizontal",
                }));
                var __VLS_335 = __VLS_334.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_334), false));
                var __VLS_338 = __VLS_336.slots.default;
                var __VLS_339 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_340 = __VLS_asFunctionalComponent1(__VLS_339, new __VLS_339({
                    id: "group-replace",
                    value: "replace",
                }));
                var __VLS_341 = __VLS_340.apply(void 0, __spreadArray([{
                        id: "group-replace",
                        value: "replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_340), false));
                var __VLS_344 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_345 = __VLS_asFunctionalComponent1(__VLS_344, new __VLS_344({}));
                var __VLS_346 = __VLS_345.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_345), false));
                var __VLS_349 = __VLS_347.slots.default;
                var __VLS_350 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_351 = __VLS_asFunctionalComponent1(__VLS_350, new __VLS_350({}));
                var __VLS_352 = __VLS_351.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_351), false));
                var __VLS_355 = __VLS_353.slots.default;
                // @ts-ignore
                [groupMergeMode,];
                var __VLS_353;
                // @ts-ignore
                [];
                var __VLS_347;
                // @ts-ignore
                [];
                var __VLS_336;
                // @ts-ignore
                [];
                var __VLS_330;
                var __VLS_356 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_357 = __VLS_asFunctionalComponent1(__VLS_356, new __VLS_356({
                    for: "group-add_new",
                }));
                var __VLS_358 = __VLS_357.apply(void 0, __spreadArray([{
                        for: "group-add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_357), false));
                var __VLS_361 = __VLS_359.slots.default;
                var __VLS_362 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_363 = __VLS_asFunctionalComponent1(__VLS_362, new __VLS_362({
                    orientation: "horizontal",
                }));
                var __VLS_364 = __VLS_363.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_363), false));
                var __VLS_367 = __VLS_365.slots.default;
                var __VLS_368 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_369 = __VLS_asFunctionalComponent1(__VLS_368, new __VLS_368({
                    id: "group-add_new",
                    value: "add_new",
                }));
                var __VLS_370 = __VLS_369.apply(void 0, __spreadArray([{
                        id: "group-add_new",
                        value: "add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_369), false));
                var __VLS_373 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_374 = __VLS_asFunctionalComponent1(__VLS_373, new __VLS_373({}));
                var __VLS_375 = __VLS_374.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_374), false));
                var __VLS_378 = __VLS_376.slots.default;
                var __VLS_379 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_380 = __VLS_asFunctionalComponent1(__VLS_379, new __VLS_379({}));
                var __VLS_381 = __VLS_380.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_380), false));
                var __VLS_384 = __VLS_382.slots.default;
                // @ts-ignore
                [];
                var __VLS_382;
                // @ts-ignore
                [];
                var __VLS_376;
                // @ts-ignore
                [];
                var __VLS_365;
                // @ts-ignore
                [];
                var __VLS_359;
                // @ts-ignore
                [];
                var __VLS_324;
                if (__VLS_ctx.groupMergeMode !== 'replace') {
                    var __VLS_385 = FieldSelect_vue_1.default;
                    // @ts-ignore
                    var __VLS_386 = __VLS_asFunctionalComponent1(__VLS_385, new __VLS_385({
                        label: "Target side",
                        items: (__VLS_ctx.targetSides),
                        modelValue: (__VLS_ctx.selectedTargetSideId),
                    }));
                    var __VLS_387 = __VLS_386.apply(void 0, __spreadArray([{
                            label: "Target side",
                            items: (__VLS_ctx.targetSides),
                            modelValue: (__VLS_ctx.selectedTargetSideId),
                        }], __VLS_functionalComponentArgsRest(__VLS_386), false));
                }
            }
            if (__VLS_ctx.hasExistingUnits && __VLS_ctx.wantsToImportState && __VLS_ctx.unitImportMode == 'state-only') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                var __VLS_390 = InlineAlertWarning_vue_1.default || InlineAlertWarning_vue_1.default;
                // @ts-ignore
                var __VLS_391 = __VLS_asFunctionalComponent1(__VLS_390, new __VLS_390(__assign({ class: "text-xs" })));
                var __VLS_392 = __VLS_391.apply(void 0, __spreadArray([__assign({ class: "text-xs" })], __VLS_functionalComponentArgsRest(__VLS_391), false));
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                var __VLS_395 = __VLS_393.slots.default;
                // @ts-ignore
                [unitImportMode, hasExistingUnits, groupMergeMode, targetSides, selectedTargetSideId, wantsToImportState,];
                var __VLS_393;
                var __VLS_396 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
                radio_group_1.RadioGroup;
                // @ts-ignore
                var __VLS_397 = __VLS_asFunctionalComponent1(__VLS_396, new __VLS_396(__assign({ modelValue: (__VLS_ctx.stateMergeMode) }, { class: "flex flex-col gap-2" })));
                var __VLS_398 = __VLS_397.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.stateMergeMode) }, { class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_397), false));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                var __VLS_401 = __VLS_399.slots.default;
                var __VLS_402 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402({
                    for: "state-replace",
                }));
                var __VLS_404 = __VLS_403.apply(void 0, __spreadArray([{
                        for: "state-replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_403), false));
                var __VLS_407 = __VLS_405.slots.default;
                var __VLS_408 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_409 = __VLS_asFunctionalComponent1(__VLS_408, new __VLS_408({
                    orientation: "horizontal",
                }));
                var __VLS_410 = __VLS_409.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_409), false));
                var __VLS_413 = __VLS_411.slots.default;
                var __VLS_414 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({
                    id: "state-replace",
                    value: "replace",
                }));
                var __VLS_416 = __VLS_415.apply(void 0, __spreadArray([{
                        id: "state-replace",
                        value: "replace",
                    }], __VLS_functionalComponentArgsRest(__VLS_415), false));
                var __VLS_419 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_420 = __VLS_asFunctionalComponent1(__VLS_419, new __VLS_419({}));
                var __VLS_421 = __VLS_420.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_420), false));
                var __VLS_424 = __VLS_422.slots.default;
                var __VLS_425 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_426 = __VLS_asFunctionalComponent1(__VLS_425, new __VLS_425({}));
                var __VLS_427 = __VLS_426.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_426), false));
                var __VLS_430 = __VLS_428.slots.default;
                // @ts-ignore
                [stateMergeMode,];
                var __VLS_428;
                // @ts-ignore
                [];
                var __VLS_422;
                // @ts-ignore
                [];
                var __VLS_411;
                // @ts-ignore
                [];
                var __VLS_405;
                var __VLS_431 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
                field_1.FieldLabel;
                // @ts-ignore
                var __VLS_432 = __VLS_asFunctionalComponent1(__VLS_431, new __VLS_431({
                    for: "state-add_new",
                }));
                var __VLS_433 = __VLS_432.apply(void 0, __spreadArray([{
                        for: "state-add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_432), false));
                var __VLS_436 = __VLS_434.slots.default;
                var __VLS_437 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
                field_1.Field;
                // @ts-ignore
                var __VLS_438 = __VLS_asFunctionalComponent1(__VLS_437, new __VLS_437({
                    orientation: "horizontal",
                }));
                var __VLS_439 = __VLS_438.apply(void 0, __spreadArray([{
                        orientation: "horizontal",
                    }], __VLS_functionalComponentArgsRest(__VLS_438), false));
                var __VLS_442 = __VLS_440.slots.default;
                var __VLS_443 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
                radio_group_1.RadioGroupItem;
                // @ts-ignore
                var __VLS_444 = __VLS_asFunctionalComponent1(__VLS_443, new __VLS_443({
                    id: "state-add_new",
                    value: "add_new",
                }));
                var __VLS_445 = __VLS_444.apply(void 0, __spreadArray([{
                        id: "state-add_new",
                        value: "add_new",
                    }], __VLS_functionalComponentArgsRest(__VLS_444), false));
                var __VLS_448 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
                field_1.FieldContent;
                // @ts-ignore
                var __VLS_449 = __VLS_asFunctionalComponent1(__VLS_448, new __VLS_448({}));
                var __VLS_450 = __VLS_449.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_449), false));
                var __VLS_453 = __VLS_451.slots.default;
                var __VLS_454 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
                field_1.FieldTitle;
                // @ts-ignore
                var __VLS_455 = __VLS_asFunctionalComponent1(__VLS_454, new __VLS_454({}));
                var __VLS_456 = __VLS_455.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_455), false));
                var __VLS_459 = __VLS_457.slots.default;
                // @ts-ignore
                [];
                var __VLS_457;
                // @ts-ignore
                [];
                var __VLS_451;
                // @ts-ignore
                [];
                var __VLS_440;
                // @ts-ignore
                [];
                var __VLS_434;
                // @ts-ignore
                [];
                var __VLS_399;
            }
            // @ts-ignore
            [];
            var __VLS_236;
        }
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-full min-h-0 flex-col p-6" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
if (!__VLS_ctx.isSettingsImport) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mb-4 flex gap-4" }));
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    var __VLS_460 = FieldSelect_vue_1.default;
    // @ts-ignore
    var __VLS_461 = __VLS_asFunctionalComponent1(__VLS_460, new __VLS_460(__assign({ class: "w-64" }, { label: "Side", items: (__VLS_ctx.importedSides), modelValue: (__VLS_ctx.selectedSourceSideId) })));
    var __VLS_462 = __VLS_461.apply(void 0, __spreadArray([__assign({ class: "w-64" }, { label: "Side", items: (__VLS_ctx.importedSides), modelValue: (__VLS_ctx.selectedSourceSideId) })], __VLS_functionalComponentArgsRest(__VLS_461), false));
    /** @type {__VLS_StyleScopedClasses['w-64']} */ ;
    if (__VLS_ctx.importMode === 'group' || __VLS_ctx.importMode === 'units') {
        var __VLS_465 = FieldSelect_vue_1.default;
        // @ts-ignore
        var __VLS_466 = __VLS_asFunctionalComponent1(__VLS_465, new __VLS_465(__assign({ class: "w-64" }, { label: "Group", modelValue: (__VLS_ctx.selectedSourceSideGroupId), items: (__VLS_ctx.importedSideGroups) })));
        var __VLS_467 = __VLS_466.apply(void 0, __spreadArray([__assign({ class: "w-64" }, { label: "Group", modelValue: (__VLS_ctx.selectedSourceSideGroupId), items: (__VLS_ctx.importedSideGroups) })], __VLS_functionalComponentArgsRest(__VLS_466), false));
        /** @type {__VLS_StyleScopedClasses['w-64']} */ ;
    }
    var __VLS_470 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470(__assign(__assign({ key: (__VLS_ctx.selectedSourceSideGroupId), data: (__VLS_ctx.currentData), columns: (__VLS_ctx.computedColumns), rowHeight: (40) }, { class: "flex-1" }), { getSubRows: (function (row) { var _a; return (_a = row.subUnits) !== null && _a !== void 0 ? _a : row.groups; }), selectAll: true, selected: (__VLS_ctx.selectedItems), noIndeterminate: true })));
    var __VLS_472 = __VLS_471.apply(void 0, __spreadArray([__assign(__assign({ key: (__VLS_ctx.selectedSourceSideGroupId), data: (__VLS_ctx.currentData), columns: (__VLS_ctx.computedColumns), rowHeight: (40) }, { class: "flex-1" }), { getSubRows: (function (row) { var _a; return (_a = row.subUnits) !== null && _a !== void 0 ? _a : row.groups; }), selectAll: true, selected: (__VLS_ctx.selectedItems), noIndeterminate: true })], __VLS_functionalComponentArgsRest(__VLS_471), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else if (__VLS_ctx.importMode === 'equipment') {
    var __VLS_475 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_476 = __VLS_asFunctionalComponent1(__VLS_475, new __VLS_475(__assign({ data: (__VLS_ctx.currentEquipment), columns: (__VLS_ctx.equipmentColumns), rowHeight: (40), selected: (__VLS_ctx.selectedEquipment), select: true, selectAll: true }, { class: "flex-1" })));
    var __VLS_477 = __VLS_476.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.currentEquipment), columns: (__VLS_ctx.equipmentColumns), rowHeight: (40), selected: (__VLS_ctx.selectedEquipment), select: true, selectAll: true }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_476), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else if (__VLS_ctx.importMode === 'personnel') {
    var __VLS_480 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_481 = __VLS_asFunctionalComponent1(__VLS_480, new __VLS_480(__assign({ data: (__VLS_ctx.currentPersonnel), columns: (__VLS_ctx.personnelColumns), rowHeight: (40), selected: (__VLS_ctx.selectedPersonnel), select: true, selectAll: true }, { class: "flex-1" })));
    var __VLS_482 = __VLS_481.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.currentPersonnel), columns: (__VLS_ctx.personnelColumns), rowHeight: (40), selected: (__VLS_ctx.selectedPersonnel), select: true, selectAll: true }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_481), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else if (__VLS_ctx.importMode === 'statuses') {
    var __VLS_485 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_486 = __VLS_asFunctionalComponent1(__VLS_485, new __VLS_485(__assign({ data: (__VLS_ctx.currentUnitStatuses), columns: (__VLS_ctx.statusColumns), rowHeight: (40), selected: (__VLS_ctx.selectedStatuses), select: true, selectAll: true }, { class: "flex-1" })));
    var __VLS_487 = __VLS_486.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.currentUnitStatuses), columns: (__VLS_ctx.statusColumns), rowHeight: (40), selected: (__VLS_ctx.selectedStatuses), select: true, selectAll: true }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_486), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else if (__VLS_ctx.importMode === 'supplyCategories') {
    var __VLS_490 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_491 = __VLS_asFunctionalComponent1(__VLS_490, new __VLS_490(__assign({ data: (__VLS_ctx.currentSupplyCategories), columns: (__VLS_ctx.supplyCategoryColumns), rowHeight: (40), selected: (__VLS_ctx.selectedSupplyCategories), select: true, selectAll: true }, { class: "flex-1" })));
    var __VLS_492 = __VLS_491.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.currentSupplyCategories), columns: (__VLS_ctx.supplyCategoryColumns), rowHeight: (40), selected: (__VLS_ctx.selectedSupplyCategories), select: true, selectAll: true }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_491), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else if (__VLS_ctx.importMode === 'customSymbols') {
    var __VLS_495 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_496 = __VLS_asFunctionalComponent1(__VLS_495, new __VLS_495(__assign({ data: (__VLS_ctx.currentCustomIcons), columns: (__VLS_ctx.customIconColumns), rowHeight: (40), selected: (__VLS_ctx.selectedCustomSymbols), select: true, selectAll: true }, { class: "flex-1" })));
    var __VLS_497 = __VLS_496.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.currentCustomIcons), columns: (__VLS_ctx.customIconColumns), rowHeight: (40), selected: (__VLS_ctx.selectedCustomSymbols), select: true, selectAll: true }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_496), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
// @ts-ignore
[importMode, importMode, importMode, importMode, importMode, importMode, importMode, isSettingsImport, importedSides, selectedSourceSideId, selectedSourceSideGroupId, selectedSourceSideGroupId, importedSideGroups, currentData, computedColumns, selectedItems, currentEquipment, equipmentColumns, selectedEquipment, currentPersonnel, personnelColumns, selectedPersonnel, currentUnitStatuses, statusColumns, selectedStatuses, currentSupplyCategories, supplyCategoryColumns, selectedSupplyCategories, currentCustomIcons, customIconColumns, selectedCustomSymbols,];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
