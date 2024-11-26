import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import type { Options as TileLayerOptions } from "ol/layer/BaseTile";
import type { Options as OSMOptions } from "ol/source/OSM";
import OSM from "ol/source/OSM";
import type { Options as XYZOptions } from "ol/source/XYZ";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import { klona } from "klona";

interface BaseLayerConfig {
  title: string;
  name: string;
  layerSourceType?: "osm" | "xyz";
  layerType: "baselayer";
  tileLayerConfig?: Exclude<TileLayerOptions<any>, "source" | "map" | "properties">;
}

interface XYZLayerConfig extends BaseLayerConfig {
  layerSourceType: "xyz";
  sourceOptions: XYZOptions;
}

interface OSMLayerConfig extends BaseLayerConfig {
  layerSourceType: "osm";
  sourceOptions: OSMOptions;
}

type LayerConfig = XYZLayerConfig | OSMLayerConfig;

const layers: LayerConfig[] = [
  {
    title: "OSM",
    name: "osm",
    layerType: "baselayer",
    layerSourceType: "osm",
    sourceOptions: {
      crossOrigin: "anonymous",
    },
  },
  {
    title: "OSM (DE)",
    name: "osm-de",
    layerType: "baselayer",
    layerSourceType: "osm",
    sourceOptions: {
      url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
      crossOrigin: "anonymous",
    },
  },
  {
    title: "Gray Basemap",
    name: "grayBasemap",
    layerType: "baselayer",
    layerSourceType: "xyz",
    sourceOptions: {
      attributions:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/World_Light_Gray_Base/MapServer">ArcGIS</a>',
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/" +
        "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      crossOrigin: "anonymous",
    },
  },
  {
    title: "Open topo map",
    name: "openTopoMap",
    layerType: "baselayer",
    layerSourceType: "xyz",
    sourceOptions: {
      url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 14,
      crossOrigin: "anonymous",
      attributions:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    },
  },
  {
    title: "ESRI World imagery",
    name: "esriWorldImagery",
    layerType: "baselayer",
    layerSourceType: "xyz",
    sourceOptions: {
      crossOrigin: "anonymous",
      transition: 0, // should be set to 0 when opacity is < 1
      attributions:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
  },
  {
    title: "Topographic Map Norway",
    name: "kartverketTopo4",
    layerType: "baselayer",
    layerSourceType: "xyz",
    sourceOptions: {
      crossOrigin: "anonymous",
      url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
      attributions: '<a href="http://www.kartverket.no/">Kartverket</a>',
    },
    tileLayerConfig: {
      extent: [2, 57, 33, 72],
    },
  },
];

export async function createBaseLayers(view: View, currentBaseLayerName = "osm") {
  return layers.map((layerConfig) => {
    const { layerSourceType, layerType, title, name, tileLayerConfig } =
      klona(layerConfig);

    if (tileLayerConfig?.extent) {
      tileLayerConfig.extent = transformExtent(
        tileLayerConfig.extent,
        "EPSG:4326",
        view.getProjection(),
      );
    }

    const properties = { title, name, layerType };

    let source;
    if (layerSourceType === "osm") {
      source = new OSM(layerConfig.sourceOptions);
    } else if (layerSourceType === "xyz") {
      source = new XYZ(layerConfig.sourceOptions);
    }

    return new TileLayer({
      source,
      properties,
      visible: currentBaseLayerName === layerConfig.name,
      preload: Infinity,
      ...tileLayerConfig,
    });
  });
}
