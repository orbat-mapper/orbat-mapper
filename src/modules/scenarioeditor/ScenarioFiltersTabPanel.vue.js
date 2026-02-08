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
Object.defineProperty(exports, "__esModule", { value: true });
var PanelHeading_vue_1 = require("@/components/PanelHeading.vue");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var vue_1 = require("vue");
var sidc_1 = require("@/symbology/sidc");
var selectedStore_1 = require("@/stores/selectedStore");
var values_1 = require("@/symbology/values");
var app6d_1 = require("@/symbology/standards/app6d");
var FilterTree_vue_1 = require("@/modules/scenarioeditor/FilterTree.vue");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var IconButton_vue_1 = require("@/components/IconButton.vue");
var button_1 = require("@/components/ui/button");
var NewAccordionPanel_vue_1 = require("@/components/NewAccordionPanel.vue");
var badge_1 = require("@/components/ui/badge");
var helpers_ts_1 = require("@/symbology/helpers.ts");
var state = (0, utils_1.injectStrict)(injects_1.activeScenarioKey).store.state;
var sideTree = (0, vue_1.ref)([]);
var emtTree = (0, vue_1.ref)([]);
var iconTree = (0, vue_1.ref)([]);
var modifierTree = (0, vue_1.ref)([]);
var statusTree = (0, vue_1.ref)([]);
var sidTree = (0, vue_1.ref)([]);
var selectedUnitIds = (0, selectedStore_1.useSelectedItems)().selectedUnitIds;
var excludedKeys = (0, vue_1.ref)(new Set());
var expandedKeys = (0, vue_1.ref)([]);
var flatStats = (0, vue_1.ref)({});
(0, vue_1.watchEffect)(function () {
    var stats = {};
    var sidStatItems = [];
    var sideStatItems = [];
    var emtStatItems = [];
    var iconStatItems = [];
    var modifierStatItems = [];
    var statusStatItems = [];
    Object.values(state.unitMap).forEach(function (unit) {
        var _a, _b;
        var _c = updateUnitStats(unit, stats), sideKey = _c.sideKey, sideGroupKey = _c.sideGroupKey, emtKey = _c.emtKey, symbolSetKey = _c.symbolSetKey, entityKey = _c.entityKey, entityTypeKey = _c.entityTypeKey, mod1Key = _c.mod1Key, mod2Key = _c.mod2Key, modSymbolSetKey = _c.modSymbolSetKey, statusKey = _c.statusKey, hqtfdKey = _c.hqtfdKey, sidKey = _c.sidKey;
        var iconSidc = new sidc_1.Sidc((0, helpers_ts_1.getFullUnitSidc)(unit.sidc));
        var originalEmt = iconSidc.emt;
        var originalMod1 = iconSidc.modifierOne;
        var originalMod2 = iconSidc.modifierTwo;
        iconSidc.emt = "00";
        iconSidc.hqtfd = "0";
        iconSidc.standardIdentity = "3";
        iconSidc.entitySubType = "00";
        iconSidc.modifierOne = "00";
        iconSidc.modifierTwo = "00";
        var sidc = iconSidc.toString();
        iconSidc.mainIcon = "000000";
        var sidcSymbolSet = iconSidc.toString();
        iconSidc.modifierOne = originalMod1;
        iconSidc.modifierTwo = originalMod2;
        iconSidc.modifierOne = "00";
        iconSidc.modifierTwo = "00";
        iconSidc.emt = originalEmt;
        var sidcEmt = iconSidc.toString();
        if (stats[sideKey] === 1) {
            sideStatItems.push({
                key: sideKey,
                label: getSideLabel(unit._sid),
                sidc: sidc,
            });
        }
        if (stats[sideGroupKey] === 1) {
            var sideItem = sideStatItems.find(function (item) { return item.key === sideKey; });
            if (sideItem) {
                var children = sideItem.children || [];
                if (unit._gid)
                    children.push({
                        key: sideGroupKey,
                        label: getSideGroupLabel(unit._gid),
                        sidc: "10031000100000000000",
                    });
                sideItem.children = children;
                sideItem.sidc = "10031000100000000000";
            }
        }
        if (stats[emtKey] === 1) {
            emtStatItems.push({ key: emtKey, label: getEchelonLabel(emtKey), sidc: sidcEmt });
        }
        if (stats[symbolSetKey] === 1) {
            iconStatItems.push({
                key: symbolSetKey,
                label: getIconLabel({ symbolSet: symbolSetKey }),
                sidc: sidcSymbolSet,
            });
            modifierStatItems.push({
                key: modSymbolSetKey,
                label: getIconLabel({ symbolSet: symbolSetKey }),
                sidc: sidcSymbolSet,
            });
        }
        if (stats[entityKey] === 1) {
            var iconItem = iconStatItems.find(function (item) { return item.key === symbolSetKey; });
            if (iconItem) {
                var children = iconItem.children || [];
                children.push({
                    key: entityKey,
                    label: getIconLabel({
                        symbolSet: symbolSetKey,
                        entity: entityKey.split("-")[1],
                    }),
                    sidc: sidc,
                });
                iconItem.children = (0, utils_1.sortBy)(children, "label");
            }
        }
        if (stats[entityTypeKey] === 1) {
            var entityItem = (_b = (_a = iconStatItems
                .find(function (item) { return item.key === symbolSetKey; })) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b.find(function (item) { return item.key === entityKey; });
            if (entityItem) {
                var children = entityItem.children || [];
                children.push({
                    key: entityTypeKey,
                    label: getIconLabel({
                        symbolSet: symbolSetKey,
                        entity: entityKey.split("-")[1],
                        entityType: entityTypeKey.split("-")[2],
                    }),
                    sidc: sidc,
                });
                entityItem.children = (0, utils_1.sortBy)(children, "label");
            }
        }
        if (stats[mod1Key] === 1) {
            var modifierItem = modifierStatItems.find(function (item) { return item.key === modSymbolSetKey; });
            if (modifierItem) {
                var children = modifierItem.children || [];
                var sidc_2 = new sidc_1.Sidc(sidcSymbolSet);
                sidc_2.modifierOne = mod1Key.split("-")[2];
                children.push({
                    key: mod1Key,
                    label: getModifierLabel({
                        symbolSet: symbolSetKey,
                        mod1: mod1Key.split("-")[2],
                    }),
                    sidc: sidc_2.toString(),
                });
                modifierItem.children = (0, utils_1.sortBy)(children, "label");
            }
        }
        if (stats[mod2Key] === 1) {
            var modifierItem = modifierStatItems.find(function (item) { return item.key === modSymbolSetKey; });
            if (modifierItem) {
                var children = modifierItem.children || [];
                var sidc_3 = new sidc_1.Sidc(sidcSymbolSet);
                sidc_3.modifierTwo = mod2Key.split("-")[2];
                children.push({
                    key: mod2Key,
                    label: getModifierLabel({
                        symbolSet: symbolSetKey,
                        mod2: mod2Key.split("-")[2],
                    }),
                    sidc: sidc_3.toString(),
                });
                modifierItem.children = (0, utils_1.sortBy)(children, "label");
            }
        }
        if (stats[statusKey] === 1) {
            var tmpSidc = new sidc_1.Sidc("10031000100000000000");
            var statusCode = statusKey.split("-")[1];
            tmpSidc.status = statusCode;
            statusStatItems.push({
                key: statusKey,
                label: getStatusLabel(statusCode),
                sidc: tmpSidc.toString(),
            });
        }
        if (stats[hqtfdKey] === 1) {
            var tmpSidc = new sidc_1.Sidc("10031000100000000000");
            var hqtfdCode = hqtfdKey.split("-")[1];
            tmpSidc.hqtfd = hqtfdCode;
            statusStatItems.push({
                key: hqtfdKey,
                label: getHqtfdLabel(hqtfdCode),
                sidc: tmpSidc.toString(),
            });
        }
        if (stats[sidKey] === 1) {
            var tmpSidc = new sidc_1.Sidc("10031000000000000000");
            var sidCode = sidKey.split("-")[1];
            tmpSidc.standardIdentity = sidCode;
            sidStatItems.push({
                key: sidKey,
                label: getSidLabel(sidCode),
                sidc: tmpSidc.toString(),
            });
        }
    });
    flatStats.value = stats;
    sideTree.value = (0, utils_1.sortBy)(sideStatItems, "label");
    emtTree.value = (0, utils_1.sortBy)(emtStatItems, "label");
    iconTree.value = (0, utils_1.sortBy)(iconStatItems, "label");
    modifierTree.value = (0, utils_1.sortBy)(modifierStatItems.filter(function (i) { var _a; return (_a = i.children) === null || _a === void 0 ? void 0 : _a.length; }), "label");
    statusTree.value = (0, utils_1.sortBy)(statusStatItems, "label");
    sidTree.value = (0, utils_1.sortBy)(sidStatItems, "label");
});
var selectedStats = (0, vue_1.computed)(function () {
    var stats = {};
    selectedUnitIds.value.forEach(function (unitId) {
        updateUnitStats(unitId, stats);
    });
    return stats;
});
function updateUnitStats(unitOrUnitId, stats) {
    var unit = typeof unitOrUnitId === "string" ? state.unitMap[unitOrUnitId] : unitOrUnitId;
    var keys = createKeys(unit);
    var symbolSetKey = keys.symbolSetKey, entityKey = keys.entityKey, entityTypeKey = keys.entityTypeKey, emtKey = keys.emtKey, sideKey = keys.sideKey, sideGroupKey = keys.sideGroupKey, mod1Key = keys.mod1Key, mod2Key = keys.mod2Key, modSymbolSetKey = keys.modSymbolSetKey, statusKey = keys.statusKey, hqtfdKey = keys.hqtfdKey, sidKey = keys.sidKey;
    stats[symbolSetKey] = (stats[symbolSetKey] || 0) + 1;
    stats[entityKey] = (stats[entityKey] || 0) + 1;
    stats[entityTypeKey] = (stats[entityTypeKey] || 0) + 1;
    stats[emtKey] = (stats[emtKey] || 0) + 1;
    stats[sideKey] = (stats[sideKey] || 0) + 1;
    stats[sideGroupKey] = (stats[sideGroupKey] || 0) + 1;
    stats[modSymbolSetKey] = (stats[modSymbolSetKey] || 0) + 1;
    stats[statusKey] = (stats[statusKey] || 0) + 1;
    stats[sidKey] = (stats[sidKey] || 0) + 1;
    if (!hqtfdKey.endsWith("0"))
        stats[hqtfdKey] = (stats[hqtfdKey] || 0) + 1;
    if (!mod1Key.endsWith("00"))
        stats[mod1Key] = (stats[mod1Key] || 0) + 1;
    if (!mod2Key.endsWith("00"))
        stats[mod2Key] = (stats[mod2Key] || 0) + 1;
    return keys;
}
function createKeys(unit) {
    var sidc = new sidc_1.Sidc((0, helpers_ts_1.getFullUnitSidc)(unit.sidc));
    var sidKey = "sid-".concat(sidc.standardIdentity);
    var symbolSetKey = "".concat(sidc.symbolSet);
    var entityKey = "".concat(sidc.symbolSet, "-").concat(sidc.entity);
    var entityTypeKey = "".concat(sidc.symbolSet, "-").concat(sidc.entity, "-").concat(sidc.entityType);
    var emtKey = "emt-".concat(sidc.emt);
    var sideKey = "side-".concat(unit._sid);
    var sideGroupKey = "side-".concat(unit._sid, "-").concat(unit._gid);
    var modSymbolSetKey = "mod-".concat(sidc.symbolSet);
    var mod1Key = "mod1-".concat(symbolSetKey, "-").concat(sidc.modifierOne);
    var mod2Key = "mod2-".concat(symbolSetKey, "-").concat(sidc.modifierTwo);
    var statusKey = "status-".concat(sidc.status);
    var hqtfdKey = "hqtfd-".concat(sidc.hqtfd);
    return {
        sidKey: sidKey,
        symbolSetKey: symbolSetKey,
        entityKey: entityKey,
        entityTypeKey: entityTypeKey,
        emtKey: emtKey,
        sideKey: sideKey,
        sideGroupKey: sideGroupKey,
        modSymbolSetKey: modSymbolSetKey,
        mod1Key: mod1Key,
        mod2Key: mod2Key,
        statusKey: statusKey,
        hqtfdKey: hqtfdKey,
    };
}
function selectByKey(key) {
    Object.values(state.unitMap).forEach(function (unit) {
        var _a = createKeys(unit), symbolSetKey = _a.symbolSetKey, entityKey = _a.entityKey, entityTypeKey = _a.entityTypeKey, emtKey = _a.emtKey, sideKey = _a.sideKey, sideGroupKey = _a.sideGroupKey, modSymbolSetKey = _a.modSymbolSetKey, mod1Key = _a.mod1Key, mod2Key = _a.mod2Key, statusKey = _a.statusKey, hqtfdKey = _a.hqtfdKey, sidKey = _a.sidKey;
        if (excludedKeys.value.has(symbolSetKey) ||
            excludedKeys.value.has(entityKey) ||
            excludedKeys.value.has(entityTypeKey) ||
            excludedKeys.value.has(emtKey) ||
            excludedKeys.value.has(sideKey) ||
            excludedKeys.value.has(sideGroupKey) ||
            excludedKeys.value.has(modSymbolSetKey) ||
            excludedKeys.value.has(mod1Key) ||
            excludedKeys.value.has(mod2Key) ||
            excludedKeys.value.has(statusKey) ||
            excludedKeys.value.has(hqtfdKey) ||
            excludedKeys.value.has(sidKey)) {
            return;
        }
        if (key === symbolSetKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === entityKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === entityTypeKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === emtKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === sideKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === sideGroupKey && !excludedKeys.value.has(sideGroupKey)) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === modSymbolSetKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === mod1Key) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === mod2Key) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === statusKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === hqtfdKey) {
            selectedUnitIds.value.add(unit.id);
        }
        else if (key === sidKey) {
            selectedUnitIds.value.add(unit.id);
        }
    });
}
function clearByKey(key) {
    selectedUnitIds.value.forEach(function (unitId) {
        var unit = state.unitMap[unitId];
        var _a = createKeys(unit), symbolSetKey = _a.symbolSetKey, entityKey = _a.entityKey, entityTypeKey = _a.entityTypeKey, emtKey = _a.emtKey, sideKey = _a.sideKey, sideGroupKey = _a.sideGroupKey, mod2Key = _a.mod2Key, mod1Key = _a.mod1Key, modSymbolSetKey = _a.modSymbolSetKey, statusKey = _a.statusKey, hqtfdKey = _a.hqtfdKey, sidKey = _a.sidKey;
        if (key === symbolSetKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === entityKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === entityTypeKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === emtKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === sideKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === sideGroupKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === mod1Key) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === mod2Key) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === modSymbolSetKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === statusKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === hqtfdKey) {
            selectedUnitIds.value.delete(unit.id);
        }
        else if (key === sidKey) {
            selectedUnitIds.value.delete(unit.id);
        }
    });
}
function getEchelonLabel(echelon) {
    var _a, _b;
    if (echelon.startsWith("emt-")) {
        var _c = echelon.split("-"), nechelon_1 = _c[1];
        return ((_a = values_1.echelonValues.find(function (v) { return v.code === nechelon_1; })) === null || _a === void 0 ? void 0 : _a.text) || echelon;
    }
    return ((_b = values_1.echelonValues.find(function (v) { return v.code === echelon; })) === null || _b === void 0 ? void 0 : _b.text) || echelon;
}
function getStatusLabel(code) {
    var _a;
    return ((_a = values_1.statusValues.find(function (v) { return v.code === code; })) === null || _a === void 0 ? void 0 : _a.text) || code;
}
function getHqtfdLabel(code) {
    var _a;
    return ((_a = values_1.HQTFDummyValues.find(function (v) { return v.code === code; })) === null || _a === void 0 ? void 0 : _a.text) || code;
}
function getSymbolSetLabel(symbolSet) {
    var _a;
    return ((_a = values_1.symbolSetValues.find(function (v) { return v.code === symbolSet; })) === null || _a === void 0 ? void 0 : _a.text) || symbolSet;
}
function getSidLabel(code) {
    var _a;
    return ((_a = values_1.standardIdentityValues.find(function (v) { return v.code === code; })) === null || _a === void 0 ? void 0 : _a.text) || code;
}
function getSideLabel(sideId) {
    var _a;
    return ((_a = state.sideMap[sideId]) === null || _a === void 0 ? void 0 : _a.name) || sideId;
}
function getSideGroupLabel(sideGroupId) {
    var _a;
    return ((_a = state.sideGroupMap[sideGroupId]) === null || _a === void 0 ? void 0 : _a.name) || sideGroupId;
}
function getIconLabel(_a) {
    var _b, _c, _d, _e;
    var symbolSet = _a.symbolSet, entity = _a.entity, entityType = _a.entityType;
    var label = (_c = (_b = symbolSet !== null && symbolSet !== void 0 ? symbolSet : entity) !== null && _b !== void 0 ? _b : entityType) !== null && _c !== void 0 ? _c : "Unknown";
    if (symbolSet === undefined) {
        return label;
    }
    if (entity == undefined && entityType == undefined) {
        return getSymbolSetLabel(symbolSet);
    }
    if (entity !== undefined && entityType == undefined) {
        var mainIcon = (_d = app6d_1.app6d[symbolSet]) === null || _d === void 0 ? void 0 : _d.mainIcon;
        var i = mainIcon === null || mainIcon === void 0 ? void 0 : mainIcon.find(function (icon) { return icon.code.startsWith(entity); });
        return (i === null || i === void 0 ? void 0 : i.entity) || label;
    }
    if (entity !== undefined && entityType !== undefined) {
        var mainIcon = (_e = app6d_1.app6d[symbolSet]) === null || _e === void 0 ? void 0 : _e.mainIcon;
        var prefix_1 = entity + entityType;
        var i = mainIcon === null || mainIcon === void 0 ? void 0 : mainIcon.find(function (icon) { return icon.code.startsWith(prefix_1); });
        return (i === null || i === void 0 ? void 0 : i.entityType) || (i === null || i === void 0 ? void 0 : i.entity) || label;
    }
    return label;
}
function getModifierLabel(_a) {
    var _b, _c, _d, _e;
    var symbolSet = _a.symbolSet, mod1 = _a.mod1, mod2 = _a.mod2;
    var label = (_c = (_b = symbolSet !== null && symbolSet !== void 0 ? symbolSet : mod1) !== null && _b !== void 0 ? _b : mod2) !== null && _c !== void 0 ? _c : "Unknown";
    if (symbolSet === undefined) {
        return label;
    }
    if (mod1) {
        var modifiers = (_d = app6d_1.app6d[symbolSet]) === null || _d === void 0 ? void 0 : _d.modifierOne;
        var i = modifiers === null || modifiers === void 0 ? void 0 : modifiers.find(function (mod) { return mod.code === mod1; });
        return (i === null || i === void 0 ? void 0 : i.modifier) || label;
    }
    if (mod2) {
        var modifiers = (_e = app6d_1.app6d[symbolSet]) === null || _e === void 0 ? void 0 : _e.modifierTwo;
        var i = modifiers === null || modifiers === void 0 ? void 0 : modifiers.find(function (mod) { return mod.code === mod2; });
        return (i === null || i === void 0 ? void 0 : i.modifier) || label;
    }
    return label;
}
function onSelect(event) {
    var key = event.detail.value.key;
    if (selectedStats.value[key]) {
        clearByKey(key);
    }
    else {
        selectByKey(key);
    }
}
function expandAllIcons() {
    var keys = Object.keys(flatStats.value).filter(function (key) { return !key.startsWith("side-"); });
    var expandedSideKeys = keys.filter(function (key) { return key.startsWith("side-"); });
    if (expandedKeys.value.length - expandedSideKeys.length === keys.length) {
        expandedKeys.value = [];
    }
    else {
        expandedKeys.value = keys;
    }
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "px-4" }));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "bg-sidebar sticky top-0 z-10 -mx-4 flex h-12 items-center justify-between px-4 py-2" }));
/** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
var __VLS_0 = PanelHeading_vue_1.default || PanelHeading_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center space-x-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
if (__VLS_ctx.excludedKeys.size) {
    var __VLS_6 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_11 = void 0;
    var __VLS_12 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.excludedKeys.size))
                    return;
                __VLS_ctx.excludedKeys.clear();
                // @ts-ignore
                [excludedKeys, excludedKeys,];
            } });
    var __VLS_13 = __VLS_9.slots.default;
    var __VLS_14 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    badge_1.Badge;
    // @ts-ignore
    var __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        variant: "secondary",
    }));
    var __VLS_16 = __VLS_15.apply(void 0, __spreadArray([{
            variant: "secondary",
        }], __VLS_functionalComponentArgsRest(__VLS_15), false));
    var __VLS_19 = __VLS_17.slots.default;
    (__VLS_ctx.excludedKeys.size);
    // @ts-ignore
    [excludedKeys,];
    var __VLS_17;
    // @ts-ignore
    [];
    var __VLS_9;
    var __VLS_10;
}
if (__VLS_ctx.selectedUnitIds.size) {
    var __VLS_20 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Button | typeof __VLS_components.Button} */
    button_1.Button;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "outline", size: "sm" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_25 = void 0;
    var __VLS_26 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.selectedUnitIds.size))
                    return;
                __VLS_ctx.selectedUnitIds.clear();
                // @ts-ignore
                [selectedUnitIds, selectedUnitIds,];
            } });
    var __VLS_27 = __VLS_23.slots.default;
    var __VLS_28 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    badge_1.Badge;
    // @ts-ignore
    var __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        variant: "secondary",
    }));
    var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{
            variant: "secondary",
        }], __VLS_functionalComponentArgsRest(__VLS_29), false));
    var __VLS_33 = __VLS_31.slots.default;
    (__VLS_ctx.selectedUnitIds.size);
    // @ts-ignore
    [selectedUnitIds,];
    var __VLS_31;
    // @ts-ignore
    [];
    var __VLS_23;
    var __VLS_24;
}
var __VLS_34 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    label: "Command level",
}));
var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([{
        label: "Command level",
    }], __VLS_functionalComponentArgsRest(__VLS_35), false));
var __VLS_39 = __VLS_37.slots.default;
var __VLS_40 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.emtTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.emtTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_45;
var __VLS_46 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_47 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_48 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, emtTree, expandedKeys, flatStats, selectedStats, onSelect, clearByKey,];
        } });
var __VLS_49 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_43;
var __VLS_44;
// @ts-ignore
[];
var __VLS_37;
var __VLS_50 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    label: "Main unit icon",
    defaultOpen: true,
}));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([{
        label: "Main unit icon",
        defaultOpen: true,
    }], __VLS_functionalComponentArgsRest(__VLS_51), false));
var __VLS_55 = __VLS_53.slots.default;
{
    var __VLS_56 = __VLS_53.slots.header;
    var __VLS_57 = IconButton_vue_1.default || IconButton_vue_1.default;
    // @ts-ignore
    var __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57(__assign({ 'onClick': {} }, { title: "Expand all" })));
    var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { title: "Expand all" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
    var __VLS_62 = void 0;
    var __VLS_63 = ({ click: {} },
        { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.expandAllIcons();
                // @ts-ignore
                [expandAllIcons,];
            } });
    var __VLS_64 = __VLS_60.slots.default;
    var __VLS_65 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconExpandAllOutline} */
    vue_mdi_1.IconExpandAllOutline;
    // @ts-ignore
    var __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
    var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_66), false));
    // @ts-ignore
    [];
    var __VLS_60;
    var __VLS_61;
    // @ts-ignore
    [];
}
var __VLS_70 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.iconTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.iconTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_71), false));
var __VLS_75;
var __VLS_76 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_77 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_78 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, expandedKeys, flatStats, selectedStats, onSelect, clearByKey, iconTree,];
        } });
var __VLS_79 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_73;
var __VLS_74;
// @ts-ignore
[];
var __VLS_53;
var __VLS_80 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    label: "Side",
}));
var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([{
        label: "Side",
    }], __VLS_functionalComponentArgsRest(__VLS_81), false));
var __VLS_85 = __VLS_83.slots.default;
var __VLS_86 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.sideTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_88 = __VLS_87.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.sideTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_87), false));
var __VLS_91;
var __VLS_92 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_93 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_94 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, expandedKeys, flatStats, selectedStats, onSelect, clearByKey, sideTree,];
        } });
var __VLS_95 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_89;
var __VLS_90;
// @ts-ignore
[];
var __VLS_83;
var __VLS_96 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    label: "Standard identity",
}));
var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([{
        label: "Standard identity",
    }], __VLS_functionalComponentArgsRest(__VLS_97), false));
var __VLS_101 = __VLS_99.slots.default;
var __VLS_102 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.sidTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.sidTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_103), false));
var __VLS_107;
var __VLS_108 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_109 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_110 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, expandedKeys, flatStats, selectedStats, onSelect, clearByKey, sidTree,];
        } });
var __VLS_111 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_105;
var __VLS_106;
// @ts-ignore
[];
var __VLS_99;
var __VLS_112 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    label: "Status",
}));
var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([{
        label: "Status",
    }], __VLS_functionalComponentArgsRest(__VLS_113), false));
var __VLS_117 = __VLS_115.slots.default;
var __VLS_118 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.statusTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.statusTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_119), false));
var __VLS_123;
var __VLS_124 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_125 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_126 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, expandedKeys, flatStats, selectedStats, onSelect, clearByKey, statusTree,];
        } });
var __VLS_127 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_121;
var __VLS_122;
// @ts-ignore
[];
var __VLS_115;
var __VLS_128 = NewAccordionPanel_vue_1.default || NewAccordionPanel_vue_1.default;
// @ts-ignore
var __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    label: "Symbol modifiers",
}));
var __VLS_130 = __VLS_129.apply(void 0, __spreadArray([{
        label: "Symbol modifiers",
    }], __VLS_functionalComponentArgsRest(__VLS_129), false));
var __VLS_133 = __VLS_131.slots.default;
var __VLS_134 = FilterTree_vue_1.default;
// @ts-ignore
var __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134(__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.modifierTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })));
var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onSelect': {} }, { 'onClear': {} }), { 'onExclude': {} }), { 'onClearExclude': {} }), { tree: (__VLS_ctx.modifierTree), expandedKeys: (__VLS_ctx.expandedKeys), stats: (__VLS_ctx.flatStats), selectedStats: (__VLS_ctx.selectedStats), excludedKeys: (__VLS_ctx.excludedKeys) })], __VLS_functionalComponentArgsRest(__VLS_135), false));
var __VLS_139;
var __VLS_140 = ({ select: {} },
    { onSelect: (__VLS_ctx.onSelect) });
var __VLS_141 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearByKey) });
var __VLS_142 = ({ exclude: {} },
    { onExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.add($event);
            // @ts-ignore
            [excludedKeys, excludedKeys, expandedKeys, flatStats, selectedStats, onSelect, clearByKey, modifierTree,];
        } });
var __VLS_143 = ({ clearExclude: {} },
    { onClearExclude: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.excludedKeys.delete($event);
            // @ts-ignore
            [excludedKeys,];
        } });
var __VLS_137;
var __VLS_138;
// @ts-ignore
[];
var __VLS_131;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
