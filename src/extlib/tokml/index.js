"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldersToKML = foldersToKML;
exports.toKML = toKML;
/**
 * Original code by Tom MacWright https://github.com/placemark/tokml
 */
var unist_builder_1 = require("unist-builder");
var xastscript_1 = require("xastscript");
var xast_util_to_xml_1 = require("xast-util-to-xml");
var BR = (0, unist_builder_1.u)("text", "\n");
var TAB = (0, unist_builder_1.u)("text", "  ");
function foldersToKML(root, styles, options) {
    if (styles === void 0) { styles = []; }
    if (options === void 0) { options = {}; }
    return (0, xast_util_to_xml_1.toXml)((0, unist_builder_1.u)("root", [
        (0, xastscript_1.x)("kml", { xmlns: "http://www.opengis.net/kml/2.2" }, (0, xastscript_1.x)("Document", styles.flatMap(function (style) { return convertStyle(style); }), options.listStyle ? convertListStyle(options.listStyle) : [], root.children.flatMap(function (child) { return convertChild(child); }), options.listStyle ? (0, xastscript_1.x)("styleUrl", [(0, unist_builder_1.u)("text", "#".concat(options.listStyle))]) : [])),
    ]));
}
function convertStyle(_a) {
    var sidc = _a.sidc, _b = _a.iconScale, iconScale = _b === void 0 ? 1 : _b, _c = _a.labelScale, labelScale = _c === void 0 ? 1 : _c, xOffset = _a.xOffset, yOffset = _a.yOffset;
    var hasOffset = xOffset !== undefined && yOffset !== undefined;
    return [
        BR,
        (0, xastscript_1.x)("Style", { id: "sidc".concat(sidc) }, [
            (0, xastscript_1.x)("IconStyle", [
                (0, xastscript_1.x)("Icon", [(0, xastscript_1.x)("href", [(0, unist_builder_1.u)("text", "icons/".concat(sidc, ".png"))])]),
                iconScale !== 1 ? (0, xastscript_1.x)("scale", [(0, unist_builder_1.u)("text", "".concat(iconScale))]) : undefined,
                hasOffset
                    ? (0, xastscript_1.x)("hotSpot", {
                        x: "".concat(xOffset),
                        y: "".concat(yOffset),
                        xunits: "insetPixels",
                        yunits: "insetPixels",
                    })
                    : undefined,
            ]),
            (0, xastscript_1.x)("LabelStyle", [
                labelScale !== 1 ? (0, xastscript_1.x)("scale", [(0, unist_builder_1.u)("text", "".concat(labelScale))]) : undefined,
            ]), // Add this line for small labels
        ]),
    ];
}
function convertListStyle(listStyle) {
    return [
        BR,
        (0, xastscript_1.x)("Style", { id: listStyle }, [
            (0, xastscript_1.x)("ListStyle", [(0, xastscript_1.x)("listItemType", [(0, unist_builder_1.u)("text", listStyle)])]),
        ]),
    ];
}
/**
 * Convert a GeoJSON FeatureCollection to a string of
 * KML data.
 */
function toKML(featureCollection) {
    return (0, xast_util_to_xml_1.toXml)((0, unist_builder_1.u)("root", [
        (0, xastscript_1.x)("kml", { xmlns: "http://www.opengis.net/kml/2.2" }, (0, xastscript_1.x)("Document", featureCollection.features.flatMap(function (feature) { return convertFeature(feature); }))),
    ]));
}
function convertChild(child) {
    switch (child.type) {
        case "Feature":
            return convertFeature(child);
        case "folder":
            return convertFolder(child);
    }
}
function convertFolder(folder) {
    var id = ["string", "number"].includes(typeof folder.meta.id)
        ? {
            id: String(folder.meta.id),
        }
        : {};
    return [
        BR,
        (0, xastscript_1.x)("Folder", id, __spreadArray(__spreadArray(__spreadArray([
            BR
        ], folderMeta(folder.meta), true), [
            BR,
            TAB
        ], false), folder.children.flatMap(function (child) { return convertChild(child); }), true)),
    ];
}
var META_PROPERTIES = [
    "address",
    "description",
    "name",
    "open",
    "visibility",
    "phoneNumber",
];
function folderMeta(meta) {
    return META_PROPERTIES.filter(function (p) { return meta[p] !== undefined; }).map(function (p) {
        return (0, xastscript_1.x)(p, [(0, unist_builder_1.u)("text", String(meta[p]))]);
    });
}
function convertFeature(feature) {
    var id = feature.id;
    var idMember = ["string", "number"].includes(typeof id)
        ? {
            id: id,
        }
        : {};
    return [
        BR,
        (0, xastscript_1.x)("Placemark", idMember, __spreadArray(__spreadArray(__spreadArray([
            BR
        ], propertiesToTags(feature.properties), true), [
            BR,
            TAB
        ], false), (feature.geometry ? [convertGeometry(feature.geometry)] : []), true)),
    ];
}
function join(position) {
    return "".concat(position[0], ",").concat(position[1]);
}
function coord1(coordinates) {
    return (0, xastscript_1.x)("coordinates", [(0, unist_builder_1.u)("text", join(coordinates))]);
}
function coord2(coordinates) {
    return (0, xastscript_1.x)("coordinates", [(0, unist_builder_1.u)("text", coordinates.map(join).join("\n"))]);
}
function toString(value) {
    switch (typeof value) {
        case "string": {
            return value;
        }
        case "boolean":
        case "number": {
            return String(value);
        }
        case "object": {
            try {
                return JSON.stringify(value);
            }
            catch (e) {
                return "";
            }
        }
    }
    return "";
}
function maybeCData(value) {
    if (value &&
        typeof value === "object" &&
        "@type" in value &&
        value["@type"] === "html" &&
        "value" in value &&
        typeof value.value === "string") {
        return (0, unist_builder_1.u)("cdata", value.value);
    }
    return toString(value);
}
function propertiesToTags(properties) {
    if (!properties)
        return [];
    var name = properties.name, description = properties.description, visibility = properties.visibility, styleUrl = properties.styleUrl, otherProperties = __rest(properties, ["name", "description", "visibility", "styleUrl"]);
    return [
        name && (0, xastscript_1.x)("name", [(0, unist_builder_1.u)("text", toString(name))]),
        description && (0, xastscript_1.x)("description", [(0, unist_builder_1.u)("text", maybeCData(description))]),
        styleUrl && (0, xastscript_1.x)("styleUrl", [(0, unist_builder_1.u)("text", toString(styleUrl))]),
        visibility !== undefined && (0, xastscript_1.x)("visibility", [(0, unist_builder_1.u)("text", visibility ? "1" : "0")]),
        (0, xastscript_1.x)("ExtendedData", Object.entries(otherProperties).flatMap(function (_a) {
            var name = _a[0], value = _a[1];
            return [
                BR,
                TAB,
                (0, xastscript_1.x)("Data", { name: name }, [
                    (0, xastscript_1.x)("value", [
                        (0, unist_builder_1.u)("text", typeof value === "string" ? value : JSON.stringify(value)),
                    ]),
                ]),
            ];
        })),
    ].filter(Boolean);
}
var linearRing = function (ring) { return (0, xastscript_1.x)("LinearRing", [coord2(ring)]); };
function convertMultiPoint(geometry) {
    return (0, xastscript_1.x)("MultiGeometry", geometry.coordinates.flatMap(function (coordinates) { return [
        BR,
        convertGeometry({
            type: "Point",
            coordinates: coordinates,
        }),
    ]; }));
}
function convertMultiLineString(geometry) {
    return (0, xastscript_1.x)("MultiGeometry", geometry.coordinates.flatMap(function (coordinates) { return [
        BR,
        convertGeometry({
            type: "LineString",
            coordinates: coordinates,
        }),
    ]; }));
}
function convertMultiPolygon(geometry) {
    return (0, xastscript_1.x)("MultiGeometry", geometry.coordinates.flatMap(function (coordinates) { return [
        BR,
        convertGeometry({
            type: "Polygon",
            coordinates: coordinates,
        }),
    ]; }));
}
function convertPolygon(geometry) {
    var _a = geometry.coordinates, outerBoundary = _a[0], innerRings = _a.slice(1);
    return (0, xastscript_1.x)("Polygon", __spreadArray([
        BR,
        (0, xastscript_1.x)("outerBoundaryIs", [BR, TAB, linearRing(outerBoundary)])
    ], innerRings.flatMap(function (innerRing) { return [
        BR,
        (0, xastscript_1.x)("innerBoundaryIs", [BR, TAB, linearRing(innerRing)]),
    ]; }), true));
}
function convertGeometry(geometry) {
    switch (geometry.type) {
        case "Point":
            return (0, xastscript_1.x)("Point", [coord1(geometry.coordinates)]);
        case "MultiPoint":
            return convertMultiPoint(geometry);
        case "LineString":
            return (0, xastscript_1.x)("LineString", [coord2(geometry.coordinates)]);
        case "MultiLineString":
            return convertMultiLineString(geometry);
        case "Polygon":
            return convertPolygon(geometry);
        case "MultiPolygon":
            return convertMultiPolygon(geometry);
        case "GeometryCollection":
            return (0, xastscript_1.x)("MultiGeometry", geometry.geometries.flatMap(function (geometry) { return [BR, convertGeometry(geometry)]; }));
    }
}
