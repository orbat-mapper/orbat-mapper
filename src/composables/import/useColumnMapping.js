"use strict";
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
exports.idAliases = exports.commonFields = void 0;
exports.useColumnMapping = useColumnMapping;
var vue_1 = require("vue");
var fuzzysort_1 = require("fuzzysort");
var utils_1 = require("@/geo/utils");
exports.commonFields = [
    {
        label: "Name",
        value: "name",
        aliases: ["unit name", "label", "title"],
        helpText: "The display name for the unit (required)",
        essential: true,
    },
    {
        label: "Short name",
        value: "shortName",
        aliases: ["abbr", "abbreviation", "short"],
        helpText: "Abbreviated unit name for compact displays",
        essential: false,
    },
    {
        label: "Icon",
        value: "icon",
        aliases: ["icon", "symbol code", "function", "role", "name"],
        helpText: "Unit icon/function",
        essential: true,
    },
    {
        label: "Echelon",
        value: "echelon",
        aliases: ["echelon", "level", "size", "rank", "name"],
        helpText: "Command level",
        essential: true,
    },
    {
        label: "Parent ID",
        value: "parentId",
        aliases: ["parent", "parent unit", "superior", "reports to", "p_id"],
        helpText: "ID of the parent unit in the hierarchy",
        essential: false,
    },
    {
        label: "Description",
        value: "description",
        aliases: ["remarks", "notes", "comments"],
        helpText: "Additional information about the unit",
        essential: false,
    },
    {
        label: "External URL",
        value: "externalUrl",
        aliases: ["url", "link", "external link"],
        helpText: "Link to external documentation or resources",
        essential: false,
    },
];
exports.idAliases = ["id", "unit id", "identifier", "uid", "entityid"];
function useColumnMapping(headers, data) {
    var fieldMappings = (0, vue_1.ref)({});
    var idField = (0, vue_1.ref)(null);
    var parentMatchField = (0, vue_1.ref)(null);
    // Position mapping state
    var coordinateMode = (0, vue_1.ref)("none");
    var combinedCoordinateFormat = (0, vue_1.ref)("LatLon");
    var latitudeField = (0, vue_1.ref)(null);
    var longitudeField = (0, vue_1.ref)(null);
    var positionField = (0, vue_1.ref)(null);
    (0, vue_1.watch)(headers, function (newHeaders) {
        // Guess ID field
        var idBestScore = -Infinity;
        var idBestMatch = "";
        exports.idAliases.forEach(function (alias) {
            var results = fuzzysort_1.default.go(alias, newHeaders);
            if (results.length > 0 && results[0].score > idBestScore) {
                idBestScore = results[0].score;
                idBestMatch = results[0].target;
            }
        });
        idField.value = idBestScore > -1000 ? idBestMatch : null;
        parentMatchField.value = idField.value;
        // Guess other fields
        exports.commonFields.forEach(function (field) {
            var searchTerms = __spreadArray([field.value, field.label], field.aliases, true);
            var bestScore = -Infinity;
            var bestMatch = "";
            searchTerms.forEach(function (term) {
                var results = fuzzysort_1.default.go(term, newHeaders);
                if (results.length > 0 && results[0].score > bestScore) {
                    bestScore = results[0].score;
                    bestMatch = results[0].target;
                }
            });
            var mappedValue = bestScore > -1000 ? bestMatch : null;
            fieldMappings.value[field.value] = mappedValue;
        });
        // Guess position fields
        var latAliases = ["latitude", "lat", "y", "northing"];
        var lonAliases = ["longitude", "lon", "long", "lng", "x", "easting"];
        var combinedAliases = [
            "coordinates",
            "coordinate",
            "coords",
            "position",
            "location",
            "mgrs",
            "grid",
            "grid reference",
            "utm",
        ];
        // Try to find latitude column
        var latBestScore = -Infinity;
        var latBestMatch = "";
        latAliases.forEach(function (alias) {
            var results = fuzzysort_1.default.go(alias, newHeaders);
            if (results.length > 0 && results[0].score > latBestScore) {
                latBestScore = results[0].score;
                latBestMatch = results[0].target;
            }
        });
        // Try to find longitude column
        var lonBestScore = -Infinity;
        var lonBestMatch = "";
        lonAliases.forEach(function (alias) {
            var results = fuzzysort_1.default.go(alias, newHeaders);
            if (results.length > 0 && results[0].score > lonBestScore) {
                lonBestScore = results[0].score;
                lonBestMatch = results[0].target;
            }
        });
        // Try to find combined coordinate column
        var combinedBestScore = -Infinity;
        var combinedBestMatch = "";
        combinedAliases.forEach(function (alias) {
            var results = fuzzysort_1.default.go(alias, newHeaders);
            if (results.length > 0 && results[0].score > combinedBestScore) {
                combinedBestScore = results[0].score;
                combinedBestMatch = results[0].target;
            }
        });
        // Determine coordinate mode based on matches
        var latFound = latBestScore > -1000 && latBestMatch;
        var lonFound = lonBestScore > -1000 && lonBestMatch;
        var combinedFound = combinedBestScore > -1000 && combinedBestMatch;
        if (latFound && lonFound && latBestMatch !== lonBestMatch) {
            // Found separate lat/lon columns
            coordinateMode.value = "separate";
            latitudeField.value = latBestMatch;
            longitudeField.value = lonBestMatch;
        }
        else if (combinedFound) {
            // Found combined coordinate column
            coordinateMode.value = "combined";
            positionField.value = combinedBestMatch;
            // Sample data for detection
            var sampleSize = 5;
            var samples = data.value
                .slice(0, 20)
                .map(function (row) { return row[combinedBestMatch]; })
                .filter(function (val) { return typeof val === "string" && val.trim().length > 0; })
                .slice(0, sampleSize);
            var detectedFormat = (0, utils_1.detectCoordinateFormat)(samples);
            if (detectedFormat) {
                combinedCoordinateFormat.value = detectedFormat;
            }
            else {
                // Fallback to name-based guessing
                var lowerMatch = combinedBestMatch.toLowerCase();
                if (lowerMatch.includes("mgrs") || lowerMatch.includes("grid")) {
                    combinedCoordinateFormat.value = "MGRS";
                }
                else {
                    combinedCoordinateFormat.value = "LatLon";
                }
            }
        }
        else {
            coordinateMode.value = "none";
            latitudeField.value = null;
            longitudeField.value = null;
            positionField.value = null;
        }
    }, { immediate: true });
    (0, vue_1.watch)(positionField, function (newField) {
        if (newField && coordinateMode.value === "combined") {
            // Sample data when field changes
            var sampleSize = 5;
            var samples = data.value
                .slice(0, 20)
                .map(function (row) { return row[newField]; })
                .filter(function (val) { return typeof val === "string" && val.trim().length > 0; })
                .slice(0, sampleSize);
            var detected = (0, utils_1.detectCoordinateFormat)(samples);
            if (detected)
                combinedCoordinateFormat.value = detected;
        }
    });
    return {
        fieldMappings: fieldMappings,
        idField: idField,
        parentMatchField: parentMatchField,
        coordinateMode: coordinateMode,
        combinedCoordinateFormat: combinedCoordinateFormat,
        latitudeField: latitudeField,
        longitudeField: longitudeField,
        positionField: positionField,
    };
}
