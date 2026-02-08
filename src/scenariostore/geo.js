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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGeo = useGeo;
var vue_1 = require("vue");
var klona_1 = require("klona");
var utils_1 = require("@/utils");
var core_1 = require("@vueuse/core");
function createInitialFeatureState(feature) {
    return {
        t: Number.MIN_SAFE_INTEGER,
        geometry: feature.geometry,
    };
}
function useGeo(store) {
    var state = store.state, update = store.update;
    var mapLayerEvent = (0, core_1.createEventHook)();
    var featureLayerEvent = (0, core_1.createEventHook)();
    var hiddenGroups = (0, vue_1.computed)(function () {
        return new Set(Object.values(state.sideGroupMap)
            .filter(function (group) { var _a; return !!(group.isHidden || ((_a = state.sideMap[group._pid]) === null || _a === void 0 ? void 0 : _a.isHidden)); })
            .map(function (group) { return group.id; }));
    });
    var hiddenSides = (0, vue_1.computed)(function () {
        return new Set(Object.values(state.sideMap)
            .filter(function (side) { return !!side.isHidden; })
            .map(function (side) { return side.id; }));
    });
    var everyVisibleUnit = (0, vue_1.computed)(function () {
        return Object.values(state.unitMap).filter(function (unit) {
            var _a;
            return !(unit._gid
                ? hiddenGroups.value.has(unit._gid)
                : hiddenSides.value.has(unit._sid)) && ((_a = unit._state) === null || _a === void 0 ? void 0 : _a.location);
        });
    });
    function addUnitPosition(unitId, coordinates, atTime) {
        var newState = null;
        update(function (s) {
            var u = s.unitMap[unitId];
            var t = atTime !== null && atTime !== void 0 ? atTime : s.currentTime;
            newState = { t: t, location: coordinates };
            if (t === s.currentTime)
                u._state = newState;
            if (!u.state)
                u.state = [];
            for (var i = 0, len = u.state.length; i < len; i++) {
                if (t < u.state[i].t) {
                    u.state.splice(i, 0, __assign({ id: (0, utils_1.nanoid)() }, newState));
                    return;
                }
                else if (t === u.state[i].t) {
                    u.state[i] = __assign(__assign({}, u.state[i]), newState);
                    return;
                }
            }
            u.state.push(__assign({ id: (0, utils_1.nanoid)() }, newState));
        }, { label: "addUnitPosition", value: unitId });
        store.state.unitStateCounter++;
    }
    function addFeatureStateGeometry(featureId, geometry, atTime) {
        var newState = null;
        update(function (s) {
            var u = s.featureMap[featureId];
            var t = atTime !== null && atTime !== void 0 ? atTime : s.currentTime;
            newState = { t: t, geometry: geometry };
            if (t === s.currentTime)
                u._state = newState;
            if (!u.state)
                u.state = [];
            for (var i = 0, len = u.state.length; i < len; i++) {
                if (t < u.state[i].t) {
                    u.state.splice(i, 0, __assign({ id: (0, utils_1.nanoid)() }, newState));
                    return;
                }
                else if (t === u.state[i].t) {
                    u.state[i] = __assign(__assign({}, u.state[i]), newState);
                    return;
                }
            }
            u.state.push(__assign({ id: (0, utils_1.nanoid)() }, newState));
        }, { label: "updateFeatureState", value: featureId });
        updateFeatureState(featureId);
    }
    function addLayer(data) {
        var newLayer = (0, klona_1.klona)(__assign(__assign({}, data), { _isNew: true }));
        if (!newLayer.id)
            newLayer.id = (0, utils_1.nanoid)();
        newLayer._isNew = true;
        newLayer._isOpen = true;
        update(function (s) {
            s.layers.push(newLayer.id);
            s.layerMap[newLayer.id] = newLayer;
        }, { label: "addLayer", value: newLayer.id });
        featureLayerEvent
            .trigger({ type: "addLayer", id: newLayer.id, data: newLayer })
            .then();
        return state.layerMap[newLayer.id];
    }
    function addMapLayer(data) {
        var newLayer = (0, klona_1.klona)(__assign(__assign({ opacity: 0.7 }, data), { _isNew: true, _isTemporary: data.url.startsWith("blob:") }));
        if (!newLayer.id)
            newLayer.id = (0, utils_1.nanoid)();
        update(function (s) {
            s.mapLayers.push(newLayer.id);
            s.mapLayerMap[newLayer.id] = newLayer;
        }, { label: "addMapLayer", value: newLayer.id });
        mapLayerEvent.trigger({ type: "add", id: newLayer.id, data: newLayer }).then();
        return state.mapLayerMap[newLayer.id];
    }
    function moveLayer(layerId, toIndex) {
        var fromIndex = state.layers.indexOf(layerId);
        update(function (s) {
            (0, utils_1.moveItemMutable)(s.layers, fromIndex, toIndex);
        }, { label: "moveLayer", value: layerId });
        featureLayerEvent.trigger({ type: "moveLayer", id: layerId }).then();
    }
    function moveMapLayer(layerId, options) {
        var _a;
        var fromIndex = state.mapLayers.indexOf(layerId);
        var toIndex = (_a = options.toIndex) !== null && _a !== void 0 ? _a : (options.direction === "up" ? fromIndex - 1 : fromIndex + 1);
        update(function (s) {
            (0, utils_1.moveItemMutable)(s.mapLayers, fromIndex, toIndex);
        }, { label: "moveMapLayer", value: layerId });
        mapLayerEvent.trigger({ type: "move", id: layerId, index: toIndex }).then();
    }
    function moveFeature(featureId, toIndex) {
        var feature = state.featureMap[featureId];
        update(function (s) {
            var layer = s.layerMap[feature._pid];
            var fromIndex = layer.features.indexOf(featureId);
            (0, utils_1.moveItemMutable)(layer.features, fromIndex, toIndex);
            layer.features.forEach(function (fid, i) {
                var feature = s.featureMap[fid];
                if (feature.meta._zIndex !== i)
                    feature.meta._zIndex = i;
            });
        }, { label: "moveFeature", value: featureId });
        featureLayerEvent.trigger({ type: "moveFeature", id: featureId }).then();
    }
    function reorderFeature(featureId, destinationFeatureOrLayerId, target) {
        var _a;
        var feature = state.featureMap[featureId];
        var destinationFeature = state.featureMap[destinationFeatureOrLayerId];
        var destinationLayerId = (_a = destinationFeature === null || destinationFeature === void 0 ? void 0 : destinationFeature._pid) !== null && _a !== void 0 ? _a : destinationFeatureOrLayerId;
        if (!feature)
            return;
        var layer = state.layerMap[feature._pid];
        var destinationLayer = state.layerMap[destinationLayerId];
        if (!layer || !destinationLayer)
            return;
        var toIndex = destinationLayer.features.indexOf(destinationFeatureOrLayerId);
        if (layer.id === destinationLayer.id) {
            var fromIndex = layer.features.indexOf(featureId);
            var newIndex = toIndex;
            if (target === "above")
                newIndex = toIndex;
            else if (target === "below")
                newIndex = toIndex + 1;
            if (fromIndex < toIndex)
                newIndex--;
            moveFeature(featureId, newIndex);
        }
        else {
            update(function (s) {
                var fromLayer = s.layerMap[feature._pid];
                var toLayer = s.layerMap[destinationLayerId];
                var f = s.featureMap[featureId];
                (0, utils_1.removeElement)(featureId, fromLayer.features);
                var newIndex = toIndex;
                if (target === "above")
                    newIndex = toIndex;
                else if (target === "below")
                    newIndex = toIndex + 1;
                if (toIndex >= 0) {
                    toLayer.features.splice(newIndex, 0, featureId);
                }
                else {
                    toLayer.features.push(featureId);
                }
                f._pid = toLayer.id;
            }, { label: "moveFeature", value: featureId });
            featureLayerEvent
                .trigger({
                type: "moveFeature",
                id: featureId,
                fromLayer: layer.id,
                toLayer: destinationLayerId,
            })
                .then();
        }
    }
    function getFullLayer(layerId) {
        var layer = state.layerMap[layerId];
        if (!layer)
            return;
        return __assign(__assign({}, layer), { features: layer.features.map(function (f) { return (0, klona_1.klona)(state.featureMap[f]); }) });
    }
    var layers = (0, vue_1.computed)(function () {
        return state.layers
            .map(function (layerId) { return state.layerMap[layerId]; })
            .map(function (layer) { return (__assign(__assign({}, layer), { features: layer.features.map(function (featureId) { return state.featureMap[featureId]; }) })); });
    });
    var mapLayers = (0, vue_1.computed)(function () {
        return state.mapLayers.map(function (layerId) { return state.mapLayerMap[layerId]; });
    });
    var layersFeatures = (0, vue_1.computed)(function () {
        return state.layers
            .map(function (layerId) { return state.layerMap[layerId]; })
            .map(function (layer) { return ({
            layer: layer,
            features: layer.features.map(function (featureId) { return state.featureMap[featureId]; }),
        }); });
    });
    function updateLayer(layerId, data, options) {
        var _a, _b, _c;
        if (options === void 0) { options = {}; }
        var undoable = (_a = options.undoable) !== null && _a !== void 0 ? _a : true;
        var noEmit = (_b = options.noEmit) !== null && _b !== void 0 ? _b : false;
        var emitOnly = (_c = options.emitOnly) !== null && _c !== void 0 ? _c : false;
        if (undoable) {
            update(function (s) {
                var layer = s.layerMap[layerId];
                Object.assign(layer, data);
            }, { label: "updateLayer", value: layerId });
        }
        else {
            var layer = state.layerMap[layerId];
            Object.assign(layer, data);
        }
        if (noEmit)
            return;
        featureLayerEvent.trigger({ type: "updateLayer", id: layerId, data: data }).then();
    }
    function updateMapLayer(layerId, data, options) {
        var _a, _b, _c;
        if (options === void 0) { options = {}; }
        var undoable = (_a = options.undoable) !== null && _a !== void 0 ? _a : true;
        var noEmit = (_b = options.noEmit) !== null && _b !== void 0 ? _b : false;
        var emitOnly = (_c = options.emitOnly) !== null && _c !== void 0 ? _c : false;
        if (undoable) {
            update(function (s) {
                var layer = s.mapLayerMap[layerId];
                Object.assign(layer, data);
            }, { label: "updateMapLayer", value: layerId });
        }
        else if (!emitOnly) {
            var layer = state.mapLayerMap[layerId];
            Object.assign(layer, data);
        }
        if (noEmit)
            return;
        mapLayerEvent.trigger({ type: "update", id: layerId, data: data });
    }
    function deleteLayer(layerId, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var noEmit = (_a = options.noEmit) !== null && _a !== void 0 ? _a : false;
        update(function (s) {
            var layer = s.layerMap[layerId];
            if (!layer)
                return;
            layer.features.forEach(function (featureId) { return delete s.featureMap[featureId]; });
            delete s.layerMap[layerId];
            (0, utils_1.removeElement)(layerId, s.layers);
        }, { label: "deleteLayer", value: layerId });
        if (noEmit)
            return;
        featureLayerEvent.trigger({ type: "removeLayer", id: layerId });
    }
    function deleteMapLayer(layerId, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var noEmit = (_a = options.noEmit) !== null && _a !== void 0 ? _a : false;
        update(function (s) {
            var layer = s.mapLayerMap[layerId];
            if (!layer)
                return;
            delete s.mapLayerMap[layerId];
            (0, utils_1.removeElement)(layerId, s.mapLayers);
        }, { label: "deleteMapLayer", value: layerId });
        if (noEmit)
            return;
        mapLayerEvent.trigger({ type: "remove", id: layerId, data: {} });
    }
    function addFeature(data, layerId, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var noEmit = (_a = options.noEmit) !== null && _a !== void 0 ? _a : false;
        var newFeature = (0, klona_1.klona)(data);
        if (!newFeature.id)
            newFeature.id = (0, utils_1.nanoid)();
        newFeature._pid = layerId;
        update(function (s) {
            var layer = s.layerMap[layerId];
            if (!layer)
                return;
            s.featureMap[newFeature.id] = newFeature;
            layer.features.push(newFeature.id);
        }, { label: "addFeature", value: newFeature.id });
        store.state.featureStateCounter++;
        if (!noEmit) {
            featureLayerEvent
                .trigger({ type: "addFeature", id: newFeature.id, data: newFeature })
                .then();
        }
        return newFeature.id;
    }
    function deleteFeature(featureId, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var noEmit = (_a = options.noEmit) !== null && _a !== void 0 ? _a : false;
        var feature = state.featureMap[featureId];
        if (!feature)
            return;
        update(function (s) {
            var layer = s.layerMap[feature._pid];
            delete s.featureMap[featureId];
            (0, utils_1.removeElement)(featureId, layer.features);
        }, { label: "deleteFeature", value: featureId });
        if (noEmit)
            return;
        featureLayerEvent.trigger({ type: "deleteFeature", id: featureId }).then();
    }
    function duplicateFeature(featureId) {
        var feature = state.featureMap[featureId];
        if (!feature)
            return;
        var shallowCopy = __assign({}, feature);
        shallowCopy.id = (0, utils_1.nanoid)();
        return addFeature(shallowCopy, feature._pid);
    }
    function updateFeature(featureId, data, options) {
        var _a, _b;
        if (options === void 0) { options = {}; }
        var undoable = (_a = options.undoable) !== null && _a !== void 0 ? _a : true;
        var noEmit = (_b = options.noEmit) !== null && _b !== void 0 ? _b : false;
        var isGeometry = data.geometry !== undefined;
        if (undoable) {
            update(function (s) {
                var feature = s.featureMap[featureId];
                if (!feature)
                    return;
                var _a = data.properties, properties = _a === void 0 ? {} : _a, geometry = data.geometry, media = data.media, _b = data.style, style = _b === void 0 ? {} : _b, _c = data.meta, meta = _c === void 0 ? {} : _c, state = data.state;
                Object.assign(feature.style, style);
                Object.assign(feature.meta, meta);
                feature.properties
                    ? Object.assign(feature.properties, properties)
                    : (feature.properties = properties);
                Object.assign(feature.geometry, geometry);
                if (state)
                    feature.state = state;
                if (media)
                    feature.media = media;
                // if (data._hidden !== undefined) feature._hidden = data._hidden;
                var visibleFromT = feature.meta.visibleFromT || Number.MIN_SAFE_INTEGER;
                var visibleUntilT = feature.meta.visibleUntilT || Number.MAX_SAFE_INTEGER;
                var timeHidden = s.currentTime <= visibleFromT || s.currentTime >= visibleUntilT;
                feature._hidden = timeHidden || feature.meta.isHidden;
            }, {
                label: isGeometry ? "updateFeatureGeometry" : "updateFeature",
                value: featureId,
            });
        }
        else {
            var layer = state.featureMap[featureId];
            Object.assign(layer, data);
        }
        if (data.state) {
            updateFeatureState(featureId);
        }
        if (noEmit)
            return;
        featureLayerEvent.trigger({ type: "updateFeature", id: featureId, data: data }).then();
        if (isGeometry) {
            featureLayerEvent.trigger({ type: "moveFeature", id: featureId }).then();
        }
    }
    function deleteFeatureStateEntry(featureId, index) {
        update(function (s) {
            var _a;
            var _feature = s.featureMap[featureId];
            if (!_feature)
                return;
            (_a = _feature.state) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        });
        updateFeatureState(featureId);
    }
    function updateFeatureState(featureId, undoable) {
        if (undoable === void 0) { undoable = false; }
        var feature = state.featureMap[featureId];
        if (!feature)
            return;
        var timestamp = state.currentTime;
        if (!feature.state || !feature.state.length) {
            store.state.featureStateCounter++;
            feature._state = undefined;
            return;
        }
        var currentState = createInitialFeatureState(feature);
        for (var _i = 0, _a = feature.state; _i < _a.length; _i++) {
            var s = _a[_i];
            if (s.t <= timestamp) {
                currentState = __assign(__assign({}, currentState), s);
            }
            else {
                break;
            }
        }
        feature._state = currentState;
        store.state.featureStateCounter++;
    }
    var itemsInfo = (0, vue_1.computed)(function () {
        var items = [];
        layers.value.forEach(function (layer) {
            items.push({ id: layer.id, type: "layer", name: layer.name });
            var mappedFeatures = layer.features.map(function (feature) {
                var meta = feature.meta, id = feature.id;
                return {
                    id: id,
                    type: meta.type,
                    name: meta.name || "",
                    description: meta.description,
                    _pid: layer.id,
                };
            });
            items.push.apply(items, mappedFeatures);
        });
        return items;
    });
    return {
        everyVisibleUnit: everyVisibleUnit,
        addUnitPosition: addUnitPosition,
        addLayer: addLayer,
        getLayerById: function (id) { return state.layerMap[id]; },
        getFullLayer: getFullLayer,
        getFeatureById: function (id) {
            var feature = state.featureMap[id];
            if (!feature)
                return { feature: feature, layer: undefined };
            return { feature: feature, layer: state.layerMap[feature._pid] };
        },
        moveFeature: moveFeature,
        updateLayer: updateLayer,
        deleteLayer: deleteLayer,
        getLayerIndex: function (id) { return state.layers.indexOf(id); },
        moveLayer: moveLayer,
        addFeature: addFeature,
        duplicateFeature: duplicateFeature,
        deleteFeature: deleteFeature,
        updateFeature: updateFeature,
        deleteFeatureStateEntry: deleteFeatureStateEntry,
        itemsInfo: itemsInfo,
        layers: layers,
        layersFeatures: layersFeatures,
        mapLayers: mapLayers,
        addMapLayer: addMapLayer,
        deleteMapLayer: deleteMapLayer,
        updateMapLayer: updateMapLayer,
        getMapLayerById: function (id) { return state.mapLayerMap[id]; },
        getMapLayerIndex: function (id) { return state.mapLayers.indexOf(id); },
        onMapLayerEvent: mapLayerEvent.on,
        onFeatureLayerEvent: featureLayerEvent.on,
        moveMapLayer: moveMapLayer,
        reorderFeature: reorderFeature,
        addFeatureStateGeometry: addFeatureStateGeometry,
    };
}
