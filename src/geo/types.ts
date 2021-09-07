import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";

export type PointVectorLayer = VectorLayer<VectorSource<Point>>;
export type AnyVectorLayer = VectorLayer<VectorSource<any>>;
export type AnyTileLayer = TileLayer<any>;
