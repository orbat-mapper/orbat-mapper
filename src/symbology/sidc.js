"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_SYMBOL_SID_INDEX = exports.ORBAT_MAPPER_ORIGINATOR = exports.SID_INDEX = exports.Sidc = void 0;
exports.parseExtendedSidc = parseExtendedSidc;
var constants_ts_1 = require("@/config/constants.ts");
var Sidc = /** @class */ (function () {
    function Sidc(sic) {
        if (sic === void 0) { sic = "10000000000000000000"; }
        this.sic = sic;
        this.version = sic.substring(0, 2) || "10";
        this.context = sic.substring(2, 3) || "0";
        this.standardIdentity = sic.substring(3, 4) || "0";
        this.symbolSet = sic.substring(4, 6) || "10";
        this.status = sic.substring(6, 7) || "0";
        this.hqtfd = sic.substring(7, 8) || "0";
        this.amplifier = sic.substring(8, 9) || "0";
        this.amplifierDescriptor = sic.substring(9, 10) || "0";
        this.entity = sic.substring(10, 12) || "00";
        this.entityType = sic.substring(12, 14) || "00";
        this.entitySubType = sic.substring(14, 16) || "00";
        this.modifierOne = sic.substring(16, 18) || "00";
        this.modifierTwo = sic.substring(18, 20) || "00";
    }
    Object.defineProperty(Sidc.prototype, "emt", {
        get: function () {
            return this.amplifier + this.amplifierDescriptor;
        },
        set: function (value) {
            this.amplifier = value[0];
            this.amplifierDescriptor = value[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sidc.prototype, "mainIcon", {
        get: function () {
            return this.entity + this.entityType + this.entitySubType;
        },
        set: function (value) {
            this.entity = value.substring(0, 2);
            this.entityType = value.substring(2, 4);
            this.entitySubType = value.substring(4, 6);
        },
        enumerable: false,
        configurable: true
    });
    Sidc.prototype.toString = function () {
        return (this.version +
            this.context +
            this.standardIdentity +
            this.symbolSet +
            this.status +
            this.hqtfd +
            this.amplifier +
            this.amplifierDescriptor +
            this.entity +
            this.entityType +
            this.entitySubType +
            this.modifierOne +
            this.modifierTwo);
    };
    return Sidc;
}());
exports.Sidc = Sidc;
exports.SID_INDEX = 3;
exports.ORBAT_MAPPER_ORIGINATOR = "987";
exports.CUSTOM_SYMBOL_SID_INDEX = constants_ts_1.CUSTOM_SYMBOL_PREFIX.length + exports.SID_INDEX;
function parseExtendedSidc(sidc) {
    var originatorIdentifier = sidc.substring(20, 23);
    var originatorSymbolSet = sidc.substring(23, 24);
    var data = sidc.substring(24);
    return { originatorIdentifier: originatorIdentifier, originatorSymbolSet: originatorSymbolSet, data: data };
}
