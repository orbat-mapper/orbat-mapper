import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import type { Options as OSMOptions } from "ol/source/OSM";
import OSM from "ol/source/OSM";
import type { Options as XYZOptions } from "ol/source/XYZ";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";

const osmOptions: OSMOptions = {
  crossOrigin: "anonymous",
};

const osmDEOptions: OSMOptions = {
  url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
  crossOrigin: "anonymous",
};

const grayBasemapOptions: XYZOptions = {
  attributions:
    'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
    'rest/services/World_Light_Gray_Base/MapServer">ArcGIS</a>',
  url:
    "https://server.arcgisonline.com/ArcGIS/rest/services/" +
    "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  crossOrigin: "anonymous",
};

const openTopoMapOptions: XYZOptions = {
  url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  maxZoom: 14,
  crossOrigin: "anonymous",
  attributions:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
};

const esriWorldImageryOptions: XYZOptions = {
  crossOrigin: "anonymous",
  transition: 0, // should be set to 0 when opacity is < 1
  attributions:
    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const kartverketTopo4Options: XYZOptions = {
  crossOrigin: "anonymous",
  url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
  attributions: '<a href="http://www.kartverket.no/">Kartverket</a>',
};

export async function createBaseLayers(view: View, currentBaseLayerName = "osm") {
  const openStreetMapLayer = new TileLayer({
    source: new OSM(osmOptions),
    visible: currentBaseLayerName === "osm",
    preload: Infinity,
    properties: {
      title: "OSM",
      name: "osm",
      layerType: "baselayer",
    },
  });

  const openStreetMapLayerDE = new TileLayer({
    source: new OSM(osmDEOptions),
    visible: currentBaseLayerName === "osm-de",
    preload: Infinity,
    properties: {
      title: "OSM (DE)",
      name: "osm-de",
      layerType: "baselayer",
    },
  });
  const lightGrayLayer = new TileLayer({
    preload: Infinity,
    visible: currentBaseLayerName === "grayBasemap",
    source: new XYZ(grayBasemapOptions),
    properties: {
      title: "Gray Basemap",
      name: "grayBasemap",
      layerType: "baselayer",
    },
  });

  const openTopoMap = new TileLayer({
    source: new XYZ(openTopoMapOptions),
    visible: currentBaseLayerName === "openTopoMap",
    properties: {
      title: "Open topo map",
      name: "openTopoMap",
      layerType: "baselayer",
    },
  });

  const esriWorldImagery = new TileLayer({
    preload: Infinity,
    visible: currentBaseLayerName === "esriWorldImagery",
    source: new XYZ(esriWorldImageryOptions),
    properties: {
      name: "esriWorldImagery",
      title: "ESRI World imagery",
      layerType: "baselayer",
    },
  });

  const kartverketTopo4 = new TileLayer({
    visible: currentBaseLayerName === "kartverketTopo4",
    source: new XYZ(kartverketTopo4Options),
    properties: {
      title: "Topographic Map Norway",
      name: "kartverketTopo4",
      layerType: "baselayer",
    },
    extent: transformExtent([2, 57, 33, 72], "EPSG:4326", view.getProjection()),
  });

  return [
    openStreetMapLayer,
    openStreetMapLayerDE,
    lightGrayLayer,
    openTopoMap,
    esriWorldImagery,
    kartverketTopo4,
  ];
}
