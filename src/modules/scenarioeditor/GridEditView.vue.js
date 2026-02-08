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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@vueuse/core");
var vue_router_1 = require("vue-router");
var uiStore_1 = require("@/stores/uiStore");
var vue_1 = require("vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var FilterQueryInput_vue_1 = require("@/components/FilterQueryInput.vue");
var filtering_1 = require("@/composables/filtering");
var GridHeader_vue_1 = require("@/modules/scenarioeditor/GridHeader.vue");
var GridSideGroupRow_vue_1 = require("@/modules/scenarioeditor/GridSideGroupRow.vue");
var GridSideRow_vue_1 = require("@/modules/scenarioeditor/GridSideRow.vue");
var GridUnitRow_vue_1 = require("@/modules/scenarioeditor/GridUnitRow.vue");
var BaseButton_vue_1 = require("@/components/BaseButton.vue");
var searchActions_1 = require("@/composables/searchActions");
var notifications_1 = require("@/composables/notifications");
var helpers_1 = require("@/components/helpers");
var CheckboxDropdown_vue_1 = require("@/components/CheckboxDropdown.vue");
var router = (0, vue_router_1.useRouter)();
var uiStore = (0, uiStore_1.useUiStore)();
var target = (0, vue_1.ref)();
var getModalSidc = (0, utils_1.injectStrict)(injects_1.sidcModalKey).getModalSidc;
var activeItem = (0, vue_1.ref)();
var activeColumn = (0, vue_1.ref)();
var activeScenario = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
var state = activeScenario.store.state, unitActions = activeScenario.unitActions;
var availableColumns = [
    { value: "name", label: "Name", type: "text" },
    { value: "shortName", label: "Short name", type: "text" },
    { value: "sidc", label: "Symbol code", type: "sidc" },
    { value: "externalUrl", label: "URL", type: "text", hidden: true },
    { value: "description", label: "Description", type: "markdown", hidden: true },
    { value: "id", label: "Id", type: "text", hidden: true },
];
var selectedColumns = (0, core_1.useStorage)("grid-columns-1", availableColumns.filter(function (e) { return !(e.hidden === true); }).map(function (e) { return e.value; }));
var columns = (0, vue_1.computed)(function () {
    return availableColumns.filter(function (c) { return selectedColumns.value.includes(c.value); });
});
var sgOpen = (0, vue_1.ref)(new Map());
var sideOpen = (0, vue_1.ref)(new Map());
var updateUnit = unitActions.updateUnit, updateSide = unitActions.updateSide, updateSideGroup = unitActions.updateSideGroup;
var filterQuery = (0, vue_1.ref)("");
var sidesToggled = (0, vue_1.ref)(false);
var debouncedFilterQuery = (0, core_1.useDebounce)(filterQuery, 250);
var queryHasChanged = (0, vue_1.ref)(true);
var send = (0, notifications_1.useNotifications)().send;
(0, vue_1.watch)(debouncedFilterQuery, function (v) {
    queryHasChanged.value = true;
});
var filteredOrbat = (0, vue_1.computed)(function () {
    var sideList = [];
    var resetOpen = queryHasChanged.value;
    queryHasChanged.value = false;
    state.sides
        .map(function (id) { return state.sideMap[id]; })
        .forEach(function (side) {
        var sideGroupList = [];
        var dummyGroups = __spreadArray([], side.groups, true);
        if (side.subUnits) {
            dummyGroups.push(side.id);
        }
        dummyGroups
            .map(function (id) {
            if (id in state.sideGroupMap) {
                return state.sideGroupMap[id];
            }
            else {
                // Create a dummy side group for root units
                return {
                    id: side.id,
                    name: "(Root units)",
                    shortName: "",
                    _pid: side.id,
                    subUnits: side.subUnits || [],
                };
            }
        })
            .forEach(function (sideGroup) {
            var filteredUnits = (0, filtering_1.filterUnits)(sideGroup.subUnits, state.unitMap, debouncedFilterQuery.value, false, resetOpen);
            if (filteredUnits.length) {
                sideGroupList.push({ sideGroup: sideGroup, children: filteredUnits });
            }
        });
        if (sideGroupList.length) {
            sideList.push({ side: side, children: sideGroupList });
        }
    });
    if (queryHasChanged) {
        sgOpen.value.clear();
        sideOpen.value.clear();
    }
    return sideList;
});
var items = (0, vue_1.computed)(function () {
    var _items = [];
    filteredOrbat.value.forEach(function (_a) {
        var _b;
        var side = _a.side, sideGroups = _a.children;
        _items.push({ type: "side", side: side, id: side.id });
        if (!((_b = sideOpen.value.get(side)) !== null && _b !== void 0 ? _b : true))
            return;
        sideGroups.forEach(function (sg) {
            var _a;
            var sideGroup = sg.sideGroup;
            _items.push({ type: "sidegroup", sideGroup: sideGroup, id: sideGroup.id });
            if (!((_a = sgOpen.value.get(sideGroup)) !== null && _a !== void 0 ? _a : true))
                return;
            walkSideGroupItem(sg, function (unit, level, parent, sideGroup) {
                _items.push({ type: "unit", unit: unit, id: unit.id, level: level });
                if (unit.subUnits.length && unit._isOpen === false)
                    return false;
            });
        });
    });
    return _items;
});
function walkSideGroupItem(sideGroupItem, callback, s) {
    if (s === void 0) { s = state; }
    var level = 0;
    function helper(_a, parent) {
        var unit = _a.unit, children = _a.children;
        var r = callback(unit, level, parent, sideGroupItem.sideGroup);
        if (r !== undefined)
            return r;
        if (children.length) {
            level += 1;
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var subUnitId = children_1[_i];
                helper(subUnitId, unit);
            }
            level -= 1;
        }
    }
    for (var _i = 0, _a = sideGroupItem.children; _i < _a.length; _i++) {
        var unitId = _a[_i];
        var r = helper(unitId, sideGroupItem.sideGroup);
        if (r === true)
            break;
    }
}
var expandMap = new WeakSet();
function expandUnit(unitId, open) {
    unitActions.walkSubUnits(unitId, function (unit) { return (unit._isOpen = open); }, {
        includeParent: true,
    });
}
function expandSideGroup(sideGroup) {
    var open = true;
    if (expandMap.has(sideGroup)) {
        open = false;
        expandMap.delete(sideGroup);
    }
    else {
        expandMap.add(sideGroup);
        sgOpen.value.set(sideGroup, true);
    }
    sideGroup.subUnits.forEach(function (unitId) {
        expandUnit(unitId, open);
    });
}
function toggleExpandItem(e) {
    var _a, _b;
    if (!activeItem.value)
        return;
    var item = activeItem.value;
    var type = item.type;
    if (type === "sidegroup") {
        expandSideGroup(item.sideGroup);
    }
    else if (type === "unit") {
        var open_1 = !((_a = item.unit._isOpen) !== null && _a !== void 0 ? _a : true);
        expandUnit(item.unit.id, open_1);
    }
    else if (type === "side") {
        var open_2 = !((_b = sideOpen.value.get(item.side)) !== null && _b !== void 0 ? _b : true);
        if (open_2)
            item.side.groups.forEach(function (g) { return expandSideGroup(state.sideGroupMap[g]); });
    }
}
function toggleOpenItem(e) {
    if (!activeItem.value)
        return;
    var type = activeItem.value.type;
    if (type === "unit") {
        activeItem.value.unit._isOpen = !activeItem.value.unit._isOpen;
    }
    else if (type === "side") {
        toggleSide(activeItem.value.side);
    }
    else if (type === "sidegroup") {
        toggleSideGroup(activeItem.value.sideGroup);
    }
}
function toggleSideGroup(sideGroup) {
    var _a;
    sgOpen.value.set(sideGroup, !((_a = sgOpen.value.get(sideGroup)) !== null && _a !== void 0 ? _a : true));
}
function toggleSide(side) {
    var _a;
    sideOpen.value.set(side, !((_a = sideOpen.value.get(side)) !== null && _a !== void 0 ? _a : true));
}
function toggleSides() {
    state.sides
        .map(function (id) { return state.sideMap[id]; })
        .forEach(function (side) { return sideOpen.value.set(side, sidesToggled.value); });
    sidesToggled.value = !sidesToggled.value;
}
function doArrows(direction, e) {
    var target = e.target;
    if (!target.id.startsWith("cell-"))
        return;
    if (e instanceof KeyboardEvent)
        e.preventDefault();
    var _a = target.id.split("-"), _ = _a[0], y = _a[1], x = _a[2];
    var nextY = +y;
    var nextX = +x;
    if (direction === "up")
        nextY--;
    if (direction === "down")
        nextY++;
    if (direction === "left")
        nextX--;
    if (direction === "right")
        nextX++;
    var nextId = "cell-".concat(nextY, "-").concat(nextX);
    var nextElement = document.getElementById(nextId);
    var nextItem = items.value[nextY];
    if (!nextElement && (direction === "up" || direction === "down")) {
        while (nextItem) {
            nextY = direction === "up" ? nextY - 1 : nextY + 1;
            nextItem = items.value[nextY];
            nextId = "cell-".concat(nextY, "-").concat(nextX);
            nextElement = document.getElementById(nextId);
            if (nextElement)
                break;
        }
    }
    if (nextElement) {
        if (nextItem)
            activeItem.value = nextItem;
        nextElement.focus({});
    }
}
function nextCell(element) {
    doArrows("down", { target: element });
}
(0, core_1.useEventListener)(document, "paste", onPaste);
(0, core_1.useEventListener)(document, "copy", onCopy);
(0, vue_1.onMounted)(function () {
    var _a;
    (_a = document.getElementById("cell-0-1")) === null || _a === void 0 ? void 0 : _a.focus();
});
var onUnitSelect = (0, searchActions_1.useSearchActions)().onUnitSelect;
onUnitSelect(function (_a) {
    var unitId = _a.unitId;
    var _b = unitActions.getUnitHierarchy(unitId), parents = _b.parents, side = _b.side, sideGroup = _b.sideGroup;
    sideGroup && sgOpen.value.set(sideGroup, true);
    sideOpen.value.set(side, true);
    parents.forEach(function (p) { return (p._isOpen = true); });
    (0, vue_1.nextTick)(function () {
        var el = document.getElementById("item-".concat(unitId));
        if (el) {
            var firstEditableCell_1 = el.querySelector(".editable-cell");
            if (firstEditableCell_1) {
                setTimeout(function () { return firstEditableCell_1 === null || firstEditableCell_1 === void 0 ? void 0 : firstEditableCell_1.focus(); }, 200);
            }
        }
        else {
            send({ message: "Unit is currently filtered out" });
        }
    });
});
function onCopy(c) {
    var _a, _b;
    if (!(0, helpers_1.inputEventFilter)(c))
        return;
    // Use document.activeElement instead of c.target because Chrome will not
    // emit copy/paste events for programmatically focused div elements.
    var target = document.activeElement;
    if (!((target === null || target === void 0 ? void 0 : target.classList.contains("editable-cell")) ||
        ((_a = target === null || target === void 0 ? void 0 : target.parentElement) === null || _a === void 0 ? void 0 : _a.classList.contains("editable-cell"))))
        return;
    var text = target.textContent || "";
    (_b = c.clipboardData) === null || _b === void 0 ? void 0 : _b.setData("text/plain", text.trim());
    c.preventDefault();
}
function onPaste(e) {
    var _a, _b;
    if (!(0, helpers_1.inputEventFilter)(e))
        return;
    var target = document.activeElement;
    if (!((target === null || target === void 0 ? void 0 : target.classList.contains("editable-cell")) ||
        ((_a = target === null || target === void 0 ? void 0 : target.parentElement) === null || _a === void 0 ? void 0 : _a.classList.contains("editable-cell"))))
        return;
    e.preventDefault();
    var txt = (_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.getData("text/plain").trim();
    txt && updateActiveItemValue(txt);
}
function onActiveItem(item, column) {
    activeItem.value = item;
    activeColumn.value = column;
}
var createNewItem = function () {
    var item = activeItem.value;
    if (!item)
        return;
    item.type === "unit" && unitActions.createSubordinateUnit(item.unit.id);
};
var duplicateItem = function () {
    var item = activeItem.value;
    if (!item)
        return;
    item.type === "unit" && unitActions.cloneUnit(item.unit.id);
};
var deleteItem = function () {
    var item = activeItem.value;
    if (!item)
        return;
    item.type === "unit" && unitActions.deleteUnit(item.unit.id);
    item.type === "side" && unitActions.deleteSide(item.side.id);
    item.type === "sidegroup" && unitActions.deleteSideGroup(item.sideGroup.id);
};
function updateActiveItemValue(txt) {
    var _a, _b, _c;
    var item = activeItem.value;
    var column = activeColumn.value;
    if (item && column) {
        switch (item.type) {
            case "unit":
                updateUnit(item.id, (_a = {}, _a[column] = txt, _a));
                break;
            case "side":
                updateSide(item.id, (_b = {}, _b[column] = txt, _b));
                break;
            case "sidegroup":
                updateSideGroup(item.id, (_c = {}, _c[column] = txt, _c));
                break;
        }
    }
}
function doDelete(e) {
    var target = e.target;
    if (!(target === null || target === void 0 ? void 0 : target.classList.contains("editable-cell")))
        return;
    e.preventDefault();
    updateActiveItemValue("");
}
function onUnitEdit(unit, b, c) {
    return __awaiter(this, void 0, void 0, function () {
        var newSidcValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(b === "sidc")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getModalSidc(c, {
                            symbolOptions: unit.symbolOptions,
                            inheritedSymbolOptions: unitActions.getCombinedSymbolOptions(unit, true),
                            reinforcedStatus: unit.reinforcedStatus,
                        })];
                case 1:
                    newSidcValue = _a.sent();
                    if (newSidcValue !== undefined) {
                        updateUnit(unit.id, {
                            sidc: newSidcValue.sidc,
                            symbolOptions: newSidcValue.symbolOptions,
                            reinforcedStatus: newSidcValue.reinforcedStatus,
                        });
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.doArrows('down', $event);
        // @ts-ignore
        [doArrows,];
    } }, { onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.doArrows('up', $event);
        // @ts-ignore
        [doArrows,];
    } }), { onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.doArrows('left', $event);
        // @ts-ignore
        [doArrows,];
    } }), { onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.doArrows('right', $event);
        // @ts-ignore
        [doArrows,];
    } }), { onKeydown: (__VLS_ctx.doDelete) }), { onKeydown: (__VLS_ctx.duplicateItem) }), { onKeydown: (__VLS_ctx.createNewItem) }), { onKeydown: (__VLS_ctx.toggleExpandItem) }), { onKeydown: (__VLS_ctx.toggleOpenItem) }), { class: "relative flex min-h-0 flex-auto" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ ref: "target" }, { class: "border-border bg-card text-foreground flex h-full w-full flex-col overflow-hidden border shadow-sm sm:rounded-lg" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:rounded-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "border-border bg-muted/60 flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-muted/60']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex w-full items-center space-x-2 overflow-x-auto sm:w-auto" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
var __VLS_0 = FilterQueryInput_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ class: "" }, { modelValue: (__VLS_ctx.filterQuery) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "" }, { modelValue: (__VLS_ctx.filterQuery) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
/** @type {__VLS_StyleScopedClasses['']} */ ;
var __VLS_5 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5(__assign({ 'onClick': {} }, { small: true })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_10;
var __VLS_11 = ({ click: {} },
    { onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.toggleSides();
            // @ts-ignore
            [doDelete, duplicateItem, createNewItem, toggleExpandItem, toggleOpenItem, filterQuery, toggleSides,];
        } });
var __VLS_12 = __VLS_8.slots.default;
// @ts-ignore
[];
var __VLS_8;
var __VLS_9;
var __VLS_13 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13(__assign({ 'onClick': {} }, { small: true })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_18;
var __VLS_19 = ({ click: {} },
    { onClick: (__VLS_ctx.createNewItem) });
var __VLS_20 = __VLS_16.slots.default;
// @ts-ignore
[createNewItem,];
var __VLS_16;
var __VLS_17;
var __VLS_21 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21(__assign({ 'onClick': {} }, { small: true })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true })], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_26;
var __VLS_27 = ({ click: {} },
    { onClick: (__VLS_ctx.duplicateItem) });
var __VLS_28 = __VLS_24.slots.default;
// @ts-ignore
[duplicateItem,];
var __VLS_24;
var __VLS_25;
var __VLS_29 = BaseButton_vue_1.default || BaseButton_vue_1.default;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { small: true, disabled: (!__VLS_ctx.activeItem) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { small: true, disabled: (!__VLS_ctx.activeItem) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_34;
var __VLS_35 = ({ click: {} },
    { onClick: (__VLS_ctx.deleteItem) });
var __VLS_36 = __VLS_32.slots.default;
// @ts-ignore
[activeItem, deleteItem,];
var __VLS_32;
var __VLS_33;
var __VLS_37 = CheckboxDropdown_vue_1.default || CheckboxDropdown_vue_1.default;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    options: (__VLS_ctx.availableColumns),
    modelValue: (__VLS_ctx.selectedColumns),
}));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
        options: (__VLS_ctx.availableColumns),
        modelValue: (__VLS_ctx.selectedColumns),
    }], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_42 = __VLS_40.slots.default;
// @ts-ignore
[availableColumns, selectedColumns,];
var __VLS_40;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative max-w-none min-w-0 flex-auto overflow-auto pb-7" }));
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "text-foreground w-full table-fixed text-sm" }));
/** @type {__VLS_StyleScopedClasses['text-foreground']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['table-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_43 = GridHeader_vue_1.default;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    columns: (__VLS_ctx.columns),
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        columns: (__VLS_ctx.columns),
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)(__assign({ class: "divide-border bg-card divide-y" }));
/** @type {__VLS_StyleScopedClasses['divide-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-card']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
var _loop_1 = function (item, itemIndex) {
    (item.id);
    if (item.type === 'unit') {
        var __VLS_48 = GridUnitRow_vue_1.default;
        // @ts-ignore
        var __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48(__assign(__assign(__assign(__assign({ 'onUpdateUnit': {} }, { 'onNextCell': {} }), { 'onActiveItem': {} }), { 'onEdit': {} }), { unit: (item.unit), columns: (__VLS_ctx.columns), level: (item.level), itemIndex: (itemIndex), isActive: (((_a = __VLS_ctx.activeItem) === null || _a === void 0 ? void 0 : _a.id) === item.id) })));
        var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onUpdateUnit': {} }, { 'onNextCell': {} }), { 'onActiveItem': {} }), { 'onEdit': {} }), { unit: (item.unit), columns: (__VLS_ctx.columns), level: (item.level), itemIndex: (itemIndex), isActive: (((_b = __VLS_ctx.activeItem) === null || _b === void 0 ? void 0 : _b.id) === item.id) })], __VLS_functionalComponentArgsRest(__VLS_49), false));
        var __VLS_53 = void 0;
        var __VLS_54 = ({ updateUnit: {} },
            { onUpdateUnit: (__VLS_ctx.updateUnit) });
        var __VLS_55 = ({ nextCell: {} },
            { onNextCell: (__VLS_ctx.nextCell) });
        var __VLS_56 = ({ activeItem: {} },
            { onActiveItem: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(item.type === 'unit'))
                        return;
                    __VLS_ctx.onActiveItem(item, $event);
                    // @ts-ignore
                    [activeItem, columns, columns, items, updateUnit, nextCell, onActiveItem,];
                } });
        var __VLS_57 = ({ edit: {} },
            { onEdit: (__VLS_ctx.onUnitEdit) });
    }
    else if (item.type === 'side') {
        var __VLS_58 = GridSideRow_vue_1.default;
        // @ts-ignore
        var __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58(__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onNextCell': {} }), { 'onUpdateSide': {} }), { 'onActiveItem': {} }), { side: (item.side), columns: (__VLS_ctx.columns), sideOpen: (__VLS_ctx.sideOpen), itemIndex: (itemIndex), isActive: (((_c = __VLS_ctx.activeItem) === null || _c === void 0 ? void 0 : _c.id) === item.id) })));
        var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onNextCell': {} }), { 'onUpdateSide': {} }), { 'onActiveItem': {} }), { side: (item.side), columns: (__VLS_ctx.columns), sideOpen: (__VLS_ctx.sideOpen), itemIndex: (itemIndex), isActive: (((_d = __VLS_ctx.activeItem) === null || _d === void 0 ? void 0 : _d.id) === item.id) })], __VLS_functionalComponentArgsRest(__VLS_59), false));
        var __VLS_63 = void 0;
        var __VLS_64 = ({ toggle: {} },
            { onToggle: (__VLS_ctx.toggleSide) });
        var __VLS_65 = ({ nextCell: {} },
            { onNextCell: (__VLS_ctx.nextCell) });
        var __VLS_66 = ({ updateSide: {} },
            { onUpdateSide: (__VLS_ctx.updateSide) });
        var __VLS_67 = ({ activeItem: {} },
            { onActiveItem: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(item.type === 'unit'))
                        return;
                    if (!(item.type === 'side'))
                        return;
                    __VLS_ctx.onActiveItem(item, $event);
                    // @ts-ignore
                    [activeItem, columns, nextCell, onActiveItem, onUnitEdit, sideOpen, toggleSide, updateSide,];
                } });
    }
    else if (item.type === 'sidegroup') {
        var __VLS_68 = GridSideGroupRow_vue_1.default;
        // @ts-ignore
        var __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68(__assign(__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onExpand': {} }), { 'onNextCell': {} }), { 'onUpdateSideGroup': {} }), { 'onActiveItem': {} }), { sideGroup: (item.sideGroup), columns: (__VLS_ctx.columns), sgOpen: (__VLS_ctx.sgOpen), itemIndex: (itemIndex), isActive: (((_e = __VLS_ctx.activeItem) === null || _e === void 0 ? void 0 : _e.id) === item.id) })));
        var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onToggle': {} }, { 'onExpand': {} }), { 'onNextCell': {} }), { 'onUpdateSideGroup': {} }), { 'onActiveItem': {} }), { sideGroup: (item.sideGroup), columns: (__VLS_ctx.columns), sgOpen: (__VLS_ctx.sgOpen), itemIndex: (itemIndex), isActive: (((_f = __VLS_ctx.activeItem) === null || _f === void 0 ? void 0 : _f.id) === item.id) })], __VLS_functionalComponentArgsRest(__VLS_69), false));
        var __VLS_73 = void 0;
        var __VLS_74 = ({ toggle: {} },
            { onToggle: (__VLS_ctx.toggleSideGroup) });
        var __VLS_75 = ({ expand: {} },
            { onExpand: (__VLS_ctx.expandSideGroup) });
        var __VLS_76 = ({ nextCell: {} },
            { onNextCell: (__VLS_ctx.nextCell) });
        var __VLS_77 = ({ updateSideGroup: {} },
            { onUpdateSideGroup: (__VLS_ctx.updateSideGroup) });
        var __VLS_78 = ({ activeItem: {} },
            { onActiveItem: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(item.type === 'unit'))
                        return;
                    if (!!(item.type === 'side'))
                        return;
                    if (!(item.type === 'sidegroup'))
                        return;
                    __VLS_ctx.onActiveItem(item, $event);
                    // @ts-ignore
                    [activeItem, columns, nextCell, onActiveItem, sgOpen, toggleSideGroup, expandSideGroup, updateSideGroup,];
                } });
    }
    // @ts-ignore
    [];
};
var __VLS_51, __VLS_52, __VLS_61, __VLS_62, __VLS_71, __VLS_72;
for (var _i = 0, _g = __VLS_vFor((__VLS_ctx.items)); _i < _g.length; _i++) {
    var _h = _g[_i], item = _h[0], itemIndex = _h[1];
    _loop_1(item, itemIndex);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)(__assign({ class: "border-border bg-muted/60 h-12 shrink-0 border-t" }));
/** @type {__VLS_StyleScopedClasses['border-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-muted/60']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
