import { ref } from "vue";
import { useFetch } from "@vueuse/core";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { GeoSearchProperties, PhotonFeatureProperties } from "@/types/search";

export interface GeoSearchOptions {
  mapCenter?: number[] | null;
  limit?: number;
  lang?: string;
}

export type PhotonSearchResult = Feature<Point, GeoSearchProperties>;

export function useGeoSearch() {
  const searchUrl = ref("");
  const { data, isFetching, error, execute } = useFetch(searchUrl, {
    immediate: false,
  })
    .get()
    .json<FeatureCollection<Point, PhotonFeatureProperties>>();

  async function photonSearch(
    q: string,
    options: GeoSearchOptions = {},
  ): Promise<PhotonSearchResult[]> {
    const { mapCenter, limit = 10, lang = "en" } = options;
    searchUrl.value = `https://photon.komoot.io/api/?q=${q}&limit=${limit}&lang=${lang}`;
    if (mapCenter) {
      const [lon, lat] = mapCenter;
      searchUrl.value += `&lon=${lon}&lat=${lat}`;
    }
    await execute();
    if (data.value) {
      return data.value.features.map((item) => {
        return {
          ...item,
          properties: {
            name: item.properties.name,
            country: item.properties.country,
            city: item.properties.city,
            state: item.properties.state,
            extent: item.properties.extent,
            category: item.properties.osm_key,
          },
        } as PhotonSearchResult;
      });
    } else return [];
  }
  return { isFetching, photonSearch };
}
