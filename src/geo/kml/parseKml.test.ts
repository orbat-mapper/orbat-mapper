import { describe, expect, it } from "vitest";
import { imageCache } from "@/importexport/fileHandling";
import { parseKmlColor } from "@/geo/kml/kmlColor";
import { loadKmlLayerData } from "@/geo/kml/parseKml";

const styledKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Style id="shared">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.5</scale>
        <Icon><href>icons/marker.png</href></Icon>
      </IconStyle>
      <LabelStyle>
        <color>ccffffff</color>
        <scale>0.8</scale>
      </LabelStyle>
      <LineStyle>
        <color>7f0000ff</color>
        <width>4</width>
      </LineStyle>
      <PolyStyle>
        <color>4000ff00</color>
        <outline>0</outline>
      </PolyStyle>
    </Style>
    <Style id="highlight">
      <LineStyle><color>ffffffff</color><width>8</width></LineStyle>
    </Style>
    <StyleMap id="mapped">
      <Pair><key>normal</key><styleUrl>#shared</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#highlight</styleUrl></Pair>
    </StyleMap>
    <Placemark id="point-1">
      <name>Point A</name>
      <description><![CDATA[<p>Description</p>]]></description>
      <styleUrl>#mapped</styleUrl>
      <ExtendedData><Data name="role"><value>test</value></Data></ExtendedData>
      <Point><coordinates>10,20,0</coordinates></Point>
    </Placemark>
    <Placemark id="poly-1">
      <name>Area</name>
      <styleUrl>#shared</styleUrl>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>10,20 12,20 12,22 10,22 10,20</coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>
  </Document>
</kml>`;

const multiGeometryKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark id="mixed-1">
      <name>Mixed placemark</name>
      <MultiGeometry>
        <Point><coordinates>10,20,0</coordinates></Point>
        <LineString><coordinates>10,20,0 11,21,0</coordinates></LineString>
      </MultiGeometry>
    </Placemark>
    <Placemark id="line-1">
      <name>Line only</name>
      <LineString><coordinates>12,20,0 13,21,0</coordinates></LineString>
    </Placemark>
  </Document>
</kml>`;

describe("KML parser", () => {
  it("converts KML colors from aabbggrr to CSS color and opacity", () => {
    expect(parseKmlColor("7f0000ff")).toEqual({
      color: "#ff0000",
      opacity: 127 / 255,
    });
  });

  it("loads KML as GeoJSON with reusable normalized style properties", async () => {
    imageCache.set("icons/marker.png", "blob:marker");
    const result = await loadKmlLayerData(styledKml, {
      layerId: "kml-1",
      layerName: "KML Layer",
      extractStyles: true,
      showPointNames: true,
    });

    const point = result.features.find((feature) => feature.id === "point-1");
    expect(point?.properties).toMatchObject({
      __kmlLayerId: "kml-1",
      __kmlLayerName: "KML Layer",
      __kmlName: "Point A",
      __kmlDescription: "<p>Description</p>",
      __kmlLabel: "Point A",
      __kmlIconHref: "blob:marker",
      __kmlIconScale: 1.5,
      __kmlStrokeColor: "#ff0000",
      __kmlStrokeWidth: 4,
      __kmlFillColor: "#00ff00",
      __kmlLabelColor: "#ffffff",
      role: "test",
    });
    expect(point?.properties.__kmlStrokeOpacity).toBeCloseTo(127 / 255);
    expect(point?.properties.__kmlFillOpacity).toBeCloseTo(64 / 255);
    expect(result.icons.size).toBe(1);
    expect(result.bbox).toEqual([10, 20, 12, 22]);
    imageCache.delete("icons/marker.png");
  });

  it("suppresses extracted styles and point labels when options disable them", async () => {
    const result = await loadKmlLayerData(styledKml, {
      layerId: "kml-1",
      layerName: "KML Layer",
      extractStyles: false,
      showPointNames: false,
    });
    const point = result.features.find((feature) => feature.id === "point-1");

    expect(point?.properties.__kmlLabel).toBeUndefined();
    expect(point?.properties.__kmlIconHref).toBeUndefined();
    expect(point?.properties.__kmlStrokeColor).toBeUndefined();
    expect(result.icons.size).toBe(0);
  });

  it("labels placemarks whose geometry collections contain points", async () => {
    const result = await loadKmlLayerData(multiGeometryKml, {
      layerId: "kml-1",
      layerName: "KML Layer",
      extractStyles: false,
      showPointNames: true,
    });

    const mixed = result.features.find((feature) => feature.id === "mixed-1");
    const line = result.features.find((feature) => feature.id === "line-1");

    expect(mixed?.properties.__kmlLabel).toBe("Mixed placemark");
    expect(line?.properties.__kmlLabel).toBeUndefined();
  });
});
