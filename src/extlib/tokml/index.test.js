"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var index_1 = require("./index");
(0, vitest_1.describe)("foldersToKML", function () {
    (0, vitest_1.it)("should generate basic KML structure", function () {
        var root = { type: "root", children: [] };
        var kml = (0, index_1.foldersToKML)(root);
        (0, vitest_1.expect)(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
        (0, vitest_1.expect)(kml).toContain("<Document");
    });
    (0, vitest_1.it)("should include radioFolder style when requested", function () {
        var root = { type: "root", children: [] };
        var kml = (0, index_1.foldersToKML)(root, [], { listStyle: "radioFolder" });
        (0, vitest_1.expect)(kml).toContain('<Style id="radioFolder">');
        (0, vitest_1.expect)(kml).toContain("<ListStyle>");
        (0, vitest_1.expect)(kml).toContain("<listItemType>radioFolder</listItemType>");
        (0, vitest_1.expect)(kml).toContain("</ListStyle>");
        (0, vitest_1.expect)(kml).toContain("</Style>");
        (0, vitest_1.expect)(kml).toContain("<styleUrl>#radioFolder</styleUrl>");
    });
    (0, vitest_1.it)("should not include radioFolder style when not requested", function () {
        var root = { type: "root", children: [] };
        var kml = (0, index_1.foldersToKML)(root);
        (0, vitest_1.expect)(kml).not.toContain("radioFolder");
    });
});
