import { ref, watch, type Ref } from "vue";
import fuzzysort from "fuzzysort";
import { type CoordinateMode } from "@/components/import/types";
import { detectCoordinateFormat, type CombinedCoordinateFormat } from "@/geo/utils";

export interface FieldDefinition {
  label: string;
  value: string;
  aliases: string[];
  helpText: string;
  essential?: boolean;
}

export const commonFields: FieldDefinition[] = [
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

export const idAliases = ["id", "unit id", "identifier", "uid", "entityid"];

export function useColumnMapping(headers: Ref<string[]>, data: Ref<any[]>) {
  const fieldMappings = ref<Record<string, string | null>>({});
  const idField = ref<string | null>(null);
  const parentMatchField = ref<string | null>(null);

  // Position mapping state
  const coordinateMode = ref<CoordinateMode>("none");
  const combinedCoordinateFormat = ref<CombinedCoordinateFormat>("LatLon");
  const latitudeField = ref<string | null>(null);
  const longitudeField = ref<string | null>(null);
  const positionField = ref<string | null>(null);

  watch(
    headers,
    (newHeaders) => {
      // Guess ID field
      let idBestScore = -Infinity;
      let idBestMatch = "";

      idAliases.forEach((alias) => {
        const results = fuzzysort.go(alias, newHeaders);
        if (results.length > 0 && results[0].score > idBestScore) {
          idBestScore = results[0].score;
          idBestMatch = results[0].target;
        }
      });

      idField.value = idBestScore > -1000 ? idBestMatch : null;
      parentMatchField.value = idField.value;

      // Guess other fields
      commonFields.forEach((field) => {
        const searchTerms = [field.value, field.label, ...field.aliases];
        let bestScore = -Infinity;
        let bestMatch = "";

        searchTerms.forEach((term) => {
          const results = fuzzysort.go(term, newHeaders);
          if (results.length > 0 && results[0].score > bestScore) {
            bestScore = results[0].score;
            bestMatch = results[0].target;
          }
        });

        const mappedValue = bestScore > -1000 ? bestMatch : null;
        fieldMappings.value[field.value] = mappedValue;
      });

      // Guess position fields
      const latAliases = ["latitude", "lat", "y", "northing"];
      const lonAliases = ["longitude", "lon", "long", "lng", "x", "easting"];
      const combinedAliases = [
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
      let latBestScore = -Infinity;
      let latBestMatch = "";
      latAliases.forEach((alias) => {
        const results = fuzzysort.go(alias, newHeaders);
        if (results.length > 0 && results[0].score > latBestScore) {
          latBestScore = results[0].score;
          latBestMatch = results[0].target;
        }
      });

      // Try to find longitude column
      let lonBestScore = -Infinity;
      let lonBestMatch = "";
      lonAliases.forEach((alias) => {
        const results = fuzzysort.go(alias, newHeaders);
        if (results.length > 0 && results[0].score > lonBestScore) {
          lonBestScore = results[0].score;
          lonBestMatch = results[0].target;
        }
      });

      // Try to find combined coordinate column
      let combinedBestScore = -Infinity;
      let combinedBestMatch = "";
      combinedAliases.forEach((alias) => {
        const results = fuzzysort.go(alias, newHeaders);
        if (results.length > 0 && results[0].score > combinedBestScore) {
          combinedBestScore = results[0].score;
          combinedBestMatch = results[0].target;
        }
      });

      // Determine coordinate mode based on matches
      const latFound = latBestScore > -1000 && latBestMatch;
      const lonFound = lonBestScore > -1000 && lonBestMatch;
      const combinedFound = combinedBestScore > -1000 && combinedBestMatch;

      if (latFound && lonFound && latBestMatch !== lonBestMatch) {
        // Found separate lat/lon columns
        coordinateMode.value = "separate";
        latitudeField.value = latBestMatch;
        longitudeField.value = lonBestMatch;
      } else if (combinedFound) {
        // Found combined coordinate column
        coordinateMode.value = "combined";
        positionField.value = combinedBestMatch;

        // Sample data for detection
        const sampleSize = 5;
        const samples = data.value
          .slice(0, 20)
          .map((row) => (row as Record<string, unknown>)[combinedBestMatch])
          .filter(
            (val): val is string => typeof val === "string" && val.trim().length > 0,
          )
          .slice(0, sampleSize);

        const detectedFormat = detectCoordinateFormat(samples);

        if (detectedFormat) {
          combinedCoordinateFormat.value = detectedFormat;
        } else {
          // Fallback to name-based guessing
          const lowerMatch = combinedBestMatch.toLowerCase();
          if (lowerMatch.includes("mgrs") || lowerMatch.includes("grid")) {
            combinedCoordinateFormat.value = "MGRS";
          } else {
            combinedCoordinateFormat.value = "LatLon";
          }
        }
      } else {
        coordinateMode.value = "none";
        latitudeField.value = null;
        longitudeField.value = null;
        positionField.value = null;
      }
    },
    { immediate: true },
  );

  watch(positionField, (newField) => {
    if (newField && coordinateMode.value === "combined") {
      // Sample data when field changes
      const sampleSize = 5;
      const samples = data.value
        .slice(0, 20)
        .map((row) => (row as Record<string, unknown>)[newField])
        .filter((val): val is string => typeof val === "string" && val.trim().length > 0)
        .slice(0, sampleSize);

      const detected = detectCoordinateFormat(samples);
      if (detected) combinedCoordinateFormat.value = detected;
    }
  });

  return {
    fieldMappings,
    idField,
    parentMatchField,
    coordinateMode,
    combinedCoordinateFormat,
    latitudeField,
    longitudeField,
    positionField,
  };
}
