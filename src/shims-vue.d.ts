declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "formatcoords";
declare module "mgrs";
declare module "ol-ext/layer/GeoImage";
declare module "ol-ext/source/GeoImage";
declare module "ol-ext/interaction/Transform";
declare module "ol-ext/source/DayNight";
declare module "ol-ext/layer/AnimatedCluster";
