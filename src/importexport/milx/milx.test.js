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
var vitest_1 = require("vitest");
var readMilX_1 = require("@/importexport/milx/readMilX");
var writeMilX_1 = require("@/importexport/milx/writeMilX");
var utils_1 = require("@/utils");
var TEST_DOCUMENT = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<MilXDocument_Layer xmlns=\"http://gs-soft.com/MilX/V3.1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n\t<MssLibraryVersionTag>2022.04.12</MssLibraryVersionTag>\n\t<MilXLayer>\n\t\t<Name>Friend</Name>\n\t\t<LayerType>Normal</LayerType>\n\t\t<GraphicList>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFGPUCIA---F--G\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-59.0238516414698</X>\n\t\t\t\t\t\t<Y>-51.5929697062433</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFGPUCIA---D--G\"&gt;&lt;Attribute ID=\"M\"&gt;3&lt;/Attribute&gt;&gt;&lt;Attribute ID=\"XO\"&gt;$000080FF&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-58.9290235662824</X>\n\t\t\t\t\t\t<Y>-51.6476401835131</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFGPUCIL---C---\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-58.9307169247679</X>\n\t\t\t\t\t\t<Y>-51.7064424405543</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFGPUCFHE------\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-59.1322265845412</X>\n\t\t\t\t\t\t<Y>-51.7305712518241</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFSPCPSB------G\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-59.2321347351851</X>\n\t\t\t\t\t\t<Y>-51.4887033982753</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SFSPCPSUG-----G\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-59.2829354897498</X>\n\t\t\t\t\t\t<Y>-51.5740299627017</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t</GraphicList>\n\t\t<CoordSystemType>WGS84</CoordSystemType>\n\t\t<ViewScale>0.1</ViewScale>\n\t\t<SymbolSize>1</SymbolSize>\n\t</MilXLayer>\n\t<MilXLayer>\n\t\t<Name>Hostile</Name>\n\t\t<LayerType>Normal</LayerType>\n\t\t<GraphicList>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SHGPUCIM---E---\"&gt;&lt;Attribute ID=\"T\"&gt;2BN&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-58.7055543079458</X>\n\t\t\t\t\t\t<Y>-51.5875685609539</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SHGPUCIM---E---\"&gt;&lt;Attribute ID=\"T\"&gt;2BN&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-58.2992663717653</X>\n\t\t\t\t\t\t<Y>-51.6817459899647</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t\t<MilXGraphic>\n\t\t\t\t<MssStringXML>&lt;Symbol ID=\"SHGPUCI---AE---\"/&gt;</MssStringXML>\n\t\t\t\t<PointList>\n\t\t\t\t\t<Point>\n\t\t\t\t\t\t<X>-58.257401739176</X>\n\t\t\t\t\t\t<Y>-51.7690966638132</Y>\n\t\t\t\t\t</Point>\n\t\t\t\t</PointList>\n\t\t\t</MilXGraphic>\n\t\t</GraphicList>\n\t\t<CoordSystemType>WGS84</CoordSystemType>\n\t\t<ViewScale>0.1</ViewScale>\n\t\t<SymbolSize>1</SymbolSize>\n\t</MilXLayer>\n</MilXDocument_Layer>\n";
(0, vitest_1.describe)("Convert from MilX", function () {
    return __awaiter(this, void 0, void 0, function () {
        var dom, layers, feature1, feature2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.toDom)(TEST_DOCUMENT)];
                case 1:
                    dom = _a.sent();
                    layers = (0, readMilX_1.getMilXLayers)(dom);
                    feature1 = layers[0].featureCollection.features[0];
                    feature2 = layers[0].featureCollection.features[1];
                    (0, vitest_1.it)("parses layer name", function () {
                        (0, vitest_1.expect)(layers.length).toBe(2);
                        (0, vitest_1.expect)(layers[0].name).toBe("Friend");
                        (0, vitest_1.expect)(layers[1].name).toBe("Hostile");
                    });
                    (0, vitest_1.it)("parses coordinate system", function () {
                        (0, vitest_1.expect)(layers.length).toBe(2);
                        (0, vitest_1.expect)(layers[0].coordSystemType).toBe("WGS84");
                    });
                    (0, vitest_1.it)("creates geojson", function () {
                        var layer = layers[0];
                        (0, vitest_1.expect)(layer.featureCollection.type).toBe("FeatureCollection");
                        (0, vitest_1.expect)(layer.featureCollection.features.length).toBe(6);
                    });
                    (0, vitest_1.it)("parses symbol code", function () {
                        (0, vitest_1.expect)(feature1.properties.ID).toBe("SFGPUCIA---F--G");
                    });
                    (0, vitest_1.it)("parses attributes", function () {
                        (0, vitest_1.expect)(feature2.properties.ID).toBe("SFGPUCIA---D--G");
                        (0, vitest_1.expect)(feature2.properties.M).toBe("3");
                    });
                    (0, vitest_1.it)("converts symbol properties", function () {
                        var a = (0, readMilX_1.convertMilXLayer)(layers[0]);
                        var convertedFeature = a.features[0];
                        var convertedFeature2 = a.features[1];
                        (0, vitest_1.expect)(convertedFeature.properties.convertedProperties.sidc).toBe("10031000161211000001");
                        (0, vitest_1.expect)(convertedFeature2.properties.convertedProperties.higherFormation).toBe("3");
                        (0, vitest_1.expect)(convertedFeature2.properties.convertedProperties.fillColor).toBe("#FF8000");
                    });
                    return [2 /*return*/];
            }
        });
    });
});
(0, vitest_1.describe)("Convert to MilX", function () {
    return __awaiter(this, void 0, void 0, function () {
        var milx, dom, layers, feature1, feature2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    milx = (0, writeMilX_1.toMilx)([
                        {
                            name: "Friend",
                            featureCollection: {
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        geometry: { type: "Point", coordinates: [1, 2] },
                                        properties: { sidc: "10031000161211000001" },
                                        id: "sdf",
                                    },
                                ],
                            },
                        },
                        {
                            name: "Hostile",
                            featureCollection: {
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        geometry: { type: "Point", coordinates: [1, 2] },
                                        properties: { sidc: "10031000161211000001" },
                                        id: "sdf",
                                    },
                                ],
                            },
                        },
                    ]);
                    return [4 /*yield*/, (0, utils_1.toDom)(milx)];
                case 1:
                    dom = _a.sent();
                    layers = (0, readMilX_1.getMilXLayers)(dom);
                    feature1 = layers[0].featureCollection.features[0];
                    feature2 = layers[0].featureCollection.features[1];
                    (0, vitest_1.it)("writes layer name", function () {
                        (0, vitest_1.expect)(layers.length).toBe(2);
                        (0, vitest_1.expect)(layers[0].name).toBe("Friend");
                        (0, vitest_1.expect)(layers[1].name).toBe("Hostile");
                    });
                    (0, vitest_1.it)("writes coordinate system", function () {
                        (0, vitest_1.expect)(layers.length).toBe(2);
                        (0, vitest_1.expect)(layers[0].coordSystemType).toBe("WGS84");
                    });
                    (0, vitest_1.it)("writes symbol code", function () {
                        (0, vitest_1.expect)(feature1.properties.ID).toBe("SFGPUCIA---F---");
                    });
                    (0, vitest_1.it)("writes coordinates", function () {
                        var geometry = feature1.geometry;
                        (0, vitest_1.expect)(geometry.coordinates.length).toBe(2);
                        (0, vitest_1.expect)(geometry.coordinates[0]).toBe(1);
                        (0, vitest_1.expect)(geometry.coordinates[1]).toBe(2);
                    });
                    return [2 /*return*/];
            }
        });
    });
});
