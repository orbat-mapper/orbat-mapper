"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapReinforcedStatus2Field = mapReinforcedStatus2Field;
function mapReinforcedStatus2Field(value, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var compact = (_a = options.compact) !== null && _a !== void 0 ? _a : false;
    switch (value) {
        case "Reinforced":
            return compact ? "+" : "(+)";
        case "Reduced":
            return compact ? "-" : "(-)";
        case "ReinforcedReduced":
            return compact ? "±" : "(±)";
        default:
            return "";
    }
}
var exampleData = [
    {
        name: "Kilogram",
        code: "kg",
        type: "weight",
    },
    {
        name: "Liter",
        code: "L",
        type: "volume",
    },
    {
        name: "Each",
        code: "ea",
        type: "quantity",
    },
    {
        name: "Meter",
        code: "m",
        type: "distance",
    },
];
