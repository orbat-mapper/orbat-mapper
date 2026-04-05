import { ref, watch, type ShallowRef } from "vue";
import type { Map as MlMap, LngLatBounds, GeoJSONSource } from "maplibre-gl";
import { polygonToCells, cellToBoundary, getRes0Cells } from "h3-js";
import type { Feature, FeatureCollection, Polygon } from "geojson";

const H3_SOURCE = "h3HexSource";
const H3_LAYER_FILL = "h3HexFill";
const H3_LAYER_LINE = "h3HexLine";

/** Max cells to render before skipping (perf guard) */
const MAX_CELLS = 20_000;

function getViewportCells(bounds: LngLatBounds, resolution: number): string[] {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // Handle anti-meridian wrapping
  let west = sw.lng;
  let east = ne.lng;
  if (west > east) east += 360;

  const polygon = [
    [west, sw.lat],
    [east, sw.lat],
    [east, ne.lat],
    [west, ne.lat],
    [west, sw.lat],
  ];

  return polygonToCells([polygon], resolution, true);
}

function cellsToGeoJSON(cells: string[]): FeatureCollection<Polygon> {
  const features: Feature<Polygon>[] = cells.map((cell) => {
    const boundary = cellToBoundary(cell, true); // GeoJSON [lng, lat] order
    boundary.push(boundary[0]); // close the ring
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [boundary],
      },
    };
  });
  return { type: "FeatureCollection", features };
}

/** Approximate H3 resolution from map zoom level */
function zoomToDefaultResolution(zoom: number): number {
  if (zoom < 2) return 0;
  if (zoom < 3) return 1;
  if (zoom < 4.5) return 2;
  if (zoom < 6) return 3;
  if (zoom < 7.5) return 4;
  if (zoom < 9) return 5;
  if (zoom < 10.5) return 6;
  if (zoom < 12) return 7;
  return 8;
}

export function useH3HexGrid(mlMap: ShallowRef<MlMap | undefined>) {
  const showHexGrid = ref(false);
  const hexResolution = ref(2);
  const autoResolution = ref(true);

  function ensureLayers(map: MlMap) {
    if (!map.getSource(H3_SOURCE)) {
      map.addSource(H3_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getLayer(H3_LAYER_FILL)) {
      map.addLayer(
        {
          id: H3_LAYER_FILL,
          type: "fill",
          source: H3_SOURCE,
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.06,
          },
        },
        "unitLayer",
      );
    }
    if (!map.getLayer(H3_LAYER_LINE)) {
      map.addLayer(
        {
          id: H3_LAYER_LINE,
          type: "line",
          source: H3_SOURCE,
          paint: {
            "line-color": "#3b82f6",
            "line-opacity": 0.4,
            "line-width": 1,
          },
        },
        "unitLayer",
      );
    }
  }

  function updateGrid() {
    const map = mlMap.value;
    if (!map || !showHexGrid.value) return;

    ensureLayers(map);

    const zoom = map.getZoom();
    const res = autoResolution.value ? zoomToDefaultResolution(zoom) : hexResolution.value;
    if (autoResolution.value) hexResolution.value = res;

    let cells: string[];
    if (res === 0) {
      cells = getRes0Cells();
    } else {
      const bounds = map.getBounds();
      cells = getViewportCells(bounds, res);
    }

    if (cells.length > MAX_CELLS) {
      cells = cells.slice(0, MAX_CELLS);
    }

    const source = map.getSource(H3_SOURCE) as GeoJSONSource | undefined;
    if (source) {
      source.setData(cellsToGeoJSON(cells));
    }
  }

  function clearGrid() {
    const map = mlMap.value;
    if (!map) return;
    const source = map.getSource(H3_SOURCE) as GeoJSONSource | undefined;
    if (source) {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }

  function onMoveEnd() {
    updateGrid();
  }

  function onStyleLoad() {
    if (showHexGrid.value) updateGrid();
  }

  watch(
    mlMap,
    (map, oldMap) => {
      if (oldMap) {
        oldMap.off("moveend", onMoveEnd);
        oldMap.off("style.load", onStyleLoad);
      }
      if (map) {
        map.on("moveend", onMoveEnd);
        map.on("style.load", onStyleLoad);
        if (showHexGrid.value) updateGrid();
      }
    },
    { immediate: true },
  );

  watch(showHexGrid, (val) => {
    if (val) {
      updateGrid();
    } else {
      clearGrid();
    }
  });

  watch(hexResolution, () => {
    if (showHexGrid.value && !autoResolution.value) updateGrid();
  });

  watch(autoResolution, () => {
    if (showHexGrid.value) updateGrid();
  });

  return {
    showHexGrid,
    hexResolution,
    autoResolution,
    updateGrid,
  };
}
