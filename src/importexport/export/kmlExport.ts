import type { KmlKmzExportSettings } from "@/types/convert";
import type { Root } from "@tmcw/togeojson";
import type { NUnit } from "@/types/internalModels";
import { saveBlobToLocalFile } from "@/utils/files";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";
import type { TScenario } from "@/scenariostore";
import { symbolGenerator } from "@/symbology/milsymbwrapper";

// This composable provides KML/KMZ export functions, parameterized with required dependencies.
export function useKmlExport(scenario: TScenario) {
  const { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson } =
    useGeoJsonConverter(scenario);
  const { geo, store, unitActions } = scenario;
  const { sideMap } = store.state;

  const symbolSettings = useSymbolSettingsStore();
  async function createKMLString(
    sidcs: string[],
    opts: KmlKmzExportSettings,
    offsetCache?: Map<string, { x: number; y: number }>,
  ) {
    const { foldersToKML } = await import("@/extlib/tokml");
    const root: Root = { type: "root", children: [] };

    function createFolder(units: NUnit[], name: string) {
      root.children.push({
        type: "folder",
        meta: { name },
        children: convertUnitsToGeoJson(units, {
          includeIdInProperties: true,
        }).features.map((unit: any) => {
          const { name, shortName, description, id } = unit.properties;
          const styleUrl = opts.renderAmplifiers
            ? `#sidc${id}`
            : `#sidc${unit.properties.sidc}${(unit.properties.fillColor || "").replaceAll(
                "#",
                "",
              )}`;
          return {
            ...unit,
            properties: {
              name: opts.useShortName ? shortName || name : name,
              description,
              styleUrl,
            },
          };
        }),
      });
    }

    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];

    if (opts.includeUnits) {
      if (opts.oneFolderPerSide) {
        Object.keys(sideMap).forEach((sideId) => {
          const side = sideMap[sideId];
          const units: NUnit[] = [];
          unitActions.walkSide(sideId, (unit: any) => {
            if (unit._state?.location) units.push(unit);
          });
          createFolder(units, side.name);
        });
      } else {
        createFolder(geo.everyVisibleUnit.value, "Units");
      }
    }

    if (opts.includeFeatures) {
      root.children.push({
        type: "folder",
        meta: { name: "Scenario features" },
        children: features,
      });
    }
    return foldersToKML(
      root,
      sidcs.map((sidc) => ({
        sidc,
        labelScale: opts.labelScale,
        iconScale: opts.iconScale,
        xOffset: offsetCache?.get(sidc)?.x,
        yOffset: offsetCache?.get(sidc)?.y,
      })),
    );
  }

  async function downloadAsKML(opts: KmlKmzExportSettings) {
    const kmlString = await createKMLString([], opts);
    await saveBlobToLocalFile(
      new Blob([kmlString], {
        type: "application/vnd.google-earth.kml+xml",
      }),
      "scenario.kml",
      { mimeTypes: ["application/vnd.google-earth.kml+xml"], extensions: [".kml"] },
    );
  }

  async function downloadAsKMZ(opts: KmlKmzExportSettings) {
    const { zipSync } = await import("fflate");
    const data: Record<string, Uint8Array> = {};
    const usedSidcs = new Set<string>();
    const offsetCache = new Map<string, { x: number; y: number }>();
    if (opts.embedIcons) {
      for (const unit of geo.everyVisibleUnit.value) {
        const sidc = unit._state?.sidc || unit.sidc;
        const symbolOptions = unitActions.getCombinedSymbolOptions(unit);
        const cacheKey = opts.renderAmplifiers
          ? unit.id
          : (sidc + (symbolOptions.fillColor || "")).replaceAll("#", "");
        const outlineOptions = opts.drawSymbolOutline
          ? { outlineWidth: opts.outlineWidth, outlineColor: opts.outlineColor }
          : {};

        let amplifiers = {};
        if (opts.renderAmplifiers) {
          const { uniqueDesignation = unit.shortName || unit.name, ...textAmplifiers } =
            unit.textAmplifiers || {};
          amplifiers = { uniqueDesignation, ...textAmplifiers };
        }

        if (!usedSidcs.has(cacheKey)) {
          const symb = symbolGenerator(sidc, {
            ...amplifiers,
            ...symbolSettings.symbolOptions,
            ...symbolOptions,
            ...outlineOptions,
          });
          const { x, y } = symb.getOctagonAnchor();
          const size = symb.getSize();

          offsetCache.set(cacheKey, { x: size.width - x, y });
          usedSidcs.add(cacheKey);
          const blob: Blob | null = await new Promise((resolve) =>
            symb.asCanvas().toBlob(resolve),
          );
          if (blob) {
            data[`icons/${cacheKey}.png`] = new Uint8Array(await blob.arrayBuffer());
          }
        }
      }
    }
    const kmlString = await createKMLString([...usedSidcs], opts, offsetCache);

    data["doc.kml"] = new TextEncoder().encode(kmlString);

    const zipData = zipSync(data);
    await saveBlobToLocalFile(
      new Blob([zipData as BlobPart], {
        type: "application/vnd.google-earth.kmz",
      }),
      "scenario.kmz",
      { mimeTypes: ["application/vnd.google-earth.kmz"], extensions: [".kmz"] },
    );
  }

  return {
    downloadAsKML,
    downloadAsKMZ,
  };
}
