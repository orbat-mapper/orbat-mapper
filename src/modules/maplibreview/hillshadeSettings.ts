import type { HillshadeLayerSpecification } from "maplibre-gl";

export interface HillshadeSettings {
  strength: number;
  direction: number;
  anchor: "map" | "viewport";
  shadowColor: string;
  highlightColor: string;
  accentColor: string;
}

export const DEFAULT_HILLSHADE_SETTINGS: Readonly<HillshadeSettings> = {
  strength: 0.5,
  direction: 315,
  anchor: "map",
  shadowColor: "#000000",
  highlightColor: "#ffffff",
  accentColor: "#000000",
};

export function hillshadePaint(settings: HillshadeSettings) {
  return {
    "hillshade-exaggeration": settings.strength,
    "hillshade-illumination-direction": settings.direction,
    "hillshade-illumination-anchor": settings.anchor,
    "hillshade-shadow-color": settings.shadowColor,
    "hillshade-highlight-color": settings.highlightColor,
    "hillshade-accent-color": settings.accentColor,
  } satisfies HillshadeLayerSpecification["paint"];
}
