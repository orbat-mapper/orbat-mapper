import type { Geometry, Point } from "geojson";
import { toXml } from "xast-util-to-xml";
import { u } from "unist-builder";
import { x } from "xastscript";
import { convertNumberSidc2LetterSidc } from "@orbat-mapper/convert-symbology";
import type {
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
  OrbatMapperGeoJsonFeature,
  OrbatMapperGeoJsonLayer,
} from "@/lib/milx/types";

import { BR, BRTAB, tagIdValue, tagValue } from "@/lib/milx/domutils";

export function toMilx(layers: OrbatMapperGeoJsonLayer[]): string {
  return toXml(
    u("root", [
      u("instruction", { name: "xml" }, 'version="1.0" encoding="UTF-8" standalone="no"'),
      BR,

      x(
        "MilXDocument_Layer",
        {
          xmlns: "http://gs-soft.com/MilX/V3.1",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        },
        BRTAB,
        tagValue("MssLibraryVersionTag", "2022.04.12"),
        BRTAB,
        BRTAB,

        ...layers.map((l) => convertLayer(l.featureCollection, l.name)),

        BR
      ),
    ])
  );
}

function convertLayer(
  featureCollection: OrbatMapperGeoJsonCollection,
  layerName = "Layer"
) {
  return x("MilXLayer", [
    BRTAB,
    tagValue("Name", layerName),
    BRTAB,
    tagValue("LayerType", "Normal"),
    BR,
    x("GraphicList", [
      ...featureCollection.features.map((feature) => convertFeature(feature)),
    ]),
    BR,
    tagValue("CoordSystemType", "WGS84"),
    BR,
  ]);
}

function convertFeature(feature: OrbatMapperGeoJsonFeature) {
  return x(
    "MilXGraphic",
    [BR, convertSymbol(feature.properties), BR, convertGeometry(feature.geometry)],
    BR
  );
}

function convertColor(color: string) {
  const r = color.slice(1, 3);
  const g = color.slice(3, 5);
  const b = color.slice(5, 7);
  return "$" + "00" + b + g + r;
}

function convertSymbol(properties: MilSymbolProperties) {
  const { sidc: numberSidc, name, shortName, fillColor } = properties;
  const { sidc, match } = convertNumberSidc2LetterSidc(numberSidc);
  if (match === "partial" || match === "failed") {
    console.warn("Failed to convert", properties, match, sidc);
  }

  // const attributes = { name, shortName };
  const attributes: Record<string, string> = {};
  if (fillColor) {
    attributes["XO"] = convertColor(fillColor);
  }

  return tagValue(
    "MssStringXML",
    toXml(
      u("root", [
        x(
          "Symbol",
          { ID: sidc },
          ...Object.entries(attributes).map(([k, v]) => tagIdValue("Attribute", k, v!))
        ),
      ])
    )
  );
}

function convertGeometry(geometry: Geometry) {
  if (geometry.type === "Point") {
    return convertPoint(geometry);
  }
}

function convertPoint(point: Point) {
  return x("PointList", [
    BR,
    x("Point", [
      BR,
      tagValue("X", `${point.coordinates[0]}`),
      BR,
      tagValue("Y", `${point.coordinates[1]}`),
      BR,
    ]),
    BR,
  ]);
}
