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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var UnitSymbol_vue_1 = require("@/components/UnitSymbol.vue");
var DataGrid_vue_1 = require("@/modules/grid/DataGrid.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var OrbatCellRenderer_vue_1 = require("@/components/OrbatCellRenderer.vue");
var solid_1 = require("@heroicons/vue/20/solid");
var notifications_1 = require("@/composables/notifications");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var convertUtils_1 = require("@/importexport/convertUtils");
var SymbolCodeSelect_vue_1 = require("@/components/SymbolCodeSelect.vue");
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var field_1 = require("@/components/ui/field");
var radio_group_1 = require("@/components/ui/radio-group");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var utils_2 = require("@/geo/utils");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var SimpleSelect_vue_1 = require("@/components/SimpleSelect.vue");
var ImportStepLayout_vue_1 = require("@/components/ImportStepLayout.vue");
var useColumnMapping_1 = require("@/composables/import/useColumnMapping");
var useSheetData_1 = require("@/composables/import/useSheetData");
var useMappedData_1 = require("@/composables/import/useMappedData");
var SimpleDivider_vue_1 = require("@/components/SimpleDivider.vue");
var useUpdateMatching_1 = require("@/composables/import/useUpdateMatching");
var props = defineProps();
var emit = defineEmits(["cancel", "loaded"]);
var send = (0, notifications_1.useNotifications)().send;
var scenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
// Data loading
var _d = (0, useSheetData_1.useSheetData)(props.workbook), sheetNames = _d.sheetNames, activeSheet = _d.activeSheet, data = _d.data, headers = _d.headers;
var importMode = (0, vue_1.ref)("add-units");
var idMode = (0, vue_1.ref)("autogenerate");
var guessSidc = (0, vue_1.ref)(false); // Used in useMappedData
// Update mode state
var matchMode = (0, vue_1.ref)("id");
var updateMatchField = (0, vue_1.ref)(null);
var _e = (0, scenarioUtils_1.useRootUnits)(), rootUnitItems = _e.rootUnitItems, groupedRootUnitItems = _e.groupedRootUnitItems;
var parentUnitId = (0, vue_1.ref)((_a = rootUnitItems.value[0]) === null || _a === void 0 ? void 0 : _a.code);
var parentSidc = (0, vue_1.computed)(function () {
    var unit = rootUnitItems.value.find(function (u) { return u.code === parentUnitId.value; });
    return unit === null || unit === void 0 ? void 0 : unit.sidc;
});
var parentSide = (0, vue_1.computed)(function () {
    if (!parentUnitId.value)
        return undefined;
    var side = unitActions.getUnitHierarchy(parentUnitId.value).side;
    return side;
});
var parentSymbolOptions = (0, vue_1.computed)(function () {
    var unit = rootUnitItems.value.find(function (u) { return u.code === parentUnitId.value; });
    return unit === null || unit === void 0 ? void 0 : unit.symbolOptions;
});
// Column mapping logic
var _f = (0, useColumnMapping_1.useColumnMapping)(headers, data), fieldMappings = _f.fieldMappings, idField = _f.idField, parentMatchField = _f.parentMatchField, coordinateMode = _f.coordinateMode, combinedCoordinateFormat = _f.combinedCoordinateFormat, latitudeField = _f.latitudeField, longitudeField = _f.longitudeField, positionField = _f.positionField;
// Auto-select match field based on mode (must be after useColumnMapping)
(0, vue_1.watch)([
    function () { return importMode.value; },
    function () { return matchMode.value; },
    function () { return headers.value; },
    function () { return idField.value; },
], function () {
    if (importMode.value === "update-units") {
        if (matchMode.value === "id" && idField.value) {
            updateMatchField.value = idField.value;
        }
        else if (matchMode.value === "name" && fieldMappings.value.name) {
            updateMatchField.value = fieldMappings.value.name;
        }
    }
}, { immediate: true });
// Store separate mappings for add and update modes
var savedAddMappings = (0, vue_1.ref)({});
var savedAddCoordinateMode = (0, vue_1.ref)("none");
var savedUpdateMappings = (0, vue_1.ref)({});
var savedUpdateCoordinateMode = (0, vue_1.ref)("none");
// Save and restore field mappings when switching between modes
(0, vue_1.watch)(importMode, function (newMode, oldMode) {
    if (!oldMode)
        return; // Initial load, don't save
    // Save current mappings for the old mode
    if (oldMode === "add-units") {
        savedAddMappings.value = __assign({}, fieldMappings.value);
        savedAddCoordinateMode.value = coordinateMode.value;
    }
    else if (oldMode === "update-units") {
        savedUpdateMappings.value = __assign({}, fieldMappings.value);
        savedUpdateCoordinateMode.value = coordinateMode.value;
    }
    // Restore mappings for the new mode
    if (newMode === "add-units") {
        if (Object.keys(savedAddMappings.value).length > 0) {
            // Restore saved add mode mappings
            Object.keys(fieldMappings.value).forEach(function (key) {
                var _a;
                fieldMappings.value[key] =
                    (_a = savedAddMappings.value[key]) !== null && _a !== void 0 ? _a : fieldMappings.value[key];
            });
            coordinateMode.value = savedAddCoordinateMode.value;
        }
        // If no saved mappings, keep the current auto-detected ones
    }
    else if (newMode === "update-units") {
        if (Object.keys(savedUpdateMappings.value).length > 0) {
            // Restore saved update mode mappings
            Object.keys(fieldMappings.value).forEach(function (key) {
                var _a;
                fieldMappings.value[key] = (_a = savedUpdateMappings.value[key]) !== null && _a !== void 0 ? _a : null;
            });
            coordinateMode.value = savedUpdateCoordinateMode.value;
        }
        else {
            // First time entering update mode - reset all mappings to null
            Object.keys(fieldMappings.value).forEach(function (key) {
                fieldMappings.value[key] = null;
            });
            coordinateMode.value = "none";
        }
    }
});
var positionTimeMode = (0, vue_1.ref)("current");
var positionEventId = (0, vue_1.ref)(null);
// Time formatting and events
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var _g = (0, utils_1.injectStrict)(injects_1.activeScenarioKey), store = _g.store, time = _g.time, unitActions = _g.unitActions;
var events = (0, vue_1.computed)(function () {
    return store.state.events
        .map(function (e) { return store.state.eventMap[e]; })
        .sort(function (a, b) { return (a.startTime < b.startTime ? -1 : 1); })
        .map(function (e) { return ({
        label: "".concat(fmt.scenarioFormatter.format(e.startTime), " - ").concat(e.title),
        value: e.id,
    }); });
});
// Initialize event ID if available
if (events.value.length > 0 && !positionEventId.value) {
    positionEventId.value = (_c = (_b = events.value[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null;
}
// Helper for UI referencing
var symbolFieldValues = new Set(["icon", "echelon"]);
var hierarchyFieldValues = new Set(["parentId"]);
var symbolFields = useColumnMapping_1.commonFields.filter(function (field) { return symbolFieldValues.has(field.value); });
var otherFields = useColumnMapping_1.commonFields.filter(function (field) {
    return !symbolFieldValues.has(field.value) &&
        !hierarchyFieldValues.has(field.value) &&
        field.value !== "name";
});
// Mapped data transformation
var _h = (0, useMappedData_1.useMappedData)({
    data: data,
    fieldMappings: fieldMappings,
    idField: idField,
    idMode: idMode,
    parentMatchField: parentMatchField,
    coordinateMode: coordinateMode,
    latitudeField: latitudeField,
    longitudeField: longitudeField,
    positionField: positionField,
    combinedCoordinateFormat: combinedCoordinateFormat,
    guessSidc: guessSidc,
    parentSidc: parentSidc,
    parentSymbolOptions: parentSymbolOptions,
    parentSideIdentifier: (0, vue_1.computed)(function () { var _a; return (_a = parentSide.value) === null || _a === void 0 ? void 0 : _a.standardIdentity; }),
}), mappedData = _h.mappedData, hierarchyData = _h.hierarchyData;
// Update matching (for update mode)
// Derive updateFields from fieldMappings - mapped columns will be updated
var updateFields = (0, vue_1.computed)(function () {
    var fields = [];
    var updatableKeys = ["name", "shortName", "sidc", "description", "externalUrl"];
    for (var _i = 0, updatableKeys_1 = updatableKeys; _i < updatableKeys_1.length; _i++) {
        var key = updatableKeys_1[_i];
        if (fieldMappings.value[key]) {
            fields.push(key);
        }
    }
    // Also update SIDC if icon is mapped (even if SIDC is not directly mapped)
    if (fieldMappings.value["icon"] && !fields.includes("sidc")) {
        fields.push("sidc");
    }
    // Add location if coordinates are being mapped
    if (coordinateMode.value !== "none") {
        fields.push("location");
    }
    return fields;
});
var _j = (0, useUpdateMatching_1.useUpdateMatching)({
    data: data,
    mappedData: mappedData,
    matchMode: matchMode,
    matchField: updateMatchField,
    updateFields: updateFields,
    units: unitActions.units,
    unitMap: store.state.unitMap,
}), matchedResults = _j.matchedResults, matchedCount = _j.matchedCount, changesCount = _j.changesCount;
var columns = (0, vue_1.computed)(function () {
    return headers.value.map(function (header) { return ({
        accessorKey: header,
        header: header,
    }); });
});
var previewColumns = (0, vue_1.computed)(function () {
    var cols = [];
    var hasHierarchy = !!fieldMappings.value.parentId && hierarchyData.value.length > 0;
    // Name column - with expand/collapse when hierarchy is available
    if (fieldMappings.value.name) {
        if (hasHierarchy) {
            cols.push({
                accessorKey: "name",
                id: "name",
                cell: function (_a) {
                    var _b;
                    var getValue = _a.getValue, row = _a.row;
                    return (0, vue_1.h)(OrbatCellRenderer_vue_1.default, {
                        value: (_b = getValue()) !== null && _b !== void 0 ? _b : "",
                        sidc: row.original.sidc,
                        expanded: row.getIsExpanded(),
                        level: row.depth,
                        canExpand: row.getCanExpand(),
                        onToggle: row.getToggleExpandedHandler(),
                        symbolOptions: row.original.symbolOptions,
                    });
                },
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
                enableGlobalFilter: true,
                size: 350,
                enableSorting: false,
            });
        }
        else {
            cols.push({ accessorKey: "name", header: "Name" });
        }
    }
    if (idMode.value === "autogenerate" || (idMode.value === "mapped" && idField.value)) {
        cols.push({ accessorKey: "id", header: "ID", size: 120 });
    }
    if (guessSidc.value || fieldMappings.value["icon"] || fieldMappings.value["echelon"]) {
        cols.push({
            accessorKey: "sidc",
            header: "SIDC",
            cell: function (_a) {
                var row = _a.row;
                var sidc = row.original.sidc;
                if (!sidc)
                    return "";
                return (0, vue_1.h)("div", { class: "flex items-center gap-2" }, [
                    (0, vue_1.h)(UnitSymbol_vue_1.default, {
                        sidc: sidc,
                        size: 24,
                        class: "shrink-0 max-h-8 w-auto",
                        options: __assign({ outlineWidth: 6, outlineColor: "white" }, row.original.symbolOptions),
                    }),
                    (0, vue_1.h)("span", sidc),
                ]);
            },
        });
    }
    // Add other mapped fields (excluding name which is already added, and icon/echelon which are in SIDC)
    useColumnMapping_1.commonFields.forEach(function (field) {
        var isMapped = !!fieldMappings.value[field.value];
        if (isMapped &&
            field.value !== "name" &&
            field.value !== "icon" &&
            field.value !== "echelon" &&
            field.value !== "parentId") {
            cols.push({ accessorKey: field.value, header: field.label });
        }
    });
    // Add position column if coordinates are being mapped
    if (coordinateMode.value !== "none") {
        cols.push({
            accessorKey: "_position",
            header: "Position",
            cell: function (_a) {
                var row = _a.row;
                var pos = row.original._position;
                if (!pos || pos.length < 2)
                    return "";
                return (0, utils_2.formatPosition)(pos);
            },
            size: 200,
        });
    }
    return cols;
});
// Update mode preview columns
var updatePreviewColumns = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    var cols = [];
    // Existing unit with symbol
    cols.push({
        accessorKey: "_existingName",
        header: "Existing Unit",
        cell: function (_a) {
            var row = _a.row;
            var name = row.original._existingName;
            var sidc = row.original._existingSidc;
            if (!name)
                return "—";
            if (sidc) {
                return (0, vue_1.h)("div", { class: "flex items-center gap-2" }, [
                    (0, vue_1.h)(UnitSymbol_vue_1.default, { sidc: sidc, size: 24, class: "max-h-8" }),
                    (0, vue_1.h)("span", name),
                ]);
            }
            return name;
        },
        size: 200,
    });
    // Add a column for each field being updated
    var updatableKeys = ["name", "shortName", "sidc", "description", "externalUrl"];
    var _loop_1 = function (key) {
        if (fieldMappings.value[key] || (key === "sidc" && fieldMappings.value["icon"])) {
            var fieldLabel = ((_a = useColumnMapping_1.commonFields.find(function (f) { return f.value === key; })) === null || _a === void 0 ? void 0 : _a.label) || key;
            cols.push({
                accessorKey: "_change_".concat(key),
                header: fieldLabel,
                cell: function (_a) {
                    var row = _a.row;
                    var changes = row.original._changes;
                    if (!changes || !changes[key]) {
                        return "—";
                    }
                    var _b = changes[key], oldVal = _b.old, newVal = _b.new;
                    if (key === "sidc") {
                        return (0, vue_1.h)("div", { class: "flex items-center gap-2" }, [
                            (0, vue_1.h)(UnitSymbol_vue_1.default, {
                                sidc: oldVal,
                                size: 24,
                                class: "shrink-0 max-h-8 w-auto",
                            }),
                            (0, vue_1.h)("span", { class: "text-muted-foreground" }, "→"),
                            (0, vue_1.h)(UnitSymbol_vue_1.default, {
                                sidc: newVal,
                                size: 24,
                                class: "shrink-0 max-h-8 w-auto",
                            }),
                        ]);
                    }
                    return "\"".concat(oldVal !== null && oldVal !== void 0 ? oldVal : "", "\" \u2192 \"").concat(newVal, "\"");
                },
                size: 180,
            });
        }
    };
    for (var _i = 0, updatableKeys_2 = updatableKeys; _i < updatableKeys_2.length; _i++) {
        var key = updatableKeys_2[_i];
        _loop_1(key);
    }
    // Add location column if coordinates are being mapped
    if (coordinateMode.value !== "none") {
        // Get the time that will be used for updates
        var updateTime = positionTimeMode.value === "event" && positionEventId.value
            ? ((_c = (_b = store.state.eventMap[positionEventId.value]) === null || _b === void 0 ? void 0 : _b.startTime) !== null && _c !== void 0 ? _c : +time.scenarioTime.value)
            : +time.scenarioTime.value;
        var formattedTime = fmt.scenarioFormatter.format(updateTime);
        cols.push({
            accessorKey: "_change_location",
            header: "Location (".concat(formattedTime, ")"),
            cell: function (_a) {
                var row = _a.row;
                var changes = row.original._changes;
                if (!changes || !changes.location) {
                    return "—";
                }
                var _b = changes.location, oldVal = _b.old, newVal = _b.new;
                return "".concat(oldVal || "(none)", " \u2192 ").concat(newVal);
            },
            size: 280,
        });
    }
    return cols;
});
// Update mode preview data - only units with changes
var updatePreviewData = (0, vue_1.computed)(function () {
    return matchedResults.value
        .filter(function (result) { return Object.keys(result.changes).length > 0; })
        .map(function (result) {
        var _a, _b, _c;
        return (__assign({ _matched: result.matched, _matchValue: result.matchValue, _existingName: (_a = result.existingUnit) === null || _a === void 0 ? void 0 : _a.name, _existingSidc: (_b = result.existingUnit) === null || _b === void 0 ? void 0 : _b.sidc, _existingId: (_c = result.existingUnit) === null || _c === void 0 ? void 0 : _c.id, _changes: result.changes, _hasChanges: Object.keys(result.changes).length > 0 }, result.row));
    });
});
// Validation and quality metrics
var validRowCount = (0, vue_1.computed)(function () {
    return mappedData.value.filter(function (u) { return u.name && u.sidc; })
        .length;
});
var hierarchyTableState = {
    expanded: true,
};
var canImport = (0, vue_1.computed)(function () {
    if (importMode.value === "update-units") {
        // Update mode validation
        if (!updateMatchField.value)
            return false;
        if (updateFields.value.length === 0)
            return false;
        if (matchedCount.value === 0)
            return false;
        if (changesCount.value === 0)
            return false;
        return true;
    }
    // Add mode validation
    // Must have at least name field mapped
    if (!fieldMappings.value.name)
        return false;
    // Must have icon/echelon for symbol generation
    var hasIconOrEchelon = !!fieldMappings.value.icon || !!fieldMappings.value.echelon;
    if (!hasIconOrEchelon)
        return false;
    // ID must be either autogenerated or mapped
    if (!idField.value && idMode.value === "mapped")
        return false;
    // Must have at least one valid row
    if (validRowCount.value === 0)
        return false;
    return true;
});
function onImport() {
    if (importMode.value === "update-units") {
        onUpdateImport();
        return;
    }
    onAddImport();
}
function onUpdateImport() {
    var resultsWithChanges = matchedResults.value.filter(function (r) { return Object.keys(r.changes).length > 0; });
    if (resultsWithChanges.length === 0) {
        send({
            message: "No changes to apply.",
            type: "warning",
        });
        return;
    }
    var updatedCount = 0;
    // Wrap all updates in groupUpdate so they can be undone as a single action
    store.groupUpdate(function () {
        resultsWithChanges.forEach(function (result) {
            var _a, _b;
            if (!result.existingUnit)
                return;
            // Build update payload from selected fields (excluding location which is handled separately)
            var updateData = {};
            for (var _i = 0, _c = updateFields.value; _i < _c.length; _i++) {
                var field = _c[_i];
                if (field === "location")
                    continue; // Location is handled via state entries, not as an attribute
                if (result.changes[field]) {
                    updateData[field] = result.changes[field].new;
                }
            }
            // Handle position separately if coordinates are mapped
            if (result.mappedData._position &&
                coordinateMode.value !== "none" &&
                updateFields.value.includes("location")) {
                // Update unit location via state
                unitActions.addUnitStateEntry(result.existingUnit.id, {
                    id: (0, utils_1.nanoid)(),
                    t: positionTimeMode.value === "event" && positionEventId.value
                        ? ((_b = (_a = store.state.eventMap[positionEventId.value]) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : +time.scenarioTime.value)
                        : +time.scenarioTime.value,
                    location: result.mappedData._position,
                });
            }
            if (Object.keys(updateData).length > 0) {
                unitActions.updateUnit(result.existingUnit.id, updateData, {
                    doUpdateUnitState: true,
                });
                updatedCount++;
            }
        });
    });
    // Refresh unit states
    time.setCurrentTime(+time.scenarioTime.value);
    scenario.store.state.unitStateCounter++;
    send({
        message: "Successfully updated ".concat(updatedCount, " units."),
        type: "success",
    });
    emit("loaded");
}
function onAddImport() {
    var hasHierarchy = !!fieldMappings.value.parentId && hierarchyData.value.length > 0;
    // Convert mapped data or hierarchy data to Unit objects
    function convertToUnit(item) {
        var unit = {
            id: String(item.id),
            name: String(item.name || ""),
            sidc: String(item.sidc || ""),
            subUnits: [],
        };
        // Add optional fields if present
        if (item.shortName)
            unit.shortName = String(item.shortName);
        if (item.description)
            unit.description = String(item.description);
        if (item.externalUrl)
            unit.externalUrl = String(item.externalUrl);
        // Handle position based on time mode
        if (item._position) {
            if (positionTimeMode.value === "current") {
                // Set position as state at current scenario time
                var state = {
                    id: (0, utils_1.nanoid)(),
                    t: +time.scenarioTime.value,
                    location: item._position,
                };
                unit.state = [state];
            }
            else if (positionTimeMode.value === "event" && positionEventId.value) {
                // Set position as state at the selected event's time
                var event_1 = store.state.eventMap[positionEventId.value];
                if (event_1) {
                    var state = {
                        id: (0, utils_1.nanoid)(),
                        t: event_1.startTime,
                        location: item._position,
                    };
                    unit.state = [state];
                }
                else {
                    // Fallback to current time if event not found
                    var state = {
                        id: (0, utils_1.nanoid)(),
                        t: +time.scenarioTime.value,
                        location: item._position,
                    };
                    unit.state = [state];
                }
            }
        }
        // Recursively process subUnits if hierarchy exists
        if (item.subUnits && item.subUnits.length > 0) {
            unit.subUnits = item.subUnits.map(convertToUnit);
        }
        return unit;
    }
    var unitsToImport;
    if (hasHierarchy) {
        // Use hierarchical data
        unitsToImport = hierarchyData.value.map(convertToUnit);
    }
    else {
        // Flat data - each mapped item becomes a root unit
        unitsToImport = mappedData.value.map(convertToUnit);
    }
    // Validate we have valid units
    var validUnits = unitsToImport.filter(function (u) { return u.name && u.sidc; });
    if (validUnits.length === 0) {
        send({
            message: "No valid units to import. Ensure name and symbol fields are mapped.",
            type: "error",
        });
        return;
    }
    // Import each root unit
    var hasPositions = coordinateMode.value !== "none";
    validUnits.forEach(function (unit) {
        (0, convertUtils_1.addUnitHierarchy)(unit, parentUnitId.value, scenario, {
            includeState: hasPositions,
        });
    });
    // Refresh unit states so imported units with positions are visible on the map
    if (hasPositions) {
        time.setCurrentTime(+time.scenarioTime.value);
        scenario.store.state.unitStateCounter++;
    }
    send({
        message: "Successfully imported ".concat(validRowCount.value, " units."),
        type: "success",
    });
    emit("loaded");
}
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = ImportStepLayout_vue_1.default || ImportStepLayout_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: "Import units from tabular data",
    subtitle: "Map your columns to unit properties",
    helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
    hasSidebar: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        title: "Import units from tabular data",
        subtitle: "Map your columns to unit properties",
        helpUrl: "https://docs.orbat-mapper.app/guide/import-data",
        hasSidebar: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = {};
var __VLS_6 = __VLS_3.slots.default;
{
    var __VLS_7 = __VLS_3.slots.actions;
    var __VLS_8 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8(__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { small: true }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_13 = void 0;
    var __VLS_14 = ({ click: {} },
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
    var __VLS_15 = __VLS_11.slots.default;
    // @ts-ignore
    [];
    var __VLS_11;
    var __VLS_12;
    var __VLS_16 = BaseButton_vue_1.default || BaseButton_vue_1.default;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16(__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true, disabled: (!__VLS_ctx.canImport) }), { class: "flex-1 sm:flex-none" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { type: "submit", primary: true, small: true, disabled: (!__VLS_ctx.canImport) }), { class: "flex-1 sm:flex-none" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_21 = void 0;
    var __VLS_22 = ({ click: {} },
        { onClick: (__VLS_ctx.onImport) });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    var __VLS_23 = __VLS_19.slots.default;
    if (__VLS_ctx.importMode === 'update-units') {
        (__VLS_ctx.changesCount);
        (__VLS_ctx.changesCount === 1 ? "unit" : "units");
    }
    else {
        (__VLS_ctx.validRowCount);
        (__VLS_ctx.validRowCount === 1 ? "unit" : "units");
    }
    // @ts-ignore
    [canImport, onImport, importMode, changesCount, changesCount, validRowCount, validRowCount,];
    var __VLS_19;
    var __VLS_20;
    // @ts-ignore
    [];
}
{
    var __VLS_24 = __VLS_3.slots.sidebar;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_25 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_30 = __VLS_28.slots.default;
    // @ts-ignore
    [];
    var __VLS_28;
    var __VLS_31 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
    radio_group_1.RadioGroup;
    // @ts-ignore
    var __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31(__assign({ class: "grid grid-cols-2 gap-4" }, { modelValue: (__VLS_ctx.importMode) })));
    var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([__assign({ class: "grid grid-cols-2 gap-4" }, { modelValue: (__VLS_ctx.importMode) })], __VLS_functionalComponentArgsRest(__VLS_32), false));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    var __VLS_36 = __VLS_34.slots.default;
    var __VLS_37 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37(__assign({ for: "add" }, { class: "cursor-pointer" })));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ for: "add" }, { class: "cursor-pointer" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    var __VLS_42 = __VLS_40.slots.default;
    var __VLS_43 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        orientation: "horizontal",
    }));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
            orientation: "horizontal",
        }], __VLS_functionalComponentArgsRest(__VLS_44), false));
    var __VLS_48 = __VLS_46.slots.default;
    var __VLS_49 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
    field_1.FieldContent;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({}));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_54 = __VLS_52.slots.default;
    var __VLS_55 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
    field_1.FieldTitle;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_56), false));
    var __VLS_60 = __VLS_58.slots.default;
    // @ts-ignore
    [importMode,];
    var __VLS_58;
    // @ts-ignore
    [];
    var __VLS_52;
    var __VLS_61 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        id: "add",
        value: "add-units",
    }));
    var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{
            id: "add",
            value: "add-units",
        }], __VLS_functionalComponentArgsRest(__VLS_62), false));
    // @ts-ignore
    [];
    var __VLS_46;
    // @ts-ignore
    [];
    var __VLS_40;
    var __VLS_66 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66(__assign({ for: "update" }, { class: "cursor-pointer" })));
    var __VLS_68 = __VLS_67.apply(void 0, __spreadArray([__assign({ for: "update" }, { class: "cursor-pointer" })], __VLS_functionalComponentArgsRest(__VLS_67), false));
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    var __VLS_71 = __VLS_69.slots.default;
    var __VLS_72 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        orientation: "horizontal",
    }));
    var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{
            orientation: "horizontal",
        }], __VLS_functionalComponentArgsRest(__VLS_73), false));
    var __VLS_77 = __VLS_75.slots.default;
    var __VLS_78 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldContent | typeof __VLS_components.FieldContent} */
    field_1.FieldContent;
    // @ts-ignore
    var __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
    var __VLS_80 = __VLS_79.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_79), false));
    var __VLS_83 = __VLS_81.slots.default;
    var __VLS_84 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldTitle | typeof __VLS_components.FieldTitle} */
    field_1.FieldTitle;
    // @ts-ignore
    var __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({}));
    var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_85), false));
    var __VLS_89 = __VLS_87.slots.default;
    // @ts-ignore
    [];
    var __VLS_87;
    // @ts-ignore
    [];
    var __VLS_81;
    var __VLS_90 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        id: "update",
        value: "update-units",
    }));
    var __VLS_92 = __VLS_91.apply(void 0, __spreadArray([{
            id: "update",
            value: "update-units",
        }], __VLS_functionalComponentArgsRest(__VLS_91), false));
    // @ts-ignore
    [];
    var __VLS_75;
    // @ts-ignore
    [];
    var __VLS_69;
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_95 = SimpleDivider_vue_1.default;
    // @ts-ignore
    var __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({}));
    var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_96), false));
    if (__VLS_ctx.importMode === 'add-units') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        var __VLS_100 = SymbolCodeSelect_vue_1.default;
        // @ts-ignore
        var __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
            label: "Parent unit",
            items: (__VLS_ctx.rootUnitItems),
            groups: (__VLS_ctx.groupedRootUnitItems),
            modelValue: (__VLS_ctx.parentUnitId),
        }));
        var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([{
                label: "Parent unit",
                items: (__VLS_ctx.rootUnitItems),
                groups: (__VLS_ctx.groupedRootUnitItems),
                modelValue: (__VLS_ctx.parentUnitId),
            }], __VLS_functionalComponentArgsRest(__VLS_101), false));
    }
    if (__VLS_ctx.importMode === 'update-units') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-6" }));
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        var __VLS_105 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
        var __VLS_107 = __VLS_106.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_106), false));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        var __VLS_110 = __VLS_108.slots.default;
        // @ts-ignore
        [importMode, importMode, rootUnitItems, groupedRootUnitItems, parentUnitId,];
        var __VLS_108;
        var __VLS_111 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
        radio_group_1.RadioGroup;
        // @ts-ignore
        var __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111(__assign({ modelValue: (__VLS_ctx.matchMode) }, { class: "flex gap-4" })));
        var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.matchMode) }, { class: "flex gap-4" })], __VLS_functionalComponentArgsRest(__VLS_112), false));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        var __VLS_116 = __VLS_114.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_117 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
            id: "match-id",
            value: "id",
        }));
        var __VLS_119 = __VLS_118.apply(void 0, __spreadArray([{
                id: "match-id",
                value: "id",
            }], __VLS_functionalComponentArgsRest(__VLS_118), false));
        var __VLS_122 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122(__assign({ for: "match-id" }, { class: "font-normal" })));
        var __VLS_124 = __VLS_123.apply(void 0, __spreadArray([__assign({ for: "match-id" }, { class: "font-normal" })], __VLS_functionalComponentArgsRest(__VLS_123), false));
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        var __VLS_127 = __VLS_125.slots.default;
        // @ts-ignore
        [matchMode,];
        var __VLS_125;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_128 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
            id: "match-name",
            value: "name",
        }));
        var __VLS_130 = __VLS_129.apply(void 0, __spreadArray([{
                id: "match-name",
                value: "name",
            }], __VLS_functionalComponentArgsRest(__VLS_129), false));
        var __VLS_133 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133(__assign({ for: "match-name" }, { class: "font-normal" })));
        var __VLS_135 = __VLS_134.apply(void 0, __spreadArray([__assign({ for: "match-name" }, { class: "font-normal" })], __VLS_functionalComponentArgsRest(__VLS_134), false));
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        var __VLS_138 = __VLS_136.slots.default;
        // @ts-ignore
        [];
        var __VLS_136;
        // @ts-ignore
        [];
        var __VLS_114;
        var __VLS_139 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139(__assign({ class: "gap-1.5" })));
        var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_140), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_144 = __VLS_142.slots.default;
        var __VLS_145 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({}));
        var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_146), false));
        var __VLS_150 = __VLS_148.slots.default;
        // @ts-ignore
        [];
        var __VLS_148;
        var __VLS_151 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
            modelValue: (__VLS_ctx.updateMatchField),
        }));
        var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.updateMatchField),
            }], __VLS_functionalComponentArgsRest(__VLS_152), false));
        var __VLS_156 = __VLS_154.slots.default;
        var __VLS_157 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157(__assign({ class: "w-full" })));
        var __VLS_159 = __VLS_158.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_158), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_162 = __VLS_160.slots.default;
        var __VLS_163 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
            placeholder: "Select column to match",
        }));
        var __VLS_165 = __VLS_164.apply(void 0, __spreadArray([{
                placeholder: "Select column to match",
            }], __VLS_functionalComponentArgsRest(__VLS_164), false));
        // @ts-ignore
        [updateMatchField,];
        var __VLS_160;
        var __VLS_168 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
        var __VLS_170 = __VLS_169.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_169), false));
        var __VLS_173 = __VLS_171.slots.default;
        for (var _i = 0, _k = __VLS_vFor((__VLS_ctx.headers)); _i < _k.length; _i++) {
            var h_1 = _k[_i][0];
            var __VLS_174 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
                key: (h_1),
                value: (h_1),
            }));
            var __VLS_176 = __VLS_175.apply(void 0, __spreadArray([{
                    key: (h_1),
                    value: (h_1),
                }], __VLS_functionalComponentArgsRest(__VLS_175), false));
            var __VLS_179 = __VLS_177.slots.default;
            (h_1);
            // @ts-ignore
            [headers,];
            var __VLS_177;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_171;
        // @ts-ignore
        [];
        var __VLS_154;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-[0.8rem]" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[0.8rem]']} */ ;
        (__VLS_ctx.matchMode === "id" ? "unit IDs" : "unit names");
        // @ts-ignore
        [matchMode,];
        var __VLS_142;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-muted/50 flex items-center justify-between rounded-md border p-3 text-sm" }));
        /** @type {__VLS_StyleScopedClasses['bg-muted/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.matchedCount);
        (__VLS_ctx.data.length);
        if (__VLS_ctx.changesCount > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between text-sm text-green-600" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.changesCount);
        }
    }
    var __VLS_180 = SimpleDivider_vue_1.default;
    // @ts-ignore
    var __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({}));
    var __VLS_182 = __VLS_181.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_181), false));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "font-bold tracking-tight" }));
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
    var __VLS_185 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
    tabs_1.Tabs;
    // @ts-ignore
    var __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185(__assign({ defaultValue: "core" }, { class: "w-full" })));
    var __VLS_187 = __VLS_186.apply(void 0, __spreadArray([__assign({ defaultValue: "core" }, { class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_186), false));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_190 = __VLS_188.slots.default;
    var __VLS_191 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
    tabs_1.TabsList;
    // @ts-ignore
    var __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191(__assign({ class: (__VLS_ctx.importMode === 'update-units'
            ? 'grid w-full grid-cols-2'
            : 'grid w-full grid-cols-3') })));
    var __VLS_193 = __VLS_192.apply(void 0, __spreadArray([__assign({ class: (__VLS_ctx.importMode === 'update-units'
                ? 'grid w-full grid-cols-2'
                : 'grid w-full grid-cols-3') })], __VLS_functionalComponentArgsRest(__VLS_192), false));
    var __VLS_196 = __VLS_194.slots.default;
    var __VLS_197 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({
        value: "core",
    }));
    var __VLS_199 = __VLS_198.apply(void 0, __spreadArray([{
            value: "core",
        }], __VLS_functionalComponentArgsRest(__VLS_198), false));
    var __VLS_202 = __VLS_200.slots.default;
    // @ts-ignore
    [importMode, changesCount, changesCount, matchedCount, data,];
    var __VLS_200;
    if (__VLS_ctx.importMode !== 'update-units') {
        var __VLS_203 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
        tabs_1.TabsTrigger;
        // @ts-ignore
        var __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
            value: "hierarchy",
        }));
        var __VLS_205 = __VLS_204.apply(void 0, __spreadArray([{
                value: "hierarchy",
            }], __VLS_functionalComponentArgsRest(__VLS_204), false));
        var __VLS_208 = __VLS_206.slots.default;
        // @ts-ignore
        [importMode,];
        var __VLS_206;
    }
    var __VLS_209 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
    tabs_1.TabsTrigger;
    // @ts-ignore
    var __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
        value: "geo",
    }));
    var __VLS_211 = __VLS_210.apply(void 0, __spreadArray([{
            value: "geo",
        }], __VLS_functionalComponentArgsRest(__VLS_210), false));
    var __VLS_214 = __VLS_212.slots.default;
    // @ts-ignore
    [];
    var __VLS_212;
    // @ts-ignore
    [];
    var __VLS_194;
    var __VLS_215 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215(__assign({ value: "core" }, { class: "space-y-4 py-4" })));
    var __VLS_217 = __VLS_216.apply(void 0, __spreadArray([__assign({ value: "core" }, { class: "space-y-4 py-4" })], __VLS_functionalComponentArgsRest(__VLS_216), false));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    var __VLS_220 = __VLS_218.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    var __VLS_221 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
    var __VLS_223 = __VLS_222.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_222), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    var __VLS_226 = __VLS_224.slots.default;
    // @ts-ignore
    [];
    var __VLS_224;
    var __VLS_227 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227(__assign({ class: "gap-1.5" })));
    var __VLS_229 = __VLS_228.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_228), false));
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    var __VLS_232 = __VLS_230.slots.default;
    var __VLS_233 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({}));
    var __VLS_235 = __VLS_234.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_234), false));
    var __VLS_238 = __VLS_236.slots.default;
    // @ts-ignore
    [];
    var __VLS_236;
    var __VLS_239 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
    select_1.Select;
    // @ts-ignore
    var __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({
        modelValue: (__VLS_ctx.fieldMappings.name),
    }));
    var __VLS_241 = __VLS_240.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.fieldMappings.name),
        }], __VLS_functionalComponentArgsRest(__VLS_240), false));
    var __VLS_244 = __VLS_242.slots.default;
    var __VLS_245 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
    select_1.SelectTrigger;
    // @ts-ignore
    var __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245(__assign({ class: "w-full" })));
    var __VLS_247 = __VLS_246.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_246), false));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_250 = __VLS_248.slots.default;
    var __VLS_251 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
    select_1.SelectValue;
    // @ts-ignore
    var __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
        placeholder: "Select column",
    }));
    var __VLS_253 = __VLS_252.apply(void 0, __spreadArray([{
            placeholder: "Select column",
        }], __VLS_functionalComponentArgsRest(__VLS_252), false));
    // @ts-ignore
    [fieldMappings,];
    var __VLS_248;
    var __VLS_256 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
    select_1.SelectContent;
    // @ts-ignore
    var __VLS_257 = __VLS_asFunctionalComponent1(__VLS_256, new __VLS_256({}));
    var __VLS_258 = __VLS_257.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_257), false));
    var __VLS_261 = __VLS_259.slots.default;
    var __VLS_262 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_263 = __VLS_asFunctionalComponent1(__VLS_262, new __VLS_262({
        value: (null),
    }));
    var __VLS_264 = __VLS_263.apply(void 0, __spreadArray([{
            value: (null),
        }], __VLS_functionalComponentArgsRest(__VLS_263), false));
    var __VLS_267 = __VLS_265.slots.default;
    // @ts-ignore
    [];
    var __VLS_265;
    for (var _l = 0, _m = __VLS_vFor((__VLS_ctx.headers)); _l < _m.length; _l++) {
        var h_2 = _m[_l][0];
        var __VLS_268 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_269 = __VLS_asFunctionalComponent1(__VLS_268, new __VLS_268({
            key: (h_2),
            value: (h_2),
        }));
        var __VLS_270 = __VLS_269.apply(void 0, __spreadArray([{
                key: (h_2),
                value: (h_2),
            }], __VLS_functionalComponentArgsRest(__VLS_269), false));
        var __VLS_273 = __VLS_271.slots.default;
        (h_2);
        // @ts-ignore
        [headers,];
        var __VLS_271;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_259;
    // @ts-ignore
    [];
    var __VLS_242;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-[0.8rem]" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[0.8rem]']} */ ;
    // @ts-ignore
    [];
    var __VLS_230;
    if (__VLS_ctx.importMode !== 'update-units') {
        var __VLS_274 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274(__assign({ class: "gap-1.5" })));
        var __VLS_276 = __VLS_275.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_275), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_279 = __VLS_277.slots.default;
        var __VLS_280 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({}));
        var __VLS_282 = __VLS_281.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_281), false));
        var __VLS_285 = __VLS_283.slots.default;
        // @ts-ignore
        [importMode,];
        var __VLS_283;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-col gap-3" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        var __VLS_286 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
        radio_group_1.RadioGroup;
        // @ts-ignore
        var __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286(__assign({ modelValue: (__VLS_ctx.idMode) }, { class: "flex gap-4" })));
        var __VLS_288 = __VLS_287.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.idMode) }, { class: "flex gap-4" })], __VLS_functionalComponentArgsRest(__VLS_287), false));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        var __VLS_291 = __VLS_289.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_292 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
            id: "id-auto",
            value: "autogenerate",
        }));
        var __VLS_294 = __VLS_293.apply(void 0, __spreadArray([{
                id: "id-auto",
                value: "autogenerate",
            }], __VLS_functionalComponentArgsRest(__VLS_293), false));
        var __VLS_297 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297(__assign({ for: "id-auto" }, { class: "font-normal" })));
        var __VLS_299 = __VLS_298.apply(void 0, __spreadArray([__assign({ for: "id-auto" }, { class: "font-normal" })], __VLS_functionalComponentArgsRest(__VLS_298), false));
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        var __VLS_302 = __VLS_300.slots.default;
        // @ts-ignore
        [idMode,];
        var __VLS_300;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_303 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({
            id: "id-mapped",
            value: "mapped",
        }));
        var __VLS_305 = __VLS_304.apply(void 0, __spreadArray([{
                id: "id-mapped",
                value: "mapped",
            }], __VLS_functionalComponentArgsRest(__VLS_304), false));
        var __VLS_308 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308(__assign({ for: "id-mapped" }, { class: "font-normal" })));
        var __VLS_310 = __VLS_309.apply(void 0, __spreadArray([__assign({ for: "id-mapped" }, { class: "font-normal" })], __VLS_functionalComponentArgsRest(__VLS_309), false));
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        var __VLS_313 = __VLS_311.slots.default;
        // @ts-ignore
        [];
        var __VLS_311;
        // @ts-ignore
        [];
        var __VLS_289;
        if (__VLS_ctx.idMode === 'mapped') {
            var __VLS_314 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
            select_1.Select;
            // @ts-ignore
            var __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314({
                modelValue: (__VLS_ctx.idField),
            }));
            var __VLS_316 = __VLS_315.apply(void 0, __spreadArray([{
                    modelValue: (__VLS_ctx.idField),
                }], __VLS_functionalComponentArgsRest(__VLS_315), false));
            var __VLS_319 = __VLS_317.slots.default;
            var __VLS_320 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
            select_1.SelectTrigger;
            // @ts-ignore
            var __VLS_321 = __VLS_asFunctionalComponent1(__VLS_320, new __VLS_320(__assign({ class: "w-full" })));
            var __VLS_322 = __VLS_321.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_321), false));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            var __VLS_325 = __VLS_323.slots.default;
            var __VLS_326 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
            select_1.SelectValue;
            // @ts-ignore
            var __VLS_327 = __VLS_asFunctionalComponent1(__VLS_326, new __VLS_326({
                placeholder: "Select ID column",
            }));
            var __VLS_328 = __VLS_327.apply(void 0, __spreadArray([{
                    placeholder: "Select ID column",
                }], __VLS_functionalComponentArgsRest(__VLS_327), false));
            // @ts-ignore
            [idMode, idField,];
            var __VLS_323;
            var __VLS_331 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
            select_1.SelectContent;
            // @ts-ignore
            var __VLS_332 = __VLS_asFunctionalComponent1(__VLS_331, new __VLS_331({}));
            var __VLS_333 = __VLS_332.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_332), false));
            var __VLS_336 = __VLS_334.slots.default;
            for (var _o = 0, _p = __VLS_vFor((__VLS_ctx.headers)); _o < _p.length; _o++) {
                var h_3 = _p[_o][0];
                var __VLS_337 = void 0;
                /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
                select_1.SelectItem;
                // @ts-ignore
                var __VLS_338 = __VLS_asFunctionalComponent1(__VLS_337, new __VLS_337({
                    key: (h_3),
                    value: (h_3),
                }));
                var __VLS_339 = __VLS_338.apply(void 0, __spreadArray([{
                        key: (h_3),
                        value: (h_3),
                    }], __VLS_functionalComponentArgsRest(__VLS_338), false));
                var __VLS_342 = __VLS_340.slots.default;
                (h_3);
                // @ts-ignore
                [headers,];
                var __VLS_340;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_334;
            // @ts-ignore
            [];
            var __VLS_317;
        }
        // @ts-ignore
        [];
        var __VLS_277;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    var __VLS_343 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
    var __VLS_345 = __VLS_344.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_344), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    var __VLS_348 = __VLS_346.slots.default;
    // @ts-ignore
    [];
    var __VLS_346;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    for (var _q = 0, _r = __VLS_vFor((__VLS_ctx.symbolFields)); _q < _r.length; _q++) {
        var field = _r[_q][0];
        var __VLS_349 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_350 = __VLS_asFunctionalComponent1(__VLS_349, new __VLS_349(__assign({ key: (field.value) }, { class: "gap-1.5" })));
        var __VLS_351 = __VLS_350.apply(void 0, __spreadArray([__assign({ key: (field.value) }, { class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_350), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_354 = __VLS_352.slots.default;
        var __VLS_355 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({}));
        var __VLS_357 = __VLS_356.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_356), false));
        var __VLS_360 = __VLS_358.slots.default;
        (field.label);
        // @ts-ignore
        [symbolFields,];
        var __VLS_358;
        var __VLS_361 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_362 = __VLS_asFunctionalComponent1(__VLS_361, new __VLS_361({
            modelValue: (__VLS_ctx.fieldMappings[field.value]),
        }));
        var __VLS_363 = __VLS_362.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.fieldMappings[field.value]),
            }], __VLS_functionalComponentArgsRest(__VLS_362), false));
        var __VLS_366 = __VLS_364.slots.default;
        var __VLS_367 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367(__assign({ class: "w-full" })));
        var __VLS_369 = __VLS_368.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_368), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_372 = __VLS_370.slots.default;
        var __VLS_373 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_374 = __VLS_asFunctionalComponent1(__VLS_373, new __VLS_373({
            placeholder: "Select column",
        }));
        var __VLS_375 = __VLS_374.apply(void 0, __spreadArray([{
                placeholder: "Select column",
            }], __VLS_functionalComponentArgsRest(__VLS_374), false));
        // @ts-ignore
        [fieldMappings,];
        var __VLS_370;
        var __VLS_378 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_379 = __VLS_asFunctionalComponent1(__VLS_378, new __VLS_378({}));
        var __VLS_380 = __VLS_379.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_379), false));
        var __VLS_383 = __VLS_381.slots.default;
        var __VLS_384 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({
            value: (null),
        }));
        var __VLS_386 = __VLS_385.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_385), false));
        var __VLS_389 = __VLS_387.slots.default;
        // @ts-ignore
        [];
        var __VLS_387;
        for (var _s = 0, _t = __VLS_vFor((__VLS_ctx.headers)); _s < _t.length; _s++) {
            var h_4 = _t[_s][0];
            var __VLS_390 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_391 = __VLS_asFunctionalComponent1(__VLS_390, new __VLS_390({
                key: (h_4),
                value: (h_4),
            }));
            var __VLS_392 = __VLS_391.apply(void 0, __spreadArray([{
                    key: (h_4),
                    value: (h_4),
                }], __VLS_functionalComponentArgsRest(__VLS_391), false));
            var __VLS_395 = __VLS_393.slots.default;
            (h_4);
            // @ts-ignore
            [headers,];
            var __VLS_393;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_381;
        // @ts-ignore
        [];
        var __VLS_364;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-[0.8rem]" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[0.8rem]']} */ ;
        (field.helpText);
        // @ts-ignore
        [];
        var __VLS_352;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    var __VLS_396 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_397 = __VLS_asFunctionalComponent1(__VLS_396, new __VLS_396(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
    var __VLS_398 = __VLS_397.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_397), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    var __VLS_401 = __VLS_399.slots.default;
    // @ts-ignore
    [];
    var __VLS_399;
    for (var _u = 0, _v = __VLS_vFor((__VLS_ctx.otherFields)); _u < _v.length; _u++) {
        var field = _v[_u][0];
        var __VLS_402 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402(__assign({ key: (field.value) }, { class: "gap-1.5" })));
        var __VLS_404 = __VLS_403.apply(void 0, __spreadArray([__assign({ key: (field.value) }, { class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_403), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_407 = __VLS_405.slots.default;
        var __VLS_408 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_409 = __VLS_asFunctionalComponent1(__VLS_408, new __VLS_408({}));
        var __VLS_410 = __VLS_409.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_409), false));
        var __VLS_413 = __VLS_411.slots.default;
        (field.label);
        // @ts-ignore
        [otherFields,];
        var __VLS_411;
        var __VLS_414 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({
            modelValue: (__VLS_ctx.fieldMappings[field.value]),
        }));
        var __VLS_416 = __VLS_415.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.fieldMappings[field.value]),
            }], __VLS_functionalComponentArgsRest(__VLS_415), false));
        var __VLS_419 = __VLS_417.slots.default;
        var __VLS_420 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_421 = __VLS_asFunctionalComponent1(__VLS_420, new __VLS_420(__assign({ class: "w-full" })));
        var __VLS_422 = __VLS_421.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_421), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_425 = __VLS_423.slots.default;
        var __VLS_426 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_427 = __VLS_asFunctionalComponent1(__VLS_426, new __VLS_426({
            placeholder: "Select column",
        }));
        var __VLS_428 = __VLS_427.apply(void 0, __spreadArray([{
                placeholder: "Select column",
            }], __VLS_functionalComponentArgsRest(__VLS_427), false));
        // @ts-ignore
        [fieldMappings,];
        var __VLS_423;
        var __VLS_431 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_432 = __VLS_asFunctionalComponent1(__VLS_431, new __VLS_431({}));
        var __VLS_433 = __VLS_432.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_432), false));
        var __VLS_436 = __VLS_434.slots.default;
        var __VLS_437 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_438 = __VLS_asFunctionalComponent1(__VLS_437, new __VLS_437({
            value: (null),
        }));
        var __VLS_439 = __VLS_438.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_438), false));
        var __VLS_442 = __VLS_440.slots.default;
        // @ts-ignore
        [];
        var __VLS_440;
        for (var _w = 0, _x = __VLS_vFor((__VLS_ctx.headers)); _w < _x.length; _w++) {
            var h_5 = _x[_w][0];
            var __VLS_443 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_444 = __VLS_asFunctionalComponent1(__VLS_443, new __VLS_443({
                key: (h_5),
                value: (h_5),
            }));
            var __VLS_445 = __VLS_444.apply(void 0, __spreadArray([{
                    key: (h_5),
                    value: (h_5),
                }], __VLS_functionalComponentArgsRest(__VLS_444), false));
            var __VLS_448 = __VLS_446.slots.default;
            (h_5);
            // @ts-ignore
            [headers,];
            var __VLS_446;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_434;
        // @ts-ignore
        [];
        var __VLS_417;
        // @ts-ignore
        [];
        var __VLS_405;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_218;
    var __VLS_449 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_450 = __VLS_asFunctionalComponent1(__VLS_449, new __VLS_449(__assign({ value: "hierarchy" }, { class: "space-y-4 py-4" })));
    var __VLS_451 = __VLS_450.apply(void 0, __spreadArray([__assign({ value: "hierarchy" }, { class: "space-y-4 py-4" })], __VLS_functionalComponentArgsRest(__VLS_450), false));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    var __VLS_454 = __VLS_452.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    var __VLS_455 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
    field_1.Field;
    // @ts-ignore
    var __VLS_456 = __VLS_asFunctionalComponent1(__VLS_455, new __VLS_455(__assign({ class: "gap-1.5" })));
    var __VLS_457 = __VLS_456.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_456), false));
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    var __VLS_460 = __VLS_458.slots.default;
    var __VLS_461 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
    field_1.FieldLabel;
    // @ts-ignore
    var __VLS_462 = __VLS_asFunctionalComponent1(__VLS_461, new __VLS_461({}));
    var __VLS_463 = __VLS_462.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_462), false));
    var __VLS_466 = __VLS_464.slots.default;
    // @ts-ignore
    [];
    var __VLS_464;
    var __VLS_467 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
    select_1.Select;
    // @ts-ignore
    var __VLS_468 = __VLS_asFunctionalComponent1(__VLS_467, new __VLS_467({
        modelValue: (__VLS_ctx.fieldMappings.parentId),
    }));
    var __VLS_469 = __VLS_468.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.fieldMappings.parentId),
        }], __VLS_functionalComponentArgsRest(__VLS_468), false));
    var __VLS_472 = __VLS_470.slots.default;
    var __VLS_473 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
    select_1.SelectTrigger;
    // @ts-ignore
    var __VLS_474 = __VLS_asFunctionalComponent1(__VLS_473, new __VLS_473(__assign({ class: "w-full" })));
    var __VLS_475 = __VLS_474.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_474), false));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_478 = __VLS_476.slots.default;
    var __VLS_479 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
    select_1.SelectValue;
    // @ts-ignore
    var __VLS_480 = __VLS_asFunctionalComponent1(__VLS_479, new __VLS_479({
        placeholder: "Select column",
    }));
    var __VLS_481 = __VLS_480.apply(void 0, __spreadArray([{
            placeholder: "Select column",
        }], __VLS_functionalComponentArgsRest(__VLS_480), false));
    // @ts-ignore
    [fieldMappings,];
    var __VLS_476;
    var __VLS_484 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
    select_1.SelectContent;
    // @ts-ignore
    var __VLS_485 = __VLS_asFunctionalComponent1(__VLS_484, new __VLS_484({}));
    var __VLS_486 = __VLS_485.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_485), false));
    var __VLS_489 = __VLS_487.slots.default;
    var __VLS_490 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_491 = __VLS_asFunctionalComponent1(__VLS_490, new __VLS_490({
        value: (null),
    }));
    var __VLS_492 = __VLS_491.apply(void 0, __spreadArray([{
            value: (null),
        }], __VLS_functionalComponentArgsRest(__VLS_491), false));
    var __VLS_495 = __VLS_493.slots.default;
    // @ts-ignore
    [];
    var __VLS_493;
    for (var _y = 0, _z = __VLS_vFor((__VLS_ctx.headers)); _y < _z.length; _y++) {
        var h_6 = _z[_y][0];
        var __VLS_496 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_497 = __VLS_asFunctionalComponent1(__VLS_496, new __VLS_496({
            key: (h_6),
            value: (h_6),
        }));
        var __VLS_498 = __VLS_497.apply(void 0, __spreadArray([{
                key: (h_6),
                value: (h_6),
            }], __VLS_functionalComponentArgsRest(__VLS_497), false));
        var __VLS_501 = __VLS_499.slots.default;
        (h_6);
        // @ts-ignore
        [headers,];
        var __VLS_499;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_487;
    // @ts-ignore
    [];
    var __VLS_470;
    // @ts-ignore
    [];
    var __VLS_458;
    if (__VLS_ctx.fieldMappings.parentId) {
        var __VLS_502 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_503 = __VLS_asFunctionalComponent1(__VLS_502, new __VLS_502(__assign({ class: "gap-1.5" })));
        var __VLS_504 = __VLS_503.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_503), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_507 = __VLS_505.slots.default;
        var __VLS_508 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_509 = __VLS_asFunctionalComponent1(__VLS_508, new __VLS_508({}));
        var __VLS_510 = __VLS_509.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_509), false));
        var __VLS_513 = __VLS_511.slots.default;
        // @ts-ignore
        [fieldMappings,];
        var __VLS_511;
        var __VLS_514 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_515 = __VLS_asFunctionalComponent1(__VLS_514, new __VLS_514({
            modelValue: (__VLS_ctx.parentMatchField),
        }));
        var __VLS_516 = __VLS_515.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.parentMatchField),
            }], __VLS_functionalComponentArgsRest(__VLS_515), false));
        var __VLS_519 = __VLS_517.slots.default;
        var __VLS_520 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_521 = __VLS_asFunctionalComponent1(__VLS_520, new __VLS_520(__assign({ class: "w-full" })));
        var __VLS_522 = __VLS_521.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_521), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_525 = __VLS_523.slots.default;
        var __VLS_526 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_527 = __VLS_asFunctionalComponent1(__VLS_526, new __VLS_526({
            placeholder: "Select ID column",
        }));
        var __VLS_528 = __VLS_527.apply(void 0, __spreadArray([{
                placeholder: "Select ID column",
            }], __VLS_functionalComponentArgsRest(__VLS_527), false));
        // @ts-ignore
        [parentMatchField,];
        var __VLS_523;
        var __VLS_531 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_532 = __VLS_asFunctionalComponent1(__VLS_531, new __VLS_531({}));
        var __VLS_533 = __VLS_532.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_532), false));
        var __VLS_536 = __VLS_534.slots.default;
        for (var _0 = 0, _1 = __VLS_vFor((__VLS_ctx.headers)); _0 < _1.length; _0++) {
            var h_7 = _1[_0][0];
            var __VLS_537 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_538 = __VLS_asFunctionalComponent1(__VLS_537, new __VLS_537({
                key: (h_7),
                value: (h_7),
            }));
            var __VLS_539 = __VLS_538.apply(void 0, __spreadArray([{
                    key: (h_7),
                    value: (h_7),
                }], __VLS_functionalComponentArgsRest(__VLS_538), false));
            var __VLS_542 = __VLS_540.slots.default;
            (h_7);
            // @ts-ignore
            [headers,];
            var __VLS_540;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_534;
        // @ts-ignore
        [];
        var __VLS_517;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-muted-foreground text-[0.8rem]" }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[0.8rem]']} */ ;
        // @ts-ignore
        [];
        var __VLS_505;
    }
    // @ts-ignore
    [];
    var __VLS_452;
    var __VLS_543 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
    tabs_1.TabsContent;
    // @ts-ignore
    var __VLS_544 = __VLS_asFunctionalComponent1(__VLS_543, new __VLS_543(__assign({ value: "geo" }, { class: "space-y-4 py-4" })));
    var __VLS_545 = __VLS_544.apply(void 0, __spreadArray([__assign({ value: "geo" }, { class: "space-y-4 py-4" })], __VLS_functionalComponentArgsRest(__VLS_544), false));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    var __VLS_548 = __VLS_546.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    var __VLS_549 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_550 = __VLS_asFunctionalComponent1(__VLS_549, new __VLS_549(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
    var __VLS_551 = __VLS_550.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_550), false));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    var __VLS_554 = __VLS_552.slots.default;
    // @ts-ignore
    [];
    var __VLS_552;
    var __VLS_555 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
    radio_group_1.RadioGroup;
    // @ts-ignore
    var __VLS_556 = __VLS_asFunctionalComponent1(__VLS_555, new __VLS_555(__assign({ modelValue: (__VLS_ctx.coordinateMode) }, { class: "flex flex-col gap-2" })));
    var __VLS_557 = __VLS_556.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.coordinateMode) }, { class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_556), false));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var __VLS_560 = __VLS_558.slots.default;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    var __VLS_561 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_562 = __VLS_asFunctionalComponent1(__VLS_561, new __VLS_561({
        id: "coord-none",
        value: "none",
    }));
    var __VLS_563 = __VLS_562.apply(void 0, __spreadArray([{
            id: "coord-none",
            value: "none",
        }], __VLS_functionalComponentArgsRest(__VLS_562), false));
    var __VLS_566 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_567 = __VLS_asFunctionalComponent1(__VLS_566, new __VLS_566({
        for: "coord-none",
    }));
    var __VLS_568 = __VLS_567.apply(void 0, __spreadArray([{
            for: "coord-none",
        }], __VLS_functionalComponentArgsRest(__VLS_567), false));
    var __VLS_571 = __VLS_569.slots.default;
    // @ts-ignore
    [coordinateMode,];
    var __VLS_569;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    var __VLS_572 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_573 = __VLS_asFunctionalComponent1(__VLS_572, new __VLS_572({
        id: "coord-separate",
        value: "separate",
    }));
    var __VLS_574 = __VLS_573.apply(void 0, __spreadArray([{
            id: "coord-separate",
            value: "separate",
        }], __VLS_functionalComponentArgsRest(__VLS_573), false));
    var __VLS_577 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_578 = __VLS_asFunctionalComponent1(__VLS_577, new __VLS_577({
        for: "coord-separate",
    }));
    var __VLS_579 = __VLS_578.apply(void 0, __spreadArray([{
            for: "coord-separate",
        }], __VLS_functionalComponentArgsRest(__VLS_578), false));
    var __VLS_582 = __VLS_580.slots.default;
    // @ts-ignore
    [];
    var __VLS_580;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    var __VLS_583 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
    radio_group_1.RadioGroupItem;
    // @ts-ignore
    var __VLS_584 = __VLS_asFunctionalComponent1(__VLS_583, new __VLS_583({
        id: "coord-combined",
        value: "combined",
    }));
    var __VLS_585 = __VLS_584.apply(void 0, __spreadArray([{
            id: "coord-combined",
            value: "combined",
        }], __VLS_functionalComponentArgsRest(__VLS_584), false));
    var __VLS_588 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
    label_1.Label;
    // @ts-ignore
    var __VLS_589 = __VLS_asFunctionalComponent1(__VLS_588, new __VLS_588({
        for: "coord-combined",
    }));
    var __VLS_590 = __VLS_589.apply(void 0, __spreadArray([{
            for: "coord-combined",
        }], __VLS_functionalComponentArgsRest(__VLS_589), false));
    var __VLS_593 = __VLS_591.slots.default;
    // @ts-ignore
    [];
    var __VLS_591;
    // @ts-ignore
    [];
    var __VLS_558;
    if (__VLS_ctx.coordinateMode === 'separate') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        var __VLS_594 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_595 = __VLS_asFunctionalComponent1(__VLS_594, new __VLS_594(__assign({ class: "gap-1.5" })));
        var __VLS_596 = __VLS_595.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_595), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_599 = __VLS_597.slots.default;
        var __VLS_600 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_601 = __VLS_asFunctionalComponent1(__VLS_600, new __VLS_600({}));
        var __VLS_602 = __VLS_601.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_601), false));
        var __VLS_605 = __VLS_603.slots.default;
        // @ts-ignore
        [coordinateMode,];
        var __VLS_603;
        var __VLS_606 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_607 = __VLS_asFunctionalComponent1(__VLS_606, new __VLS_606({
            modelValue: (__VLS_ctx.latitudeField),
        }));
        var __VLS_608 = __VLS_607.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.latitudeField),
            }], __VLS_functionalComponentArgsRest(__VLS_607), false));
        var __VLS_611 = __VLS_609.slots.default;
        var __VLS_612 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_613 = __VLS_asFunctionalComponent1(__VLS_612, new __VLS_612(__assign({ class: "w-full" })));
        var __VLS_614 = __VLS_613.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_613), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_617 = __VLS_615.slots.default;
        var __VLS_618 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_619 = __VLS_asFunctionalComponent1(__VLS_618, new __VLS_618({
            placeholder: "Select column",
        }));
        var __VLS_620 = __VLS_619.apply(void 0, __spreadArray([{
                placeholder: "Select column",
            }], __VLS_functionalComponentArgsRest(__VLS_619), false));
        // @ts-ignore
        [latitudeField,];
        var __VLS_615;
        var __VLS_623 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_624 = __VLS_asFunctionalComponent1(__VLS_623, new __VLS_623({}));
        var __VLS_625 = __VLS_624.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_624), false));
        var __VLS_628 = __VLS_626.slots.default;
        var __VLS_629 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_630 = __VLS_asFunctionalComponent1(__VLS_629, new __VLS_629({
            value: (null),
        }));
        var __VLS_631 = __VLS_630.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_630), false));
        var __VLS_634 = __VLS_632.slots.default;
        // @ts-ignore
        [];
        var __VLS_632;
        for (var _2 = 0, _3 = __VLS_vFor((__VLS_ctx.headers)); _2 < _3.length; _2++) {
            var h_8 = _3[_2][0];
            var __VLS_635 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_636 = __VLS_asFunctionalComponent1(__VLS_635, new __VLS_635({
                key: (h_8),
                value: (h_8),
            }));
            var __VLS_637 = __VLS_636.apply(void 0, __spreadArray([{
                    key: (h_8),
                    value: (h_8),
                }], __VLS_functionalComponentArgsRest(__VLS_636), false));
            var __VLS_640 = __VLS_638.slots.default;
            (h_8);
            // @ts-ignore
            [headers,];
            var __VLS_638;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_626;
        // @ts-ignore
        [];
        var __VLS_609;
        // @ts-ignore
        [];
        var __VLS_597;
        var __VLS_641 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_642 = __VLS_asFunctionalComponent1(__VLS_641, new __VLS_641(__assign({ class: "gap-1.5" })));
        var __VLS_643 = __VLS_642.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_642), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_646 = __VLS_644.slots.default;
        var __VLS_647 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_648 = __VLS_asFunctionalComponent1(__VLS_647, new __VLS_647({}));
        var __VLS_649 = __VLS_648.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_648), false));
        var __VLS_652 = __VLS_650.slots.default;
        // @ts-ignore
        [];
        var __VLS_650;
        var __VLS_653 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_654 = __VLS_asFunctionalComponent1(__VLS_653, new __VLS_653({
            modelValue: (__VLS_ctx.longitudeField),
        }));
        var __VLS_655 = __VLS_654.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.longitudeField),
            }], __VLS_functionalComponentArgsRest(__VLS_654), false));
        var __VLS_658 = __VLS_656.slots.default;
        var __VLS_659 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_660 = __VLS_asFunctionalComponent1(__VLS_659, new __VLS_659(__assign({ class: "w-full" })));
        var __VLS_661 = __VLS_660.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_660), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_664 = __VLS_662.slots.default;
        var __VLS_665 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_666 = __VLS_asFunctionalComponent1(__VLS_665, new __VLS_665({
            placeholder: "Select column",
        }));
        var __VLS_667 = __VLS_666.apply(void 0, __spreadArray([{
                placeholder: "Select column",
            }], __VLS_functionalComponentArgsRest(__VLS_666), false));
        // @ts-ignore
        [longitudeField,];
        var __VLS_662;
        var __VLS_670 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_671 = __VLS_asFunctionalComponent1(__VLS_670, new __VLS_670({}));
        var __VLS_672 = __VLS_671.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_671), false));
        var __VLS_675 = __VLS_673.slots.default;
        var __VLS_676 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_677 = __VLS_asFunctionalComponent1(__VLS_676, new __VLS_676({
            value: (null),
        }));
        var __VLS_678 = __VLS_677.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_677), false));
        var __VLS_681 = __VLS_679.slots.default;
        // @ts-ignore
        [];
        var __VLS_679;
        for (var _4 = 0, _5 = __VLS_vFor((__VLS_ctx.headers)); _4 < _5.length; _4++) {
            var h_9 = _5[_4][0];
            var __VLS_682 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_683 = __VLS_asFunctionalComponent1(__VLS_682, new __VLS_682({
                key: (h_9),
                value: (h_9),
            }));
            var __VLS_684 = __VLS_683.apply(void 0, __spreadArray([{
                    key: (h_9),
                    value: (h_9),
                }], __VLS_functionalComponentArgsRest(__VLS_683), false));
            var __VLS_687 = __VLS_685.slots.default;
            (h_9);
            // @ts-ignore
            [headers,];
            var __VLS_685;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_673;
        // @ts-ignore
        [];
        var __VLS_656;
        // @ts-ignore
        [];
        var __VLS_644;
    }
    if (__VLS_ctx.coordinateMode === 'combined') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        var __VLS_688 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_689 = __VLS_asFunctionalComponent1(__VLS_688, new __VLS_688(__assign({ class: "gap-1.5" })));
        var __VLS_690 = __VLS_689.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_689), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_693 = __VLS_691.slots.default;
        var __VLS_694 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_695 = __VLS_asFunctionalComponent1(__VLS_694, new __VLS_694({}));
        var __VLS_696 = __VLS_695.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_695), false));
        var __VLS_699 = __VLS_697.slots.default;
        // @ts-ignore
        [coordinateMode,];
        var __VLS_697;
        var __VLS_700 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_701 = __VLS_asFunctionalComponent1(__VLS_700, new __VLS_700({
            modelValue: (__VLS_ctx.positionField),
        }));
        var __VLS_702 = __VLS_701.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.positionField),
            }], __VLS_functionalComponentArgsRest(__VLS_701), false));
        var __VLS_705 = __VLS_703.slots.default;
        var __VLS_706 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_707 = __VLS_asFunctionalComponent1(__VLS_706, new __VLS_706(__assign({ class: "w-full" })));
        var __VLS_708 = __VLS_707.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_707), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_711 = __VLS_709.slots.default;
        var __VLS_712 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_713 = __VLS_asFunctionalComponent1(__VLS_712, new __VLS_712({
            placeholder: "Select column",
        }));
        var __VLS_714 = __VLS_713.apply(void 0, __spreadArray([{
                placeholder: "Select column",
            }], __VLS_functionalComponentArgsRest(__VLS_713), false));
        // @ts-ignore
        [positionField,];
        var __VLS_709;
        var __VLS_717 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_718 = __VLS_asFunctionalComponent1(__VLS_717, new __VLS_717({}));
        var __VLS_719 = __VLS_718.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_718), false));
        var __VLS_722 = __VLS_720.slots.default;
        var __VLS_723 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_724 = __VLS_asFunctionalComponent1(__VLS_723, new __VLS_723({
            value: (null),
        }));
        var __VLS_725 = __VLS_724.apply(void 0, __spreadArray([{
                value: (null),
            }], __VLS_functionalComponentArgsRest(__VLS_724), false));
        var __VLS_728 = __VLS_726.slots.default;
        // @ts-ignore
        [];
        var __VLS_726;
        for (var _6 = 0, _7 = __VLS_vFor((__VLS_ctx.headers)); _6 < _7.length; _6++) {
            var h_10 = _7[_6][0];
            var __VLS_729 = void 0;
            /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
            select_1.SelectItem;
            // @ts-ignore
            var __VLS_730 = __VLS_asFunctionalComponent1(__VLS_729, new __VLS_729({
                key: (h_10),
                value: (h_10),
            }));
            var __VLS_731 = __VLS_730.apply(void 0, __spreadArray([{
                    key: (h_10),
                    value: (h_10),
                }], __VLS_functionalComponentArgsRest(__VLS_730), false));
            var __VLS_734 = __VLS_732.slots.default;
            (h_10);
            // @ts-ignore
            [headers,];
            var __VLS_732;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_720;
        // @ts-ignore
        [];
        var __VLS_703;
        // @ts-ignore
        [];
        var __VLS_691;
        var __VLS_735 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Field | typeof __VLS_components.Field} */
        field_1.Field;
        // @ts-ignore
        var __VLS_736 = __VLS_asFunctionalComponent1(__VLS_735, new __VLS_735(__assign({ class: "gap-1.5" })));
        var __VLS_737 = __VLS_736.apply(void 0, __spreadArray([__assign({ class: "gap-1.5" })], __VLS_functionalComponentArgsRest(__VLS_736), false));
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        var __VLS_740 = __VLS_738.slots.default;
        var __VLS_741 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.FieldLabel | typeof __VLS_components.FieldLabel} */
        field_1.FieldLabel;
        // @ts-ignore
        var __VLS_742 = __VLS_asFunctionalComponent1(__VLS_741, new __VLS_741({}));
        var __VLS_743 = __VLS_742.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_742), false));
        var __VLS_746 = __VLS_744.slots.default;
        // @ts-ignore
        [];
        var __VLS_744;
        var __VLS_747 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
        select_1.Select;
        // @ts-ignore
        var __VLS_748 = __VLS_asFunctionalComponent1(__VLS_747, new __VLS_747({
            modelValue: (__VLS_ctx.combinedCoordinateFormat),
        }));
        var __VLS_749 = __VLS_748.apply(void 0, __spreadArray([{
                modelValue: (__VLS_ctx.combinedCoordinateFormat),
            }], __VLS_functionalComponentArgsRest(__VLS_748), false));
        var __VLS_752 = __VLS_750.slots.default;
        var __VLS_753 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
        select_1.SelectTrigger;
        // @ts-ignore
        var __VLS_754 = __VLS_asFunctionalComponent1(__VLS_753, new __VLS_753(__assign({ class: "w-full" })));
        var __VLS_755 = __VLS_754.apply(void 0, __spreadArray([__assign({ class: "w-full" })], __VLS_functionalComponentArgsRest(__VLS_754), false));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_758 = __VLS_756.slots.default;
        var __VLS_759 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectValue} */
        select_1.SelectValue;
        // @ts-ignore
        var __VLS_760 = __VLS_asFunctionalComponent1(__VLS_759, new __VLS_759({
            placeholder: "Select format",
        }));
        var __VLS_761 = __VLS_760.apply(void 0, __spreadArray([{
                placeholder: "Select format",
            }], __VLS_functionalComponentArgsRest(__VLS_760), false));
        // @ts-ignore
        [combinedCoordinateFormat,];
        var __VLS_756;
        var __VLS_764 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
        select_1.SelectContent;
        // @ts-ignore
        var __VLS_765 = __VLS_asFunctionalComponent1(__VLS_764, new __VLS_764({}));
        var __VLS_766 = __VLS_765.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_765), false));
        var __VLS_769 = __VLS_767.slots.default;
        var __VLS_770 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_771 = __VLS_asFunctionalComponent1(__VLS_770, new __VLS_770({
            value: "LatLon",
        }));
        var __VLS_772 = __VLS_771.apply(void 0, __spreadArray([{
                value: "LatLon",
            }], __VLS_functionalComponentArgsRest(__VLS_771), false));
        var __VLS_775 = __VLS_773.slots.default;
        // @ts-ignore
        [];
        var __VLS_773;
        var __VLS_776 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_777 = __VLS_asFunctionalComponent1(__VLS_776, new __VLS_776({
            value: "LonLat",
        }));
        var __VLS_778 = __VLS_777.apply(void 0, __spreadArray([{
                value: "LonLat",
            }], __VLS_functionalComponentArgsRest(__VLS_777), false));
        var __VLS_781 = __VLS_779.slots.default;
        // @ts-ignore
        [];
        var __VLS_779;
        var __VLS_782 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_783 = __VLS_asFunctionalComponent1(__VLS_782, new __VLS_782({
            value: "MGRS",
        }));
        var __VLS_784 = __VLS_783.apply(void 0, __spreadArray([{
                value: "MGRS",
            }], __VLS_functionalComponentArgsRest(__VLS_783), false));
        var __VLS_787 = __VLS_785.slots.default;
        // @ts-ignore
        [];
        var __VLS_785;
        var __VLS_788 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_789 = __VLS_asFunctionalComponent1(__VLS_788, new __VLS_788({
            value: "DMS",
        }));
        var __VLS_790 = __VLS_789.apply(void 0, __spreadArray([{
                value: "DMS",
            }], __VLS_functionalComponentArgsRest(__VLS_789), false));
        var __VLS_793 = __VLS_791.slots.default;
        // @ts-ignore
        [];
        var __VLS_791;
        var __VLS_794 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
        select_1.SelectItem;
        // @ts-ignore
        var __VLS_795 = __VLS_asFunctionalComponent1(__VLS_794, new __VLS_794({
            value: "JSON",
        }));
        var __VLS_796 = __VLS_795.apply(void 0, __spreadArray([{
                value: "JSON",
            }], __VLS_functionalComponentArgsRest(__VLS_795), false));
        var __VLS_799 = __VLS_797.slots.default;
        // @ts-ignore
        [];
        var __VLS_797;
        // @ts-ignore
        [];
        var __VLS_767;
        // @ts-ignore
        [];
        var __VLS_750;
        // @ts-ignore
        [];
        var __VLS_738;
    }
    if (__VLS_ctx.coordinateMode !== 'none') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3 border-t pt-4" }));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        var __VLS_800 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_801 = __VLS_asFunctionalComponent1(__VLS_800, new __VLS_800(__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })));
        var __VLS_802 = __VLS_801.apply(void 0, __spreadArray([__assign({ class: "text-muted-foreground text-xs font-semibold uppercase" })], __VLS_functionalComponentArgsRest(__VLS_801), false));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        var __VLS_805 = __VLS_803.slots.default;
        // @ts-ignore
        [coordinateMode,];
        var __VLS_803;
        var __VLS_806 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroup | typeof __VLS_components.RadioGroup} */
        radio_group_1.RadioGroup;
        // @ts-ignore
        var __VLS_807 = __VLS_asFunctionalComponent1(__VLS_806, new __VLS_806(__assign({ modelValue: (__VLS_ctx.positionTimeMode) }, { class: "flex flex-col gap-2" })));
        var __VLS_808 = __VLS_807.apply(void 0, __spreadArray([__assign({ modelValue: (__VLS_ctx.positionTimeMode) }, { class: "flex flex-col gap-2" })], __VLS_functionalComponentArgsRest(__VLS_807), false));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        var __VLS_811 = __VLS_809.slots.default;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_812 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_813 = __VLS_asFunctionalComponent1(__VLS_812, new __VLS_812({
            id: "time-current",
            value: "current",
        }));
        var __VLS_814 = __VLS_813.apply(void 0, __spreadArray([{
                id: "time-current",
                value: "current",
            }], __VLS_functionalComponentArgsRest(__VLS_813), false));
        var __VLS_817 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_818 = __VLS_asFunctionalComponent1(__VLS_817, new __VLS_817({
            for: "time-current",
        }));
        var __VLS_819 = __VLS_818.apply(void 0, __spreadArray([{
                for: "time-current",
            }], __VLS_functionalComponentArgsRest(__VLS_818), false));
        var __VLS_822 = __VLS_820.slots.default;
        (__VLS_ctx.fmt.scenarioFormatter.format(+__VLS_ctx.time.scenarioTime.value));
        // @ts-ignore
        [positionTimeMode, fmt, time,];
        var __VLS_820;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        var __VLS_823 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.RadioGroupItem} */
        radio_group_1.RadioGroupItem;
        // @ts-ignore
        var __VLS_824 = __VLS_asFunctionalComponent1(__VLS_823, new __VLS_823({
            id: "time-event",
            value: "event",
        }));
        var __VLS_825 = __VLS_824.apply(void 0, __spreadArray([{
                id: "time-event",
                value: "event",
            }], __VLS_functionalComponentArgsRest(__VLS_824), false));
        var __VLS_828 = void 0;
        /** @ts-ignore @type {typeof __VLS_components.Label | typeof __VLS_components.Label} */
        label_1.Label;
        // @ts-ignore
        var __VLS_829 = __VLS_asFunctionalComponent1(__VLS_828, new __VLS_828({
            for: "time-event",
        }));
        var __VLS_830 = __VLS_829.apply(void 0, __spreadArray([{
                for: "time-event",
            }], __VLS_functionalComponentArgsRest(__VLS_829), false));
        var __VLS_833 = __VLS_831.slots.default;
        // @ts-ignore
        [];
        var __VLS_831;
        // @ts-ignore
        [];
        var __VLS_809;
        if (__VLS_ctx.positionTimeMode === 'event') {
            var __VLS_834 = SimpleSelect_vue_1.default;
            // @ts-ignore
            var __VLS_835 = __VLS_asFunctionalComponent1(__VLS_834, new __VLS_834({
                label: "Select event",
                items: (__VLS_ctx.events),
                modelValue: (__VLS_ctx.positionEventId),
            }));
            var __VLS_836 = __VLS_835.apply(void 0, __spreadArray([{
                    label: "Select event",
                    items: (__VLS_ctx.events),
                    modelValue: (__VLS_ctx.positionEventId),
                }], __VLS_functionalComponentArgsRest(__VLS_835), false));
        }
    }
    // @ts-ignore
    [positionTimeMode, events, positionEventId,];
    var __VLS_546;
    // @ts-ignore
    [];
    var __VLS_188;
    // @ts-ignore
    [];
}
var __VLS_839;
/** @ts-ignore @type {typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
tabs_1.Tabs;
// @ts-ignore
var __VLS_840 = __VLS_asFunctionalComponent1(__VLS_839, new __VLS_839(__assign({ defaultValue: "preview" }, { class: "flex h-full min-h-0 flex-col" })));
var __VLS_841 = __VLS_840.apply(void 0, __spreadArray([__assign({ defaultValue: "preview" }, { class: "flex h-full min-h-0 flex-col" })], __VLS_functionalComponentArgsRest(__VLS_840), false));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
var __VLS_844 = __VLS_842.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex shrink-0 items-center justify-between border-b px-6 py-2" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
var __VLS_845;
/** @ts-ignore @type {typeof __VLS_components.TabsList | typeof __VLS_components.TabsList} */
tabs_1.TabsList;
// @ts-ignore
var __VLS_846 = __VLS_asFunctionalComponent1(__VLS_845, new __VLS_845(__assign({ class: "grid w-full grid-cols-2 lg:w-[25rem]" })));
var __VLS_847 = __VLS_846.apply(void 0, __spreadArray([__assign({ class: "grid w-full grid-cols-2 lg:w-[25rem]" })], __VLS_functionalComponentArgsRest(__VLS_846), false));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-[25rem]']} */ ;
var __VLS_850 = __VLS_848.slots.default;
var __VLS_851;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_852 = __VLS_asFunctionalComponent1(__VLS_851, new __VLS_851({
    value: "preview",
}));
var __VLS_853 = __VLS_852.apply(void 0, __spreadArray([{
        value: "preview",
    }], __VLS_functionalComponentArgsRest(__VLS_852), false));
var __VLS_856 = __VLS_854.slots.default;
// @ts-ignore
[];
var __VLS_854;
var __VLS_857;
/** @ts-ignore @type {typeof __VLS_components.TabsTrigger | typeof __VLS_components.TabsTrigger} */
tabs_1.TabsTrigger;
// @ts-ignore
var __VLS_858 = __VLS_asFunctionalComponent1(__VLS_857, new __VLS_857({
    value: "source",
}));
var __VLS_859 = __VLS_858.apply(void 0, __spreadArray([{
        value: "source",
    }], __VLS_functionalComponentArgsRest(__VLS_858), false));
var __VLS_862 = __VLS_860.slots.default;
// @ts-ignore
[];
var __VLS_860;
// @ts-ignore
[];
var __VLS_848;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-xs" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
(__VLS_ctx.data.length);
var __VLS_863;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_864 = __VLS_asFunctionalComponent1(__VLS_863, new __VLS_863(__assign({ value: "preview" }, { class: "mt-0 min-h-0 flex-1 overflow-hidden p-6" })));
var __VLS_865 = __VLS_864.apply(void 0, __spreadArray([__assign({ value: "preview" }, { class: "mt-0 min-h-0 flex-1 overflow-hidden p-6" })], __VLS_functionalComponentArgsRest(__VLS_864), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
var __VLS_868 = __VLS_866.slots.default;
if (__VLS_ctx.importMode === 'update-units') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-full flex-col overflow-hidden rounded-md border shadow-sm" }));
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between border-b px-4 py-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-xs" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.matchedCount);
    (__VLS_ctx.changesCount);
    var __VLS_869 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_870 = __VLS_asFunctionalComponent1(__VLS_869, new __VLS_869(__assign({ data: (__VLS_ctx.updatePreviewData), columns: (__VLS_ctx.updatePreviewColumns), rowCount: (__VLS_ctx.updatePreviewData.length), rowHeight: (40) }, { class: "flex-1" })));
    var __VLS_871 = __VLS_870.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.updatePreviewData), columns: (__VLS_ctx.updatePreviewColumns), rowCount: (__VLS_ctx.updatePreviewData.length), rowHeight: (40) }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_870), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-full flex-col overflow-hidden rounded-md border shadow-sm" }));
    /** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between border-b px-4 py-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-muted-foreground text-xs" }));
    /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.mappedData.length);
    var __VLS_874 = DataGrid_vue_1.default;
    // @ts-ignore
    var __VLS_875 = __VLS_asFunctionalComponent1(__VLS_874, new __VLS_874(__assign(__assign({ data: (__VLS_ctx.fieldMappings.parentId && __VLS_ctx.hierarchyData.length > 0
            ? __VLS_ctx.hierarchyData
            : __VLS_ctx.mappedData), columns: (__VLS_ctx.previewColumns), rowCount: (__VLS_ctx.mappedData.length), rowHeight: (40) }, { class: "flex-1" }), { initialState: (__VLS_ctx.hierarchyTableState), getSubRows: (__VLS_ctx.fieldMappings.parentId ? function (row) { return row.subUnits; } : undefined) })));
    var __VLS_876 = __VLS_875.apply(void 0, __spreadArray([__assign(__assign({ data: (__VLS_ctx.fieldMappings.parentId && __VLS_ctx.hierarchyData.length > 0
                ? __VLS_ctx.hierarchyData
                : __VLS_ctx.mappedData), columns: (__VLS_ctx.previewColumns), rowCount: (__VLS_ctx.mappedData.length), rowHeight: (40) }, { class: "flex-1" }), { initialState: (__VLS_ctx.hierarchyTableState), getSubRows: (__VLS_ctx.fieldMappings.parentId ? function (row) { return row.subUnits; } : undefined) })], __VLS_functionalComponentArgsRest(__VLS_875), false));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
}
// @ts-ignore
[importMode, changesCount, matchedCount, data, fieldMappings, fieldMappings, updatePreviewData, updatePreviewData, updatePreviewColumns, mappedData, mappedData, mappedData, hierarchyData, hierarchyData, previewColumns, hierarchyTableState,];
var __VLS_866;
var __VLS_879;
/** @ts-ignore @type {typeof __VLS_components.TabsContent | typeof __VLS_components.TabsContent} */
tabs_1.TabsContent;
// @ts-ignore
var __VLS_880 = __VLS_asFunctionalComponent1(__VLS_879, new __VLS_879(__assign({ value: "source" }, { class: "mt-0 min-h-0 flex-1 overflow-hidden p-6" })));
var __VLS_881 = __VLS_880.apply(void 0, __spreadArray([__assign({ value: "source" }, { class: "mt-0 min-h-0 flex-1 overflow-hidden p-6" })], __VLS_functionalComponentArgsRest(__VLS_880), false));
/** @type {__VLS_StyleScopedClasses['mt-0']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
var __VLS_884 = __VLS_882.slots.default;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-background flex h-full flex-col overflow-hidden rounded-md border shadow-sm" }));
/** @type {__VLS_StyleScopedClasses['bg-background']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between border-b px-4 py-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "text-sm font-medium" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-muted-foreground text-xs" }));
/** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
var __VLS_885;
/** @ts-ignore @type {typeof __VLS_components.Select | typeof __VLS_components.Select} */
select_1.Select;
// @ts-ignore
var __VLS_886 = __VLS_asFunctionalComponent1(__VLS_885, new __VLS_885({
    modelValue: (__VLS_ctx.activeSheet),
}));
var __VLS_887 = __VLS_886.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.activeSheet),
    }], __VLS_functionalComponentArgsRest(__VLS_886), false));
var __VLS_890 = __VLS_888.slots.default;
var __VLS_891;
/** @ts-ignore @type {typeof __VLS_components.SelectTrigger | typeof __VLS_components.SelectTrigger} */
select_1.SelectTrigger;
// @ts-ignore
var __VLS_892 = __VLS_asFunctionalComponent1(__VLS_891, new __VLS_891(__assign({ class: "h-8 w-[12.5rem]" })));
var __VLS_893 = __VLS_892.apply(void 0, __spreadArray([__assign({ class: "h-8 w-[12.5rem]" })], __VLS_functionalComponentArgsRest(__VLS_892), false));
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[12.5rem]']} */ ;
var __VLS_896 = __VLS_894.slots.default;
var __VLS_897;
/** @ts-ignore @type {typeof __VLS_components.SelectValue} */
select_1.SelectValue;
// @ts-ignore
var __VLS_898 = __VLS_asFunctionalComponent1(__VLS_897, new __VLS_897({
    placeholder: "Select sheet",
}));
var __VLS_899 = __VLS_898.apply(void 0, __spreadArray([{
        placeholder: "Select sheet",
    }], __VLS_functionalComponentArgsRest(__VLS_898), false));
// @ts-ignore
[activeSheet,];
var __VLS_894;
var __VLS_902;
/** @ts-ignore @type {typeof __VLS_components.SelectContent | typeof __VLS_components.SelectContent} */
select_1.SelectContent;
// @ts-ignore
var __VLS_903 = __VLS_asFunctionalComponent1(__VLS_902, new __VLS_902({}));
var __VLS_904 = __VLS_903.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_903), false));
var __VLS_907 = __VLS_905.slots.default;
for (var _8 = 0, _9 = __VLS_vFor((__VLS_ctx.sheetNames)); _8 < _9.length; _8++) {
    var sheet = _9[_8][0];
    var __VLS_908 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.SelectItem | typeof __VLS_components.SelectItem} */
    select_1.SelectItem;
    // @ts-ignore
    var __VLS_909 = __VLS_asFunctionalComponent1(__VLS_908, new __VLS_908({
        key: (sheet),
        value: (sheet),
    }));
    var __VLS_910 = __VLS_909.apply(void 0, __spreadArray([{
            key: (sheet),
            value: (sheet),
        }], __VLS_functionalComponentArgsRest(__VLS_909), false));
    var __VLS_913 = __VLS_911.slots.default;
    (sheet);
    // @ts-ignore
    [sheetNames,];
    var __VLS_911;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_905;
// @ts-ignore
[];
var __VLS_888;
var __VLS_914 = DataGrid_vue_1.default;
// @ts-ignore
var __VLS_915 = __VLS_asFunctionalComponent1(__VLS_914, new __VLS_914(__assign({ data: (__VLS_ctx.data), columns: (__VLS_ctx.columns), rowCount: (__VLS_ctx.data.length) }, { class: "flex-1" })));
var __VLS_916 = __VLS_915.apply(void 0, __spreadArray([__assign({ data: (__VLS_ctx.data), columns: (__VLS_ctx.columns), rowCount: (__VLS_ctx.data.length) }, { class: "flex-1" })], __VLS_functionalComponentArgsRest(__VLS_915), false));
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
// @ts-ignore
[data, data, columns,];
var __VLS_882;
// @ts-ignore
[];
var __VLS_842;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __typeProps: {},
});
exports.default = {};
