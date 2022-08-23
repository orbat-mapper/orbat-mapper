/**
 * Original code by Tom MacWright https://github.com/placemark/tokml
 */
import { u } from "unist-builder";
import { x } from "xastscript";
import type { Element } from "xast";
import type { Root, Folder } from "@tmcw/togeojson";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { toXml } from "xast-util-to-xml";

type F = Feature<Geometry | null>;

const BR = u("text", "\n");
const TAB = u("text", "  ");

type Literal = typeof BR;

/**
 * Convert nested folder structure to KML. This expects
 * input that follows the same patterns as [toGeoJSON](https://github.com/placemark/togeojson)'s
 * kmlWithFolders method: a tree of folders and features,
 * starting with a root element.
 */
export function foldersToKML(root: Root, styles: any[] = []): string {
  return toXml(
    u("root", [
      x(
        "kml",
        { xmlns: "http://www.opengis.net/kml/2.2" },
        x(
          "Document",
          styles.flatMap((style) => convertStyle(style)),
          root.children.flatMap((child) => convertChild(child))
        )
      ),
    ])
  );
}

function convertStyle(sidc: string) {
  return [
    BR,
    x("Style", { id: `sidc${sidc}` }, [
      x("IconStyle", [x("Icon", [x("href", [u("text", `icons/${sidc}.png`)])])]),
    ]),
  ];
}

/**
 * Convert a GeoJSON FeatureCollection to a string of
 * KML data.
 */
export function toKML(featureCollection: FeatureCollection<Geometry | null>): string {
  return toXml(
    u("root", [
      x(
        "kml",
        { xmlns: "http://www.opengis.net/kml/2.2" },
        x(
          "Document",
          featureCollection.features.flatMap((feature) => convertFeature(feature))
        )
      ),
    ])
  );
}

function convertChild(child: F | Folder) {
  switch (child.type) {
    case "Feature":
      return convertFeature(child);
    case "folder":
      return convertFolder(child);
  }
}

function convertFolder(folder: Folder): Array<Literal | Element> {
  const id = ["string", "number"].includes(typeof folder.meta.id)
    ? {
        id: String(folder.meta.id),
      }
    : {};
  return [
    BR,
    x("Folder", id, [
      BR,
      ...folderMeta(folder.meta),
      BR,
      TAB,
      ...folder.children.flatMap((child) => convertChild(child)),
    ]),
  ];
}

const META_PROPERTIES = [
  "address",
  "description",
  "name",
  "open",
  "visibility",
  "phoneNumber",
] as const;

function folderMeta(meta: Folder["meta"]): Element[] {
  return META_PROPERTIES.filter((p) => meta[p] !== undefined).map((p) => {
    return x(p, [u("text", String(meta[p]))]);
  });
}

function convertFeature(feature: F) {
  const { id } = feature;
  const idMember = ["string", "number"].includes(typeof id)
    ? {
        id: id,
      }
    : {};
  return [
    BR,
    x("Placemark", idMember, [
      BR,
      ...propertiesToTags(feature.properties),
      BR,
      TAB,
      ...(feature.geometry ? [convertGeometry(feature.geometry)] : []),
    ]),
  ];
}

function join(position: Position): string {
  return `${position[0]},${position[1]}`;
}

function coord1(coordinates: Position): Element {
  return x("coordinates", [u("text", join(coordinates))]);
}

function coord2(coordinates: Position[]): Element {
  return x("coordinates", [u("text", coordinates.map(join).join("\n"))]);
}

function toString(value: any): string {
  switch (typeof value) {
    case "string": {
      return value;
    }
    case "boolean":
    case "number": {
      return String(value);
    }
    case "object": {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "";
      }
    }
  }
  return "";
}

function maybeCData(value: any) {
  if (
    value &&
    typeof value === "object" &&
    "@type" in value &&
    value["@type"] === "html" &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return u("cdata", value.value);
  }

  return toString(value);
}

function propertiesToTags(properties: Feature["properties"]): Element[] {
  if (!properties) return [];
  const { name, description, visibility, styleUrl, ...otherProperties } = properties;

  return [
    name && x("name", [u("text", toString(name))]),
    description && x("description", [u("text", maybeCData(description))]),
    styleUrl && x("styleUrl", [u("text", toString(styleUrl))]),
    visibility !== undefined && x("visibility", [u("text", visibility ? "1" : "0")]),
    x(
      "ExtendedData",
      Object.entries(otherProperties).flatMap(([name, value]) => [
        BR,
        TAB,
        x("Data", { name: name }, [
          x("value", [
            u("text", typeof value === "string" ? value : JSON.stringify(value)),
          ]),
        ]),
      ])
    ),
  ].filter(Boolean);
}

const linearRing = (ring: Position[]): Element => x("LinearRing", [coord2(ring)]);

function convertMultiPoint(geometry: GeoJSON.MultiPoint): Element {
  return x(
    "MultiGeometry",
    geometry.coordinates.flatMap((coordinates) => [
      BR,
      convertGeometry({
        type: "Point",
        coordinates,
      }),
    ])
  );
}
function convertMultiLineString(geometry: GeoJSON.MultiLineString): Element {
  return x(
    "MultiGeometry",
    geometry.coordinates.flatMap((coordinates) => [
      BR,
      convertGeometry({
        type: "LineString",
        coordinates,
      }),
    ])
  );
}

function convertMultiPolygon(geometry: GeoJSON.MultiPolygon): Element {
  return x(
    "MultiGeometry",
    geometry.coordinates.flatMap((coordinates) => [
      BR,
      convertGeometry({
        type: "Polygon",
        coordinates,
      }),
    ])
  );
}

function convertPolygon(geometry: GeoJSON.Polygon): Element {
  const [outerBoundary, ...innerRings] = geometry.coordinates;
  return x("Polygon", [
    BR,
    x("outerBoundaryIs", [BR, TAB, linearRing(outerBoundary)]),
    ...innerRings.flatMap((innerRing) => [
      BR,
      x("innerBoundaryIs", [BR, TAB, linearRing(innerRing)]),
    ]),
  ]);
}

function convertGeometry(geometry: Geometry): Element {
  switch (geometry.type) {
    case "Point":
      return x("Point", [coord1(geometry.coordinates)]);
    case "MultiPoint":
      return convertMultiPoint(geometry);
    case "LineString":
      return x("LineString", [coord2(geometry.coordinates)]);
    case "MultiLineString":
      return convertMultiLineString(geometry);
    case "Polygon":
      return convertPolygon(geometry);
    case "MultiPolygon":
      return convertMultiPolygon(geometry);
    case "GeometryCollection":
      return x(
        "MultiGeometry",
        geometry.geometries.flatMap((geometry) => [BR, convertGeometry(geometry)])
      );
  }
}
