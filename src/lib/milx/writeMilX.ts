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

import { BR, BRTAB, tagValue } from "@/lib/milx/domutils";

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

function convertSymbol(properties: MilSymbolProperties) {
  const { sidc: numberSidc, name, shortName } = properties;
  const { sidc, match } = convertNumberSidc2LetterSidc(numberSidc);
  if (match === "partial" || match === "failed") {
    console.warn("Failed to convert", properties, match);
  }

  const attributes = { name, shortName };

  return tagValue(
    "MssStringXML",
    toXml(
      u("root", [
        x(
          "Symbol",
          { ID: sidc }
          // ...Object.entries(attributes).map(([k, v]) => tagIdValue("Attribute", k, v!))
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
