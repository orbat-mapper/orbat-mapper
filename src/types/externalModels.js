"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reinforcedStatus2SpatialIllusions = void 0;
exports.mapSpatialIllusionsReinforced = mapSpatialIllusionsReinforced;
exports.makeSpatialIllusionsNode = makeSpatialIllusionsNode;
function mapSpatialIllusionsReinforced(reinforced) {
    if (reinforced === "(+)")
        return "Reinforced";
    if (reinforced === "(-)")
        return "Reduced";
    if (reinforced === "(±)")
        return "ReinforcedReduced";
    return "None";
}
exports.reinforcedStatus2SpatialIllusions = {
    Reinforced: "(+)",
    Reduced: "(-)",
    ReinforcedReduced: "(±)",
    None: undefined,
};
function makeSpatialIllusionsNode(options, subOrganizations) {
    if (subOrganizations === void 0) { subOrganizations = []; }
    var node = { options: options };
    if (subOrganizations.length > 0) {
        node.subOrganizations = subOrganizations;
    }
    return node;
}
