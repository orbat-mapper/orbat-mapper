/**
 * Basemaps the user adds by address, at runtime.
 *
 * `config/maplibreConfig.json` is the way to declare basemaps for a hosted install, but it is a
 * file on the server: the standalone build cannot read it, and a user of a hosted install cannot
 * write it. This module is the other way in — one address, typed into the Layers panel, kept in
 * localStorage. It is what lets a standalone file use a tile server on the local network.
 *
 * Pure on purpose: no store, no notifications, no MapLibre. What an address means is decided here
 * and tested here.
 */
import type { MlLayerConfig } from "@/geo/maplibreLayerConfigTypes";

/** What is kept between sessions. The layer config is derived from this, never stored. */
export interface CustomBasemap {
  /** Layer name, and the id the active basemap is remembered under. */
  name: string;
  title: string;
  url: string;
  sourceType: CustomBasemapSourceType;
}

export type CustomBasemapSourceType = "style" | "raster" | "pmtiles";

/** Prefix, so a custom basemap name can never collide with a name from the config file. */
const CUSTOM_PREFIX = "custom:";

export function isCustomBasemapName(name: string): boolean {
  return name.startsWith(CUSTOM_PREFIX);
}

/**
 * What kind of basemap an address points at.
 *
 * A tile template is the only one that can be recognised with certainty, by its placeholders. A
 * `.pmtiles` address names an archive. Everything else is treated as a MapLibre style, which is
 * what a style.json address is, and what a tile server usually offers.
 */
export function customBasemapSourceType(url: string): CustomBasemapSourceType {
  if (url.includes("{z}") && url.includes("{x}") && url.includes("{y}")) return "raster";
  const path = url.split(/[?#]/)[0];
  if (path.toLowerCase().endsWith(".pmtiles")) return "pmtiles";
  return "style";
}

/** A short label for the address: the host, and the last part of the path if there is one. */
export function customBasemapTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();
    return lastSegment ? `${parsed.host}/${lastSegment}` : parsed.host;
  } catch {
    return url;
  }
}

export type CustomBasemapResult =
  { ok: true; basemap: CustomBasemap } | { ok: false; message: string };

/**
 * Turns a typed-in address into a basemap, or says why it cannot.
 *
 * Only http and https are accepted. A `file://` address is refused with its own message: it looks
 * reasonable in a standalone file, but a page cannot read an arbitrary file from disk, and _Open
 * PMTiles archive…_ is the control for a file.
 */
export function customBasemapFromUrl(url: string, title?: string): CustomBasemapResult {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, message: "Type the address of a map server." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: `"${trimmed}" is not a valid address.` };
  }

  if (parsed.protocol === "file:") {
    return {
      ok: false,
      message: "Use Open PMTiles archive… for a file on your disk.",
    };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      message: `The address must start with http:// or https://, not ${parsed.protocol}//.`,
    };
  }

  return {
    ok: true,
    basemap: {
      name: `${CUSTOM_PREFIX}${trimmed}`,
      title: title?.trim() || customBasemapTitle(trimmed),
      url: trimmed,
      sourceType: customBasemapSourceType(trimmed),
    },
  };
}

/**
 * The layer config for a custom basemap.
 *
 * `custom: true` is what makes the row removable. A basemap from the config file has no such mark,
 * therefore the user cannot remove what they did not add.
 */
export function customBasemapToLayerConfig(basemap: CustomBasemap): MlLayerConfig {
  const common = {
    name: basemap.name,
    title: basemap.title,
    custom: true as const,
  };
  switch (basemap.sourceType) {
    case "raster":
      return { ...common, sourceType: "raster", tiles: [basemap.url] };
    case "pmtiles":
      return { ...common, sourceType: "pmtiles", url: basemap.url };
    case "style":
      return { ...common, sourceType: "style", styleUrl: basemap.url };
  }
}
