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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var Map_1 = require("ol/Map");
var control_1 = require("ol/control");
var View_1 = require("ol/View");
require("ol/ol.css");
var proj_1 = require("ol/proj");
var openlayersHelpers_1 = require("@/composables/openlayersHelpers");
var baseLayers_1 = require("@/geo/baseLayers");
var baseLayersStore_1 = require("@/stores/baseLayersStore");
var props = withDefaults(defineProps(), {
    center: function () { return [30, 60]; },
    zoom: 5,
    baseLayerName: "osm",
});
var emit = defineEmits(["ready", "moveend"]);
var mapRoot = (0, vue_1.ref)();
var olMap;
var baseLayersStore = (0, baseLayersStore_1.useBaseLayersStore)();
var moveendHandler = function (evt) {
    emit("moveend", { view: evt.map.getView() });
};
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var view, layers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                view = new View_1.default({
                    zoom: props.zoom,
                    center: (0, proj_1.fromLonLat)(props.center),
                    showFullExtent: true,
                });
                olMap = new Map_1.default({
                    target: mapRoot.value,
                    maxTilesLoading: 200,
                    layers: [],
                    view: view,
                    controls: (0, control_1.defaults)({
                        attributionOptions: {
                            collapsible: true,
                        },
                    }),
                });
                return [4 /*yield*/, baseLayersStore.initialize()];
            case 1:
                _a.sent();
                // Set initial active layer from props if provided and valid, otherwise keep store default
                if (props.baseLayerName &&
                    baseLayersStore.layers.some(function (l) { return l.name === props.baseLayerName; })) {
                    baseLayersStore.selectLayer(props.baseLayerName);
                }
                layers = (0, baseLayers_1.createBaseLayerInstances)(baseLayersStore.layers, view);
                layers.forEach(function (layer) {
                    olMap.addLayer(layer);
                    var storeLayer = baseLayersStore.layers.find(function (l) { return l.name === layer.get("name"); });
                    if (storeLayer) {
                        layer.setOpacity(storeLayer.opacity);
                    }
                });
                // Sync visibility with store
                (0, vue_1.watch)(function () { return baseLayersStore.activeLayerName; }, function (name) {
                    layers.forEach(function (l) {
                        l.setVisible(l.get("name") === name);
                    });
                }, { immediate: true });
                // Sync opacity with store
                (0, vue_1.watch)(function () { return baseLayersStore.layers; }, function (newLayers) {
                    newLayers.forEach(function (l) {
                        var layer = layers.find(function (olLayer) { return olLayer.get("name") === l.name; });
                        if (layer) {
                            layer.setOpacity(l.opacity);
                        }
                    });
                }, { deep: true });
                (0, openlayersHelpers_1.useOlEvent)(olMap.on("moveend", moveendHandler));
                emit("ready", olMap);
                return [2 /*return*/];
        }
    });
}); });
(0, vue_1.onUnmounted)(function () {
    olMap.setTarget(undefined);
});
var __VLS_defaults = {
    center: function () { return [30, 60]; },
    zoom: 5,
    baseLayerName: "osm",
};
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ ref: "mapRoot" }, { class: "h-full w-full" }));
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    emits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
exports.default = {};
