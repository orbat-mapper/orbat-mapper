"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMapLayerInfo = useMapLayerInfo;
var vue_1 = require("vue");
var layerTypeLabelMap = {
    XYZLayer: "XYZ layer",
    ImageLayer: "Image layer",
    TileJSONLayer: "TileJSON layer",
    KMLLayer: "KML layer",
};
function useMapLayerInfo(layer) {
    var isInitialized = (0, vue_1.computed)(function () { return layer._status === "initialized"; });
    var status = (0, vue_1.computed)(function () { return layer._status; });
    var layerTypeLabel = (0, vue_1.computed)(function () { return layerTypeLabelMap[layer.type] || layer.type; });
    return { isInitialized: isInitialized, status: status, layerTypeLabel: layerTypeLabel };
}
