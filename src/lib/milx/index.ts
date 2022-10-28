import {
  createFromString,
  getElements,
  getOneElement,
  nodeValue,
} from "@/lib/milx/domutils";
import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";

type CoordinateSystem = "WGS84" | string;

export interface MilXSymbolProperties {
  ID: string;
  M?: string;
}

type MilXGeoJsonCollection = FeatureCollection<Point | LineString, MilXSymbolProperties>;
type MilXFeature = Feature<Point | LineString, MilXSymbolProperties>;

export interface MilXLayer {
  name?: string | null;
  coordSystemType?: CoordinateSystem;
  featureCollection: MilXGeoJsonCollection;
}

interface MilXGraphic {
  symbol?: {};
  points: Position[];
}

export function getMilXLayers(node: Document | Element): MilXLayer[] {
  const layers = getElements(node, "MilXLayer");

  return layers.map((layerElement) => ({
    name: getLayerName(layerElement),
    coordSystemType: getCoordinateSystem(layerElement) || "WGS84",
    featureCollection: getGraphics(layerElement),
  }));
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
    ])
  );
  return { ID, ...attributes };
}
