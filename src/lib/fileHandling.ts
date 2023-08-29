import { Unzipped } from "fflate";
import { GuessedImportFormat } from "@/types/convert";
import { unzip } from "@/composables/scenarioImport";

export interface ImportedFileInfo {
  dataAsString: string;
  errors: string[];
  format: GuessedImportFormat;
  hasMultipleFiles: boolean;
  isInvalid: boolean;
  isJson: boolean;
  isZipped: boolean;
  objectUrl: string;
  fileName: string;
}

export const imageCache = new Map<string, string>();

export function clearCache() {
  imageCache.forEach((value, key) => {
    URL.revokeObjectURL(value);
  });
  imageCache.clear();
}

export async function guessImportFormat(file: File): Promise<ImportedFileInfo> {
  const guess: ImportedFileInfo = {
    format: "unknown",
    isZipped: false,
    isJson: false,
    hasMultipleFiles: false,
    dataAsString: "Unknown data",
    isInvalid: false,
    errors: [],
    objectUrl: "",
    fileName: file.name,
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
        new Blob([kmz[1]], { type: "application/vnd.google-earth.kml+xml" }),
      );
      Object.entries(unzipped).forEach(([filename, data]) => {
        if (!filename.endsWith(".kml")) {
          imageCache.set(filename, URL.createObjectURL(new Blob([data])));
        }
      });
      return guess;
    }

    // TODO: odin, kmz
  } else if (hasImageFileType(file)) {
    guess.format = "image";
    guess.dataAsString = file.name;
    guess.objectUrl = URL.createObjectURL(file);
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
    if (json.type && json.type === "FeatureCollection") {
      guess.format = "geojson";
    } else if (json.options && json.subOrganizations) {
      guess.format = "unitgenerator";
    } else if (Array.isArray(json) && Array.isArray(json[0]) && json[0].length >= 6) {
      guess.format = "orbatgenerator";
    }
  } catch (e) {}

  return guess;
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

export function arrayBufferToString(arrayBuffer: ArrayBuffer, decoderType = "utf-8") {
  let decoder = new TextDecoder(decoderType);
  return decoder.decode(arrayBuffer);
}

async function readZippedFile(file: File): Promise<Unzipped> {
  const data = await file.arrayBuffer();
  return unzip(data);
}

function readFileAsync(file: File): Promise<ArrayBuffer | null | string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
