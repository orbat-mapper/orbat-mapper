import type { Unzipped } from "fflate";
import type { GuessedFormatDialect, GuessedImportFormat } from "@/types/importExport.ts";
import type { FeatureCollection, Feature } from "geojson";

export interface ImportedFileInfo {
  dataAsString: string;
  errors: string[];
  format: GuessedImportFormat;
  dialect: GuessedFormatDialect;
  hasMultipleFiles: boolean;
  isInvalid: boolean;
  isJson: boolean;
  isZipped: boolean;
  objectUrl: string;
  fileName: string;
  fileSize: number;
  dataAsArrayBuffer?: ArrayBuffer;
}

export const imageCache = new Map<string, string>();

export function clearCache() {
  imageCache.forEach((value) => {
    URL.revokeObjectURL(value);
  });
  imageCache.clear();
}

export async function guessImportFormat(file: File): Promise<ImportedFileInfo> {
  const guess: ImportedFileInfo = {
    format: "unknown",
    dialect: "unknown",
    isZipped: false,
    isJson: false,
    hasMultipleFiles: false,
    dataAsString: "Unknown data",
    isInvalid: false,
    errors: [],
    objectUrl: "",
    fileName: file.name,
    fileSize: file.size,
  };

  if (hasZippedFileType(file)) {
    guess.isZipped = true;
    let unzipped: Unzipped;
    try {
      unzipped = await readZippedFile(file);
    } catch (e) {
      console.error(e);
      guess.isInvalid = true;
      guess.errors.push(`Failed to unzip file: ${e}`);
      return guess;
    }

    // is it a milx file?
    const f = Object.entries(unzipped).find(([filename]) => filename.endsWith(".milxly"));
    if (f) {
      guess.format = "milx";
      guess.dataAsString = arrayBufferToString(f[1]);
      return guess;
    }
    // is it a kmz file?
    const kmz = Object.entries(unzipped).find(([filename]) => filename.endsWith(".kml"));
    if (kmz) {
      guess.format = "kml";
      guess.dataAsString = arrayBufferToString(kmz[1]);
      guess.objectUrl = URL.createObjectURL(
        new Blob([kmz[1] as BlobPart], { type: "application/vnd.google-earth.kml+xml" }),
      );
      Object.entries(unzipped).forEach(([filename, data]) => {
        if (!filename.endsWith(".kml")) {
          imageCache.set(filename, URL.createObjectURL(new Blob([data as BlobPart])));
        }
      });
      return guess;
    }
  } else if (hasImageFileType(file)) {
    guess.format = "image";
    guess.dataAsString = file.name;
    guess.objectUrl = URL.createObjectURL(file);
    return guess;
  } else if (isSpreadsheetFileType(file)) {
    guess.format = "xlsx";
    guess.dataAsArrayBuffer = await file.arrayBuffer();
    return guess;
  }

  // read as text
  let text: string;
  try {
    text = await file.text();
  } catch (e) {
    guess.isInvalid = true;
    guess.errors.push("Could not read file as text");
    console.error(e);
    return guess;
  }

  if (isKMFileType(file)) {
    guess.format = "kml";
    guess.dataAsString = text;
    guess.objectUrl = URL.createObjectURL(file);
    return guess;
  }

  // is it json
  try {
    const json = JSON.parse(text);
    guess.isJson = true;
    guess.dataAsString = text;
    if (isOrbatMapperScenario(json)) {
      guess.format = "orbatmapper";
    } else if (isOrbatMapperEncryptedScenario(json)) {
      guess.format = "orbatmapper-encrypted";
    } else if (isFeatureCollection(json)) {
      guess.format = "geojson";
      const geojsonProps = json.features[0]?.properties ?? {};
      if (
        "uniqueDesignation" in geojsonProps ||
        "datetime" in geojsonProps ||
        "drawable" in geojsonProps
      ) {
        guess.dialect = "geojson-unitgenerator";
      }
    } else if (isGeoJsonFeature(json)) {
      guess.format = "geojson";
    } else if (json.options && json.subOrganizations) {
      guess.format = "unitgenerator";
    } else if (Array.isArray(json) && Array.isArray(json[0]) && json[0].length >= 6) {
      guess.format = "orbatgenerator";
    }
  } catch {
    // ignore
  }

  if (guess.isJson) return guess;

  const delimiter = detectDelimiter(text);
  if (delimiter === "\t") {
    guess.format = "tsv";
    guess.dataAsString = text;
    return guess;
  } else if (delimiter === ",") {
    guess.format = "csv";
    guess.dataAsString = text;
    return guess;
  }

  // Fallback to extension check if delimiter detection is inconclusive
  if (isCsvFileType(file)) {
    guess.format = "csv";
    guess.dataAsString = text;
    return guess;
  }

  if (isTsvFileType(file)) {
    guess.format = "tsv";
    guess.dataAsString = text;
    return guess;
  }

  return guess;
}

function detectDelimiter(text: string): "," | "\t" | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return null;

  const sampleSize = Math.min(lines.length, 10);
  let commaScore = 0;
  let tabScore = 0;

  for (let i = 0; i < sampleSize; i++) {
    const line = lines[i];
    const commas = (line.match(/,/g) || []).length;
    const tabs = (line.match(/\t/g) || []).length;

    if (commas > tabs && commas > 0) commaScore++;
    if (tabs > commas && tabs > 0) tabScore++;
  }

  if (tabScore > commaScore) return "\t";
  if (commaScore > tabScore) return ",";

  return null;
}

function isGeoJsonFeature(json: unknown): json is Feature {
  return (
    typeof json === "object" && json !== null && "type" in json && json.type === "Feature"
  );
}

function isFeatureCollection(json: unknown): json is FeatureCollection {
  return (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    json.type === "FeatureCollection"
  );
}

function isOrbatMapperScenario(json: unknown): boolean {
  if (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    json.type === "ORBAT-mapper"
  ) {
    if ("sides" in json && Array.isArray(json.sides)) {
      return true;
    }
  }
  return false;
}

function isOrbatMapperEncryptedScenario(json: unknown): boolean {
  return (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    json.type === "ORBAT-mapper-encrypted"
  );
}

function hasZippedFileType(file: File): boolean {
  const zippedTypes = ["application/vnd.google-earth.kmz", "application/zip"];
  if (zippedTypes.includes(file.type)) return true;
  if (file.name.endsWith(".kmz")) return true;
  if (file.name.endsWith(".odin")) return true;
  return file.name.endsWith(".milxlyz");
}

function isKMFileType(file: File): boolean {
  const kmlTypes = ["application/vnd.google-earth.kml+xml"];
  if (kmlTypes.includes(file.type)) return true;
  return file.name.endsWith(".kml");
}

function hasImageFileType(file: File): boolean {
  return file.type.startsWith("image/");
}

function isSpreadsheetFileType(file: File): boolean {
  const xlsxTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  if (xlsxTypes.includes(file.type)) return true;
  return file.name.endsWith(".xlsx");
}

function isCsvFileType(file: File): boolean {
  return file.type === "text/csv" || file.name.endsWith(".csv");
}

function isTsvFileType(file: File): boolean {
  return file.type === "text/tab-separated-values" || file.name.endsWith(".tsv");
}

export function arrayBufferToString(
  arrayBuffer: ArrayBuffer | Uint8Array,
  decoderType = "utf-8",
) {
  const decoder = new TextDecoder(decoderType);
  return decoder.decode(arrayBuffer);
}

export async function unzip(file: ArrayBuffer) {
  const fflate = await import("fflate");
  return await new Promise<Unzipped>((resolve, reject) => {
    fflate.unzip(new Uint8Array(file), (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

async function readZippedFile(file: File): Promise<Unzipped> {
  const data = await file.arrayBuffer();
  return unzip(data);
}
