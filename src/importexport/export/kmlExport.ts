import type { KmlKmzExportSettings } from "@/types/importExport.ts";
import type { Folder, Root } from "@tmcw/togeojson";
import type { NUnit } from "@/types/internalModels";
import { saveBlobToLocalFile } from "@/utils/files";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { useGeoJsonConverter } from "@/importexport/export/geojsonConverter";
import type { TScenario } from "@/scenariostore";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { useSelectedItems } from "@/stores/selectedStore.ts";
import { hashObject, wordWrap } from "@/utils";
import type { CustomSymbol, UnitSymbolOptions } from "@/types/scenarioModels.ts";
import { getCustomSymbolId, getFullUnitSidc } from "@/symbology/helpers.ts";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";
import { useMapSettingsStore } from "@/stores/mapSettingsStore.ts";

type RenderSymbolSettings = {
  sidc: string;
  baseSidc: string;
  symbolOptions: UnitSymbolOptions;
  cacheKey: string;
  kind: "mil" | "custom";
  customSymbolId?: string;
  customLabel?: string;
};

type HotspotSettings = {
  x?: number;
  y?: number;
  xUnits?: "insetPixels" | "pixels" | "fraction";
  yUnits?: "insetPixels" | "pixels" | "fraction";
};

type RenderedCustomSymbol = {
  blob: Blob;
  canvasWidth: number;
  iconWidth: number;
  iconHeight: number;
  iconX: number;
};

// This composable provides KML/KMZ export functions, parameterized with required dependencies.
export function useKmlExport(scenario: TScenario) {
  const { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson } =
    useGeoJsonConverter(scenario);
  const { geo, store, unitActions } = scenario;
  const { sideMap } = store.state;

  const symbolSettings = useSymbolSettingsStore();
  const mapSettings = useMapSettingsStore();
  const { selectedUnitIds } = useSelectedItems();

  function createKMLString(opts: KmlKmzExportSettings) {
    const root: Root = { type: "root", children: [] };
    const symbolDataCache = new Map<string, RenderSymbolSettings>();

    function createUnitsFolder(units: NUnit[], name: string): Folder {
      const { features } = convertUnitsToGeoJson(units, {
        includeIdInProperties: true,
      });
      return {
        type: "folder",
        meta: { name },
        children: features.map((unit: any) => {
          const { name, shortName, description, id, sidc, fillColor } = unit.properties;
          const nUnit = scenario.helpers.getUnitById(id)!;
          const s = createRenderSymbolSettings(nUnit, opts);
          symbolDataCache.set(s.cacheKey, s);
          const styleUrl = `#sidc${s.cacheKey}`;

          return {
            ...unit,
            properties: {
              name: opts.useShortName ? shortName || name : name,
              description,
              styleUrl,
            },
          };
        }),
      };
    }

    function writeFolders(parentFolder: Folder | Root) {
      if (opts.includeUnits) {
        if (opts.folderMode === "side") {
          for (const sideId of Object.keys(sideMap)) {
            const side = sideMap[sideId];
            const units: NUnit[] = [];
            unitActions.walkSide(sideId, (unit: any) => {
              if (
                unit._state?.location &&
                (opts.includeSelectedUnitsOnly
                  ? selectedUnitIds.value.has(unit.id)
                  : true)
              )
                units.push(unit);
            });
            if (units.length) {
              parentFolder.children.push(createUnitsFolder(units, side.name));
            }
          }
        } else if (opts.folderMode === "sideGroup") {
          for (const sideId of Object.keys(sideMap)) {
            const side = sideMap[sideId];
            if (!side) continue;
            const sideFolder: Folder = {
              type: "folder",
              meta: { name: side.name },
              children: [],
            };
            for (const groupId of side.groups) {
              const group = store.state.sideGroupMap[groupId];
              if (!group) continue;
              const sideGroupUnits: NUnit[] = [];
              unitActions.walkItem(group.id, (unit) => {
                if (
                  unit._state?.location &&
                  (opts.includeSelectedUnitsOnly
                    ? selectedUnitIds.value.has(unit.id)
                    : true)
                )
                  sideGroupUnits.push(unit);
              });
              if (sideGroupUnits.length) {
                sideFolder.children.push(createUnitsFolder(sideGroupUnits, group.name));
              }
            }
            const sideUnits: NUnit[] = [];
            for (const rootUnitId of side.subUnits) {
              unitActions.walkItem(rootUnitId, (unit) => {
                if (
                  unit._state?.location &&
                  (opts.includeSelectedUnitsOnly
                    ? selectedUnitIds.value.has(unit.id)
                    : true)
                )
                  sideUnits.push(unit);
              });
            }
            if (sideUnits.length) {
              const tempFolder = createUnitsFolder(sideUnits, "Root units");
              sideFolder.children.push(...tempFolder.children);
            }
            if (sideFolder.children.length) {
              parentFolder.children.push(sideFolder);
            }
          }
        } else {
          parentFolder.children.push(
            createUnitsFolder(geo.everyVisibleUnit.value, "Units"),
          );
        }
      }
    }
    if (opts.timeMode === "multiple" && opts.exportEventIds.length) {
      const currentTime = store.state.currentTime;
      const events = store.state.events
        .filter((e) => opts.exportEventIds.includes(e))
        .map((id) => store.state.eventMap[id]);
      for (const event of events) {
        const eventFolder: Folder = {
          type: "folder",
          meta: { name: event.title || "Event" },
          children: [],
        };
        scenario.time.setCurrentTime(event.startTime);
        writeFolders(eventFolder);
        root.children.push(eventFolder);
      }
      scenario.time.setCurrentTime(currentTime);
    } else {
      if (opts.timeMode === "event") {
        const currentTime = store.state.currentTime;
        const event = store.state.eventMap[opts.exportEventId || ""];
        if (event) {
          scenario.time.setCurrentTime(event.startTime);
          writeFolders(root);
          scenario.time.setCurrentTime(currentTime);
        } else {
          writeFolders(root);
        }
      } else {
        writeFolders(root);
      }
    }

    const features = opts.includeFeatures
      ? convertScenarioFeaturesToGeoJson().features
      : [];

    if (opts.includeFeatures) {
      root.children.push({
        type: "folder",
        meta: { name: "Scenario features" },
        children: features,
      });
    }

    return { root, symbolDataCache };
  }

  async function downloadAsKML(opts: KmlKmzExportSettings) {
    const { foldersToKML } = await import("@/extlib/tokml");
    const { root } = createKMLString(opts);
    const kmlString = foldersToKML(root, [], {
      listStyle: opts.useRadioFolder ? "radioFolder" : undefined,
    });
    await saveBlobToLocalFile(
      new Blob([kmlString], {
        type: "application/vnd.google-earth.kml+xml",
      }),
      "scenario.kml",
      { mimeTypes: ["application/vnd.google-earth.kml+xml"], extensions: [".kml"] },
    );
  }

  function createRenderSymbolSettings(
    unit: NUnit,
    opts: KmlKmzExportSettings,
  ): RenderSymbolSettings {
    const sidc = unit._state?.sidc || unit.sidc;
    let symbolOptions = unitActions.getCombinedSymbolOptions(unit);

    if (opts.renderAmplifiers) {
      const { uniqueDesignation = unit.shortName || unit.name, ...textAmplifiers } =
        unit.textAmplifiers || {};
      symbolOptions = { ...symbolOptions, uniqueDesignation, ...textAmplifiers };
    }
    const cacheKey = `${sidc}-${hashObject(symbolOptions)}`;
    if (sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
      const customSymbolId = getCustomSymbolId(sidc);
      const customSymbol = customSymbolId
        ? store.state.customSymbolMap[customSymbolId]
        : undefined;
      const customLabel = opts.renderCustomIconLabels
        ? unit.textAmplifiers?.uniqueDesignation || unit.shortName || unit.name || ""
        : undefined;
      return {
        sidc,
        baseSidc: getFullUnitSidc(sidc),
        symbolOptions,
        cacheKey,
        kind: "custom",
        customSymbolId: customSymbolId || undefined,
        customLabel,
      };
    }
    return { sidc, baseSidc: sidc, symbolOptions, cacheKey, kind: "mil" };
  }

  function normalizeCustomAnchor(anchor?: [number, number]): [number, number] {
    if (!anchor || anchor.length !== 2) return [0.5, 0.68];
    const [x, y] = anchor;
    const safeX = Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0.5;
    const safeY = Number.isFinite(y) ? Math.max(0, Math.min(1, y)) : 0.68;
    return [safeX, safeY];
  }

  function createCustomHotspot(
    canvasWidth: number,
    iconWidth: number,
    iconHeight: number,
    anchor?: [number, number],
    iconX = 0,
  ): HotspotSettings {
    const [anchorX, anchorY] = normalizeCustomAnchor(anchor);
    const hotspotXFromLeft = iconX + iconWidth * anchorX;
    return {
      // Custom symbol anchors are stored as fractions from top-left.
      // KML insetPixels x is measured from right edge, y from top edge.
      x: canvasWidth - hotspotXFromLeft,
      y: iconHeight * anchorY,
      xUnits: "insetPixels",
      yUnits: "insetPixels",
    };
  }

  function renderMilSymbol(
    sidc: string,
    symbolOptions: UnitSymbolOptions,
    opts: KmlKmzExportSettings,
  ) {
    const outlineOptions = opts.drawSymbolOutline
      ? { outlineWidth: opts.outlineWidth, outlineColor: opts.outlineColor }
      : {};

    const symb = symbolGenerator(sidc, {
      ...symbolSettings.symbolOptions,
      ...symbolOptions,
      ...outlineOptions,
    });
    const { x, y } = symb.getOctagonAnchor();
    const size = symb.getSize();

    return {
      symb,
      hotspot: {
        x: size.width - x,
        y,
        xUnits: "insetPixels" as const,
        yUnits: "insetPixels" as const,
      },
    };
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (/^https?:\/\//i.test(src)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  }

  function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64Data] = dataUrl.split(",");
    if (!header || !base64Data) {
      throw new Error("Invalid data URL");
    }
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch?.[1] || "image/png";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (blob) return blob;
    return dataUrlToBlob(canvas.toDataURL("image/png"));
  }

  async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    if ("arrayBuffer" in blob && typeof blob.arrayBuffer === "function") {
      return new Uint8Array(await blob.arrayBuffer());
    }
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsArrayBuffer(blob);
    });
    return new Uint8Array(buffer);
  }

  async function renderCustomSymbolBlob(
    customSymbol: CustomSymbol,
    options: {
      label?: string;
      fontSize?: number;
      wrapLabels?: boolean;
      wrapWidth?: number;
      iconWidth?: number;
    } = {},
  ): Promise<RenderedCustomSymbol> {
    const {
      label,
      fontSize: labelFontSize,
      wrapLabels = false,
      wrapWidth = 15,
      iconWidth: requestedIconWidth,
    } = options;
    const img = await loadImage(customSymbol.src);
    const sourceWidth = Math.max(1, img.naturalWidth || img.width || 1);
    const sourceHeight = Math.max(1, img.naturalHeight || img.height || 1);
    const resolvedWidth =
      requestedIconWidth !== undefined && Number.isFinite(requestedIconWidth)
        ? requestedIconWidth
        : sourceWidth;
    const iconWidth = Math.max(1, Math.round(resolvedWidth));
    const iconHeight = Math.max(1, Math.round((sourceHeight / sourceWidth) * iconWidth));

    let canvasWidth = iconWidth;
    let canvasHeight = iconHeight;
    let iconX = 0;

    const labelText = label?.trim();
    let labelLines: string[] = [];
    let fontSize = 0;
    let labelPadding = 0;
    let labelY = 0;
    if (labelText) {
      const wrappedText =
        wrapLabels && wrapWidth > 0
          ? wordWrap(labelText, { width: wrapWidth })
          : labelText;
      labelLines = wrappedText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!labelLines.length) {
        labelLines = [labelText];
      }

      fontSize = Math.max(8, Math.round(labelFontSize ?? iconHeight * 0.4));
      labelPadding = Math.max(4, Math.round(fontSize * 0.35));
      const measureCanvas = document.createElement("canvas");
      const measureContext = measureCanvas.getContext("2d");
      if (measureContext) {
        measureContext.font = `700 ${fontSize}px sans-serif`;
        const widestLine = labelLines.reduce(
          (max, line) => Math.max(max, Math.ceil(measureContext.measureText(line).width)),
          0,
        );
        canvasWidth = Math.max(iconWidth, widestLine + labelPadding * 2);
        iconX = Math.floor((canvasWidth - iconWidth) / 2);
        const lineHeight = Math.ceil(fontSize * 1.2);
        canvasHeight = iconHeight + labelPadding + lineHeight * labelLines.length;
      }
      labelY = iconHeight + labelPadding / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }
    ctx.drawImage(img, iconX, 0, iconWidth, iconHeight);

    if (labelLines.length) {
      const lineHeight = Math.ceil(fontSize * 1.2);
      ctx.font = `700 ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.2));
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.fillStyle = "#ffffff";
      for (const [idx, line] of labelLines.entries()) {
        const y = labelY + idx * lineHeight;
        ctx.strokeText(line, canvasWidth / 2, y);
        ctx.fillText(line, canvasWidth / 2, y);
      }
    }

    const blob = await canvasToPngBlob(canvas);
    return { blob, canvasWidth, iconWidth, iconHeight, iconX };
  }

  async function downloadAsKMZ(opts: KmlKmzExportSettings) {
    const { zipSync, strToU8 } = await import("fflate");
    const { foldersToKML } = await import("@/extlib/tokml");
    const data: Record<string, Uint8Array> = {};
    const hotspotCache = new Map<string, HotspotSettings>();
    const warnings: string[] = [];
    const { root, symbolDataCache } = createKMLString(opts);

    if (opts.embedIcons) {
      for (const [cacheKey, symbolData] of symbolDataCache) {
        let blob: Blob | null = null;
        if (symbolData.kind === "custom") {
          const customSymbolId = symbolData.customSymbolId;
          const customSymbol = customSymbolId
            ? store.state.customSymbolMap[customSymbolId]
            : undefined;
          if (customSymbol) {
            try {
              const label =
                opts.renderCustomIconLabels && symbolData.customLabel
                  ? symbolData.customLabel
                  : undefined;
              const rendered = await renderCustomSymbolBlob(customSymbol, {
                label,
                fontSize: mapSettings.mapLabelSize,
                wrapLabels: mapSettings.mapWrapUnitLabels,
                wrapWidth: mapSettings.mapWrapLabelWidth,
                iconWidth:
                  (Number.isFinite(mapSettings.mapIconSize)
                    ? mapSettings.mapIconSize
                    : 30) *
                  (Number.isFinite(mapSettings.mapCustomIconScale)
                    ? mapSettings.mapCustomIconScale
                    : 1.7),
              });
              blob = rendered.blob;
              hotspotCache.set(
                cacheKey,
                createCustomHotspot(
                  rendered.canvasWidth,
                  rendered.iconWidth,
                  rendered.iconHeight,
                  customSymbol.anchor,
                  rendered.iconX,
                ),
              );
            } catch (error) {
              warnings.push(
                `Custom symbol "${customSymbol.name}" (${customSymbol.id}) could not be embedded; used SIDC fallback.`,
              );
            }
          } else {
            warnings.push(
              `Custom symbol "${symbolData.customSymbolId || "unknown"}" is missing; used SIDC fallback.`,
            );
          }
        }

        if (!blob) {
          const { symb, hotspot } = renderMilSymbol(
            symbolData.baseSidc,
            symbolData.symbolOptions,
            opts,
          );
          hotspotCache.set(cacheKey, hotspot);
          blob = await canvasToPngBlob(symb.asCanvas());
        }

        if (blob) {
          data[`icons/${cacheKey}.png`] = await blobToUint8Array(blob);
        }
      }
    }

    const kmlString = foldersToKML(
      root,
      [...symbolDataCache.keys()].map((cacheKey) => {
        const symbolData = symbolDataCache.get(cacheKey);
        const customEmbeddedLabel =
          opts.embedIcons && opts.renderCustomIconLabels && symbolData?.kind === "custom";
        return {
          sidc: cacheKey,
          labelScale: customEmbeddedLabel ? 0 : opts.labelScale,
          iconScale: opts.iconScale,
          xOffset: hotspotCache?.get(cacheKey)?.x,
          yOffset: hotspotCache?.get(cacheKey)?.y,
          xUnits: hotspotCache?.get(cacheKey)?.xUnits,
          yUnits: hotspotCache?.get(cacheKey)?.yUnits,
        };
      }),
      {
        listStyle: opts.useRadioFolder ? "radioFolder" : undefined,
      },
    );

    data["doc.kml"] = strToU8(kmlString);
    const zipData = zipSync(data);
    await saveBlobToLocalFile(
      new Blob([zipData as BlobPart], {
        type: "application/vnd.google-earth.kmz",
      }),
      "scenario.kmz",
      { mimeTypes: ["application/vnd.google-earth.kmz"], extensions: [".kmz"] },
    );

    return { warnings };
  }

  return {
    downloadAsKML,
    downloadAsKMZ,
  };
}
