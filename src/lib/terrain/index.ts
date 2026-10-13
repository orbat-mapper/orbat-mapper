/**
 * DEM-based terrain analysis: elevation profiles and viewsheds. Copied as is
 * from tactrace's `src/lib/terrain`, the future `@orbat-mapper/terrain`
 * package, so keep the two in step until it is published. It imports nothing
 * from the app, Vue or a map library. GeoJSON `[lng, lat]` goes in;
 * metres, typed arrays and GeoJSON come out. App code imports only this file.
 */
export { decodeDem, demEncoding, type DemEncoding } from "./dem";
export {
  densifyLine,
  lineLength,
  EARTH_RADIUS,
  type DenseLine,
  type LngLat,
} from "./line";
export {
  elevationProfile,
  profileIndexAt,
  profileStats,
  type ElevationProfile,
  type ElevationProfileOptions,
  type ProfileStats,
} from "./profile";
export {
  createElevationSampler,
  type DemImage,
  type DemTileProvider,
  type ElevationSampler,
  type ElevationSamplerOptions,
  type SampleOptions,
} from "./sampler";
export {
  cellAt,
  gridAround,
  gridPositions,
  gridSizeFor,
  sampleGrid,
  type DemGrid,
  type GridDetail,
  type GridSizeOptions,
} from "./grid";
export {
  clipToFan,
  heightsToRgba,
  maskingHeights,
  maskToRgba,
  viewshed,
  visibleAt,
  visibleShare,
  Visibility,
  type MaskingOptions,
  type RangeFan,
  type Rgba,
  type ViewshedOptions,
} from "./viewshed";
export { maskToPolygons } from "./outline";
export { combineViewsheds, type Coverage } from "./coverage";
export {
  connectViewshedService,
  serveViewsheds,
  type MessagePortLike,
  type ViewshedClient,
  type ViewshedRequest,
  type ViewshedResult,
} from "./viewshedService";
export { startViewshedWorker } from "./viewshedWorkerClient";
export {
  curvatureDrop,
  lineOfSight,
  STANDARD_REFRACTION,
  type LineOfSight,
  type LineOfSightOptions,
} from "./lineOfSight";
export {
  urlTemplateProvider,
  type UrlTemplateProviderOptions,
} from "./urlTemplateProvider";
