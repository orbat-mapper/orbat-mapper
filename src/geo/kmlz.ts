import { KML } from "ol/format";
import type { Options as KMLFormatOptions } from "ol/format/KML";
import type { ReadOptions } from "ol/format/Feature";
import { arrayBufferToString } from "@/importexport/fileHandling";

async function getKMLData(objectUrl: string) {
  return fetch(objectUrl).then((response) => response.text());
}

export class KMLZ extends KML {
  constructor(opt_options: KMLFormatOptions) {
    const options = opt_options || {};
    super(options);
  }

  getType() {
    return "arraybuffer" as any;
  }

  async readFromObjectUrl(objectUrl: string, options?: ReadOptions) {
    const kmlData = await getKMLData(objectUrl);
    return super.readFeatures(kmlData, options);
  }

  readFeatures(source: ArrayBuffer, options: ReadOptions) {
    const kmlData = arrayBufferToString(source);
    return super.readFeatures(kmlData, options);
  }
}
