"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchActions = useSearchActions;
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
function useSearchActions() {
    var _a = (0, utils_1.injectStrict)(injects_1.searchActionsKey), onUnitSelectHook = _a.onUnitSelectHook, onFeatureSelectHook = _a.onFeatureSelectHook, onLayerSelectHook = _a.onLayerSelectHook, onImageLayerSelectHook = _a.onImageLayerSelectHook, onEventSelectHook = _a.onEventSelectHook, onPlaceSelectHook = _a.onPlaceSelectHook, onScenarioActionHook = _a.onScenarioActionHook;
    return {
        onUnitSelect: onUnitSelectHook.on,
        onFeatureSelect: onFeatureSelectHook.on,
        onLayerSelect: onLayerSelectHook.on,
        onImageLayerSelect: onImageLayerSelectHook.on,
        onEventSelect: onEventSelectHook.on,
        onPlaceSelect: onPlaceSelectHook.on,
        onScenarioAction: onScenarioActionHook.on,
    };
}
