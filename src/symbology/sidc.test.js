"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var sidc_1 = require("@/symbology/sidc");
(0, vitest_1.describe)("Parse SIDC", function () {
    var testSidc = "11223344556677889900";
    var sidc = "100310001312110046009001234567";
    (0, vitest_1.it)("parses sidc", function () {
        var s = new sidc_1.Sidc(testSidc);
        (0, vitest_1.expect)(s.version).toBe("11");
        (0, vitest_1.expect)(s.context).toBe("2");
        (0, vitest_1.expect)(s.standardIdentity).toBe("2");
        (0, vitest_1.expect)(s.symbolSet).toBe("33");
        (0, vitest_1.expect)(s.status).toBe("4");
        (0, vitest_1.expect)(s.hqtfd).toBe("4");
        (0, vitest_1.expect)(s.amplifier).toBe("5");
        (0, vitest_1.expect)(s.amplifierDescriptor).toBe("5");
        (0, vitest_1.expect)(s.entity).toBe("66");
        (0, vitest_1.expect)(s.entityType).toBe("77");
        (0, vitest_1.expect)(s.entitySubType).toBe("88");
        (0, vitest_1.expect)(s.modifierOne).toBe("99");
        (0, vitest_1.expect)(s.modifierTwo).toBe("00");
    });
    (0, vitest_1.it)("parses extended sidc", function () {
        var _a = (0, sidc_1.parseExtendedSidc)(sidc), originatorIdentifier = _a.originatorIdentifier, originatorSymbolSet = _a.originatorSymbolSet, data = _a.data;
        (0, vitest_1.expect)(originatorIdentifier).toBe("900");
        (0, vitest_1.expect)(originatorSymbolSet).toBe("1");
        (0, vitest_1.expect)(data).toBe("234567");
    });
    (0, vitest_1.it)("gets main icon", function () {
        var s = new sidc_1.Sidc(testSidc);
        (0, vitest_1.expect)(s.mainIcon).toBe("667788");
    });
    (0, vitest_1.it)("sets main icon", function () {
        var s = new sidc_1.Sidc(testSidc);
        s.mainIcon = "123456";
        (0, vitest_1.expect)(s.entity).toBe("12");
        (0, vitest_1.expect)(s.entityType).toBe("34");
        (0, vitest_1.expect)(s.entitySubType).toBe("56");
        (0, vitest_1.expect)(s.mainIcon).toBe("123456");
    });
});
