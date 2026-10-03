import type { Position } from "geojson";
import { createFromString } from "./domutils";

/** One MilX graphic, read without interpretation. `points` are the MSS control
 *  points in file order — construction anchors, not rendered vertices. */
export interface MilXGraphic {
  name: string;
  /** The letter SIDC from the MSS symbol XML. */
  sidc: string;
  /** The MSS symbol's `<Attribute ID="…">` modifiers, e.g. `T` or `XO`. */
  attributes: Record<string, string>;
  /** The free-format graphic style from the `XM` attribute, as written. */
  style: MilXStyle;
  /** The free-format text from the `XN` attribute, RTF as written. */
  text: string;
  points: Position[];
  /** Location attributes such as `Width` or `Radius`, in meters. */
  locationAttributes: Record<string, number>;
  corridor: boolean;
}

/** The `XM` attribute's elements, each a map of its XML attributes, e.g.
 *  `{ Line: { Color: "clRed" }, Fill: { StyleEx: "bsSolidGS" } }`. */
export type MilXStyle = Partial<Record<"Line" | "Fill" | "Text", Record<string, string>>>;

export interface MilXLayer {
  name: string;
  coordinateSystem: string;
  graphics: MilXGraphic[];
}

export interface MilXDocument {
  layers: MilXLayer[];
}

const children = (element: Element, name: string) =>
  Array.from(element.children).filter((child) => child.localName === name);

const child = (element: Element, name: string): Element | undefined =>
  children(element, name)[0];

const text = (element: Element | undefined) => element?.textContent?.trim() ?? "";

function parseXml(source: string): Document | null {
  const document = createFromString(source.replace(/^\uFEFF/, ""));
  return document.getElementsByTagName("parsererror").length ? null : document;
}

function parseStyle(element: Element): MilXStyle {
  const style: MilXStyle = {};
  for (const name of ["Line", "Fill", "Text"] as const) {
    const part = child(element, name);
    if (part)
      style[name] = Object.fromEntries(
        Array.from(part.attributes, (a) => [a.name, a.value]),
      );
  }
  return style;
}

/** The symbol code and modifiers. The free-format style and text are content,
 *  not amplifiers, so they are held apart from `attributes`. */
function parseSymbol(
  xml: string,
): Pick<MilXGraphic, "sidc" | "attributes" | "style" | "text"> {
  const symbol = xml ? parseXml(xml)?.documentElement : undefined;
  const result = {
    sidc: "",
    attributes: {} as Record<string, string>,
    style: {},
    text: "",
  };
  if (!symbol || symbol.localName !== "Symbol") return result;
  result.sidc = (symbol.getAttribute("ID") ?? "").trim().toUpperCase();
  for (const attribute of children(symbol, "Attribute")) {
    const id = attribute.getAttribute("ID");
    if (id === "XM") result.style = parseStyle(attribute);
    else if (id === "XN") result.text = attribute.textContent ?? "";
    else if (id) result.attributes[id] = attribute.textContent ?? "";
  }
  return result;
}

function parseGraphic(element: Element): MilXGraphic {
  const pointList = child(element, "PointList");
  const points = (pointList ? children(pointList, "Point") : []).map((point) => [
    Number.parseFloat(text(child(point, "X"))),
    Number.parseFloat(text(child(point, "Y"))),
  ]);
  const locationAttributes: Record<string, number> = {};
  const locationList = child(element, "LocationAttributeList");
  for (const attribute of locationList
    ? children(locationList, "LocationAttribute")
    : []) {
    const type = text(child(attribute, "AttrType"));
    const value = Number.parseFloat(text(child(attribute, "Value")));
    if (type && Number.isFinite(value)) locationAttributes[type] = value;
  }
  const corridor = text(child(element, "IsMIPCorridorPointList"));
  return {
    name: text(child(element, "Name")),
    ...parseSymbol(text(child(element, "MssStringXML"))),
    points,
    locationAttributes,
    corridor: corridor === "1" || corridor === "true",
  };
}

/** Read the layers of one MilX XML document. Throws when it is not MilX. */
export function parseMilX(source: string): MilXDocument {
  const document = parseXml(source);
  if (!document || !document.documentElement.localName.startsWith("MilXDocument"))
    throw new Error("This is not a MilX layer file.");
  const layers = Array.from(document.getElementsByTagName("MilXLayer")).map((layer) => {
    const graphicList = child(layer, "GraphicList");
    return {
      name: text(child(layer, "Name")),
      // MilX omits default fields; WGS84 is the default coordinate system.
      coordinateSystem: text(child(layer, "CoordSystemType")) || "WGS84",
      graphics: (graphicList ? children(graphicList, "MilXGraphic") : []).map(
        parseGraphic,
      ),
    };
  });
  return { layers };
}
