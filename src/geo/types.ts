import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import Feature from "ol/Feature";
import { Geometry, Point } from "ol/geom";

export type PointVectorLayer = VectorLayer<Feature<Point>>;
export type AnyVectorLayer = VectorLayer<Feature<Geometry>>;
export type AnyTileLayer = TileLayer<any>;
