import {
  createFromString,
  getElements,
  getOneElement,
  nodeValue,
} from "@/importexport/milx/domutils";
import type { LineString, Point } from "geojson";
import type {
  MilXFeature,
  MilXGeoJsonCollection,
  MilXLayer,
  MilXSymbolProperties,
} from "@/importexport/milx/types";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";
import { nanoid } from "@/utils";
import {
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
} from "@/importexport/jsonish/types";
import { TextAmpKey, textAmpMap } from "@/symbology/milsymbwrapper";

const supportedAttributes: TextAmpKey[] = ["M", "G", "H"];

export function getMilXLayers(node: Document | Element): MilXLayer[] {
  const layers = getElements(node, "MilXLayer");

  return layers.map((layerElement) => ({
    name: getLayerName(layerElement),
    coordSystemType: getCoordinateSystem(layerElement) || "WGS84",
    featureCollection: getGraphics(layerElement),
  }));
}

export function convertMilXLayer(layer: MilXLayer): OrbatMapperGeoJsonCollection {
  const fc = layer.featureCollection;
  const { features: nFeatures, ...rest } = fc;
  const features = nFeatures
    .filter((f) => f.geometry.type === "Point")
    .map((f) => ({
      ...f,
      id: nanoid(),
      properties: convertProperties(f.properties),
    }));
  return { ...fc, features };
}

function convertProperties(f: MilXSymbolProperties): MilSymbolProperties {
  const props: MilSymbolProperties = { sidc: convertLetterSidc2NumberSidc(f.ID).sidc };
  if (f.M) props.higherFormation = f.M;
  if (f.T) props.name = f.T;
  if (f.XO) props.fillColor = convertColor(f.XO);
  for (const key of supportedAttributes) {
    if (key in f) {
      //@ts-ignore
      props[textAmpMap[key]] = f[key];
    }
  }
  return props;
}

function convertColor(milxColor: string): string {
  const a = milxColor.substring(1, 3);
  const b = milxColor.substring(3, 5);
  const g = milxColor.substring(5, 7);
  const r = milxColor.substring(7, 9);
  return "#" + r + g + b;
}

function getLayerName(node: Element): string | null {
  const nameNode = getOneElement(node, "Name");
  return nodeValue(nameNode);
}

function getCoordinateSystem(node: Element): string | null {
  const nameNode = getOneElement(node, "CoordSystemType");
  return nodeValue(nameNode);
}

function getGraphics(node: Element): MilXGeoJsonCollection {
  const features = getElements(node, "MilXGraphic").map(getGraphic);
  return { type: "FeatureCollection", features };
}

function getGraphic(node: Element): MilXFeature {
  const points = getElements(node, "Point").map((p) => [
    +nodeValue(getOneElement(p, "X")),
    +nodeValue(getOneElement(p, "Y")),
  ]);
  const isPoint = points.length === 1;
  const geometry: Point | LineString = isPoint
    ? { type: "Point", coordinates: points[0] }
    : { type: "LineString", coordinates: points };
  return { type: "Feature", geometry, properties: getSymbol(node) };
}

function getSymbol(node: Element): MilXSymbolProperties {
  const n = createFromString(nodeValue(getOneElement(node, "MssStringXML")));
  const symbElement = getOneElement(n, "Symbol");
  const ID = symbElement?.getAttribute("ID") || "";
  const attributes = Object.fromEntries(
    getElements(symbElement!, "Attribute").map((e) => [
      e.getAttribute("ID"),
      nodeValue(e),
    ]),
  );
  return { ID, ...attributes };
}
