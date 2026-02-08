"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScenarioMapLayers = useScenarioMapLayers;
exports.getMapLayerIcon = getMapLayerIcon;
exports.addMapLayer = addMapLayer;
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var Group_1 = require("ol/layer/Group");
var GeoImage_1 = require("ol-ext/layer/GeoImage");
var GeoImage_2 = require("ol-ext/source/GeoImage");
var proj_1 = require("ol/proj");
var core_1 = require("@vueuse/core");
var eventKeys_1 = require("@/components/eventKeys");
var extent_1 = require("ol/extent");
var Tile_1 = require("ol/layer/Tile");
var TileJSON_1 = require("ol/source/TileJSON");
var Observable_1 = require("ol/Observable");
var geoConvert_1 = require("@/utils/geoConvert");
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var XYZ_1 = require("ol/source/XYZ");
var geoImageLayerInteraction_1 = require("@/composables/geoImageLayerInteraction");
var Vector_1 = require("ol/source/Vector");
var Vector_2 = require("ol/layer/Vector");
var kmlz_1 = require("@/geo/kmlz");
var fileHandling_1 = require("@/importexport/fileHandling");
var layersMap = new WeakMap();
// Responsible for creating and managing the OpenLayers image layers for the scenario editor
function useScenarioMapLayers(olMap) {
    var scn = (0, utils_1.injectStrict)(injects_1.activeScenarioKey);
    var bus = (0, core_1.useEventBus)(eventKeys_1.imageLayerAction);
    var mapLayersGroup = getOrCreateLayerGroup(olMap);
    var onUndoRedo = scn.store.onUndoRedo;
    var _a = (0, geoImageLayerInteraction_1.useImageLayerTransformInteraction)(olMap, {
        updateHandler: handleTransformUpdate,
    }), startTransform = _a.startTransform, endTransform = _a.endTransform, imageTransformIsActive = _a.isActive;
    function initializeFromStore() {
        mapLayersGroup.getLayers().clear();
        scn.geo.mapLayers.value.forEach(function (mapLayer) { return addLayer(mapLayer.id); });
    }
    function getOlLayerById(layerId) {
        return mapLayersGroup
            .getLayers()
            .getArray()
            .find(function (e) { return e.get("id") === layerId; });
    }
    function addImageLayer(data) {
        var _a, _b, _c;
        var imageCenter = data.imageCenter
            ? (0, proj_1.fromLonLat)(data.imageCenter, olMap.getView().getProjection())
            : olMap.getView().getCenter();
        var newLayer = new GeoImage_1.default({
            name: data.name,
            opacity: (_a = data.opacity) !== null && _a !== void 0 ? _a : 0.7,
            visible: false,
            source: new GeoImage_2.default({
                url: data.url,
                imageCenter: imageCenter,
                imageScale: (_b = data.imageScale) !== null && _b !== void 0 ? _b : [1, 1],
                imageRotate: (_c = data.imageRotate) !== null && _c !== void 0 ? _c : 0,
                attributions: data.attributions,
            }),
            properties: {
                id: data.id,
                title: data.name,
                name: data.name,
            },
        });
        newLayer.getSource().once("change", function () {
            var _a;
            var res = olMap.getView().getResolution() || 1;
            //  scale to resolution of image
            var w = newLayer.getSource().getGeoImage().width;
            if (w === 0)
                return;
            if (!data.imageScale)
                newLayer.getSource().setScale((res * 96 * 10) / w);
            newLayer.setVisible(!((_a = data.isHidden) !== null && _a !== void 0 ? _a : false));
            var layerExtent = newLayer.getExtent();
            scn.geo.updateMapLayer(data.id, {
                imageCenter: (0, proj_1.toLonLat)(newLayer.getSource().getCenter(), olMap.getView().getProjection()),
                imageRotate: newLayer.getSource().getRotation(),
                imageScale: newLayer.getSource().getScale(),
                extent: layerExtent,
            }, { noEmit: true, undoable: false });
            scn.geo.updateMapLayer(data.id, { _status: "initialized", _isNew: false }, { noEmit: true, undoable: false });
        });
        mapLayersGroup.getLayers().push(newLayer);
    }
    function addKMLLayer(data) {
        return __awaiter(this, void 0, void 0, function () {
            var format, source, newLayer;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                if (!data.url) {
                    console.warn("Missing url for tile layer");
                    return [2 /*return*/];
                }
                if (data.url.startsWith("blob:")) {
                    data._isTemporary = true;
                }
                format = new kmlz_1.KMLZ({
                    extractStyles: (_a = data.extractStyles) !== null && _a !== void 0 ? _a : false,
                    showPointNames: (_b = data.showPointNames) !== null && _b !== void 0 ? _b : true,
                    crossOrigin: "anonymous",
                    iconUrlFunction: function (href) {
                        var index = window.location.href.lastIndexOf("/");
                        if (index !== -1) {
                            return fileHandling_1.imageCache.get(href.slice(index + 1)) || href;
                        }
                        return href;
                    },
                });
                source = new Vector_1.default({
                    url: data.url,
                    format: format,
                });
                newLayer = new Vector_2.default({
                    opacity: (_c = data.opacity) !== null && _c !== void 0 ? _c : 0.7,
                    visible: !((_d = data.isHidden) !== null && _d !== void 0 ? _d : false),
                    source: source,
                    properties: {
                        id: data.id,
                        title: data.name,
                        name: data.name,
                    },
                });
                scn.geo.updateMapLayer(data.id, { _status: "initialized" }, { noEmit: true, undoable: false });
                mapLayersGroup.getLayers().push(newLayer);
                (_e = newLayer.getSource()) === null || _e === void 0 ? void 0 : _e.once("featuresloadend", function () {
                    console.log("Loaded KML layer");
                    var layerExtent = (0, geoConvert_1.fixExtent)(source.getExtent());
                    console.log("layerExtent", layerExtent);
                    layerExtent && !(0, extent_1.isEmpty)(layerExtent) && olMap.getView().fit(layerExtent);
                });
                return [2 /*return*/];
            });
        });
    }
    function addTileJSONLayer(data) {
        var _a;
        if (!data.url) {
            console.warn("Missing url for tile layer");
            return;
        }
        var source = new TileJSON_1.default({
            url: data.url,
            crossOrigin: "anonymous",
        });
        var newLayer = new Tile_1.default({
            opacity: (_a = data.opacity) !== null && _a !== void 0 ? _a : 0.7,
            visible: false,
            source: source,
            properties: {
                id: data.id,
                title: data.name,
                name: data.name,
            },
        });
        scn.geo.updateMapLayer(data.id, { _status: "loading" }, { noEmit: true, undoable: false });
        var key = source.on("change", function () {
            var _a;
            if (source.getState() == "ready") {
                (0, Observable_1.unByKey)(key);
                var tileJson = source.getTileJSON();
                var dataUpdate = {};
                if (tileJson === null || tileJson === void 0 ? void 0 : tileJson.bounds) {
                    var extent = (0, geoConvert_1.fixExtent)((0, proj_1.transformExtent)(tileJson.bounds, "EPSG:4326", olMap.getView().getProjection()));
                    if (extent && !(0, extent_1.isEmpty)(extent)) {
                        newLayer.setExtent(extent);
                        dataUpdate.extent = extent;
                    }
                    if (tileJson === null || tileJson === void 0 ? void 0 : tileJson.attribution) {
                        dataUpdate.attributions = tileJson.attribution;
                    }
                    scn.geo.updateMapLayer(data.id, dataUpdate, { noEmit: true, undoable: false });
                    scn.geo.updateMapLayer(data.id, { _status: "initialized", _isNew: false }, { noEmit: true, undoable: false });
                }
                newLayer.setVisible(!((_a = data.isHidden) !== null && _a !== void 0 ? _a : false));
            }
            else if (source.getState() == "error") {
                (0, Observable_1.unByKey)(key);
                scn.geo.updateMapLayer(data.id, { _status: "error" }, { noEmit: true, undoable: false });
                mapLayersGroup.getLayers().remove(newLayer);
            }
        });
        mapLayersGroup.getLayers().push(newLayer);
    }
    function addXYZLayer(data) {
        var _a, _b;
        if (!data.url) {
            console.warn("Missing url for tile layer");
            return;
        }
        var source = new XYZ_1.default({
            url: data.url,
            attributions: data.attributions,
        });
        var newLayer = new Tile_1.default({
            opacity: (_a = data.opacity) !== null && _a !== void 0 ? _a : 0.7,
            visible: !((_b = data.isHidden) !== null && _b !== void 0 ? _b : false),
            source: source,
            properties: {
                id: data.id,
                title: data.name,
                name: data.name,
            },
        });
        scn.geo.updateMapLayer(data.id, { _status: "initialized" }, { noEmit: true, undoable: false });
        mapLayersGroup.getLayers().push(newLayer);
    }
    function deleteLayer(layerId) {
        var _a, _b, _c;
        var layer = getOlLayerById(layerId);
        if (layer) {
            // @ts-ignore
            (_c = (_a = layer.getSource) === null || _a === void 0 ? void 0 : (_b = _a.call(layer)).clear) === null || _c === void 0 ? void 0 : _c.call(_b);
            mapLayersGroup.getLayers().remove(layer);
        }
    }
    function addLayer(layerId) {
        var mapLayer = scn.geo.getMapLayerById(layerId);
        if (mapLayer.type === "ImageLayer")
            addImageLayer(mapLayer);
        if (mapLayer.type === "TileJSONLayer")
            addTileJSONLayer(mapLayer);
        if (mapLayer.type === "XYZLayer")
            addXYZLayer(mapLayer);
        if (mapLayer.type === "KMLLayer")
            addKMLLayer(mapLayer);
    }
    function updateLayer(layerId, data) {
        var mapLayer = scn.geo.getMapLayerById(layerId);
        var layer = getOlLayerById(layerId);
        if (!layer) {
            addLayer(layerId);
            return;
        }
        if (data.isHidden !== undefined) {
            layer.setVisible(!data.isHidden);
        }
        if (data.opacity !== undefined) {
            layer.setOpacity(data.opacity);
        }
        if (mapLayer.type === "TileJSONLayer" ||
            mapLayer.type === "XYZLayer" ||
            mapLayer.type === "ImageLayer") {
            if ("url" in data && data.url !== undefined) {
                deleteLayer(layerId);
                addLayer(layerId);
                if (imageTransformIsActive.value)
                    startTransform(layer, layerId);
            }
        }
        if (mapLayer.type === "ImageLayer") {
            var d = data;
            if (d.imageCenter !== undefined) {
                layer.getSource().setCenter((0, proj_1.fromLonLat)(d.imageCenter));
            }
            if (d.imageScale !== undefined) {
                layer.getSource().setScale(d.imageScale);
            }
            if (d.imageRotate !== undefined) {
                layer.getSource().setRotation(d.imageRotate);
            }
            if (d.attributions !== undefined) {
                layer.getSource().setAttributions(d.attributions);
            }
        }
    }
    function moveLayer(layerId) {
        var layer = getOlLayerById(layerId);
        var newIndex = scn.geo.getMapLayerIndex(layerId);
        if (layer) {
            mapLayersGroup.getLayers().remove(layer);
            mapLayersGroup.getLayers().insertAt(newIndex, layer);
        }
    }
    scn.geo.onMapLayerEvent(function (event) {
        if (event.type === "add") {
            addLayer(event.id);
        }
        else if (event.type === "remove") {
            deleteLayer(event.id);
        }
        else if (event.type === "update") {
            updateLayer(event.id, event.data);
        }
        else if (event.type === "move") {
            moveLayer(event.id);
        }
    });
    bus.on(function (_a) {
        var _b, _c, _d, _e;
        var action = _a.action, id = _a.id;
        var olLayer = getOlLayerById(id);
        if (!olLayer)
            return;
        if (action === "zoom") {
            // @ts-ignore
            var layerExtent = olLayer.getExtent() || ((_c = (_b = olLayer.getSource()) === null || _b === void 0 ? void 0 : _b.getExtent) === null || _c === void 0 ? void 0 : _c.call(_b));
            if (!layerExtent) {
                // @ts-ignore
                layerExtent = (_e = (_d = olLayer.getSource()) === null || _d === void 0 ? void 0 : _d.getTileGrid) === null || _e === void 0 ? void 0 : _e.call(_d).getExtent();
            }
            layerExtent = (0, geoConvert_1.fixExtent)(layerExtent);
            layerExtent && !(0, extent_1.isEmpty)(layerExtent) && olMap.getView().fit(layerExtent);
        }
        else if (action === "startTransform") {
            startTransform(olLayer, id);
        }
        else if (action === "endTransform") {
            endTransform();
        }
    });
    function handleTransformUpdate(v) {
        var id = v.id, rotation = v.rotation, center = v.center, scale = v.scale, active = v.active;
        scn.geo.updateMapLayer(id, { imageRotate: rotation, imageCenter: (0, proj_1.toLonLat)(center), imageScale: scale }, { emitOnly: active, undoable: !active });
    }
    onUndoRedo(function (_a) {
        var action = _a.action, meta = _a.meta;
        if (!meta ||
            !["addMapLayer", "updateMapLayer", "deleteMapLayer", "moveMapLayer"].includes(meta.label))
            return;
        var label = meta.label, layerId = meta.value;
        if (label === "addMapLayer") {
            if (action === "undo") {
                if (imageTransformIsActive.value)
                    endTransform();
                deleteLayer(layerId);
            }
            else {
                addLayer(layerId);
            }
        }
        else if (label === "deleteMapLayer") {
            if (action === "undo") {
                addLayer(layerId);
            }
            else {
                if (imageTransformIsActive.value)
                    endTransform();
                deleteLayer(layerId);
            }
        }
        else if (label === "updateMapLayer") {
            var data = scn.geo.getMapLayerById(layerId);
            updateLayer(layerId, data);
            if (imageTransformIsActive.value) {
                var olLayer = getOlLayerById(layerId);
                startTransform(olLayer, layerId);
            }
        }
        else if (label === "moveMapLayer") {
            moveLayer(layerId);
        }
    });
    return { initializeFromStore: initializeFromStore };
}
function getOrCreateLayerGroup(olMap) {
    if (layersMap.has(olMap))
        return layersMap.get(olMap);
    var layerGroup = new Group_1.default({
        properties: { id: (0, utils_1.nanoid)(), title: "Map layers" },
    });
    layersMap.set(olMap, layerGroup);
    olMap.addLayer(layerGroup);
    return layerGroup;
}
function getMapLayerIcon(mapLayer) {
    if (mapLayer.type === "ImageLayer")
        return vue_mdi_1.IconImage;
    if (mapLayer.type === "KMLLayer")
        return vue_mdi_1.IconVectorSquare;
    if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer")
        return vue_mdi_1.IconWebBox;
    return vue_mdi_1.IconImage;
}
function addMapLayer(layerType, geo) {
    var newLayer;
    if (layerType === "TileJSONLayer") {
        newLayer = geo.addMapLayer({
            id: (0, utils_1.nanoid)(),
            type: "TileJSONLayer",
            name: "New TileJSON map layer",
            url: "",
            _status: "uninitialized",
            _isNew: true,
        });
    }
    else if (layerType === "XYZLayer") {
        newLayer = geo.addMapLayer({
            id: (0, utils_1.nanoid)(),
            type: "XYZLayer",
            name: "New XYZ map layer",
            url: "",
            _status: "uninitialized",
            _isNew: true,
        });
    }
    else if (layerType === "ImageLayer") {
        newLayer = geo.addMapLayer({
            id: (0, utils_1.nanoid)(),
            type: "ImageLayer",
            name: "New image layer",
            url: "",
            attributions: "",
            _status: "uninitialized",
            _isNew: true,
        });
    }
    else {
        throw new Error("Unknown layer type ".concat(layerType));
    }
    return newLayer;
}
