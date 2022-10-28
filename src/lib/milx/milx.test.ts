import { expect, describe, it } from "vitest";
import { createFromString, getElements, nodeValue } from "./domutils";
import { getMilXLayers } from "@/lib/milx/index";

const TEST_DOCUMENT = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<MilXDocument_Layer xmlns="http://gs-soft.com/MilX/V3.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<MssLibraryVersionTag>2022.04.12</MssLibraryVersionTag>
	<MilXLayer>
		<Name>Friend</Name>
		<LayerType>Normal</LayerType>
		<GraphicList>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFGPUCIA---F--G"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-59.0238516414698</X>
						<Y>-51.5929697062433</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFGPUCIA---D--G"&gt;&lt;Attribute ID="M"&gt;3&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-58.9290235662824</X>
						<Y>-51.6476401835131</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFGPUCIL---C---"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-58.9307169247679</X>
						<Y>-51.7064424405543</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFGPUCFHE------"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-59.1322265845412</X>
						<Y>-51.7305712518241</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFSPCPSB------G"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-59.2321347351851</X>
						<Y>-51.4887033982753</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SFSPCPSUG-----G"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-59.2829354897498</X>
						<Y>-51.5740299627017</Y>
					</Point>
				</PointList>
			</MilXGraphic>
		</GraphicList>
		<CoordSystemType>WGS84</CoordSystemType>
		<ViewScale>0.1</ViewScale>
		<SymbolSize>1</SymbolSize>
	</MilXLayer>
	<MilXLayer>
		<Name>Hostile</Name>
		<LayerType>Normal</LayerType>
		<GraphicList>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SHGPUCIM---E---"&gt;&lt;Attribute ID="T"&gt;2BN&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-58.7055543079458</X>
						<Y>-51.5875685609539</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SHGPUCIM---E---"&gt;&lt;Attribute ID="T"&gt;2BN&lt;/Attribute&gt;&lt;/Symbol&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-58.2992663717653</X>
						<Y>-51.6817459899647</Y>
					</Point>
				</PointList>
			</MilXGraphic>
			<MilXGraphic>
				<MssStringXML>&lt;Symbol ID="SHGPUCI---AE---"/&gt;</MssStringXML>
				<PointList>
					<Point>
						<X>-58.257401739176</X>
						<Y>-51.7690966638132</Y>
					</Point>
				</PointList>
			</MilXGraphic>
		</GraphicList>
		<CoordSystemType>WGS84</CoordSystemType>
		<ViewScale>0.1</ViewScale>
		<SymbolSize>1</SymbolSize>
	</MilXLayer>
</MilXDocument_Layer>
`;

describe("Convert from MilX", function () {
  it("parses layer name", () => {
    const dom = createFromString(TEST_DOCUMENT);
    const layers = getMilXLayers(dom);
    console.log("helloe", JSON.stringify(layers, null, 2));
    expect(layers.length).toBe(2);
    expect(layers[0].name).toBe("Friend");
    expect(layers[1].name).toBe("Hostile");
  });
  it("parses coordinate system", () => {
    const dom = createFromString(TEST_DOCUMENT);
    const layers = getMilXLayers(dom);
    expect(layers.length).toBe(2);
    expect(layers[0].coordSystemType).toBe("WGS84");
  });

  it("creates geojson", () => {
    const dom = createFromString(TEST_DOCUMENT);
    const layers = getMilXLayers(dom);
    const layer = layers[0];
    expect(layer.featureCollection.type).toBe("FeatureCollection");
    expect(layer.featureCollection.features.length).toBe(6);
  });

  const dom = createFromString(TEST_DOCUMENT);
  const layers = getMilXLayers(dom);
  const feature1 = layers[0].featureCollection.features[0];
  const feature2 = layers[0].featureCollection.features[1];

  it("parses symbol code", () => {
    expect(feature1.properties.ID).toBe("SFGPUCIA---F--G");
  });

  it("parses attributes", () => {
    expect(feature2.properties.ID).toBe("SFGPUCIA---D--G");
    expect(feature2.properties.M).toBe("3");
  });
});
