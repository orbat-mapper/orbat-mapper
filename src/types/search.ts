export interface PhotonFeatureProperties {
  name: string;
  country?: string;
  city?: string;
  state?: string;
  extent?: number[];
  osm_key?: string;
}

export interface GeoSearchProperties {
  name: string;
  country?: string;
  city?: string;
  state?: string;
  extent?: number[];
  category?: string;
  distance?: number;
}
