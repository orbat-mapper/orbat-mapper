import { type Ref, toValue } from "vue";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { saveBlobToLocalFile } from "@/utils/files";
import { useNotifications } from "@/composables/notifications";
import type { SymbolOptions } from "milsymbol";

export interface ExportSettings {
  size: number;
  outlineWidth: number;
  showOutline: boolean;
  showFrame: boolean;
  showIcon: boolean;
  showFill: boolean;
}

export const defaultExportSettings: ExportSettings = {
  size: 256,
  outlineWidth: 8,
  showOutline: false,
  showFrame: true,
  showIcon: true,
  showFill: true,
};

export function useSymbolExport(
  sidc: Ref<string>,
  symbolOptions: Ref<Partial<SymbolOptions>>,
  exportSettings: Ref<ExportSettings>,
) {
  const { send } = useNotifications();

  function getSymbol() {
    const settings = toValue(exportSettings);
    return symbolGenerator(toValue(sidc), {
      ...toValue(symbolOptions),
      size: settings.size,
      outlineWidth: settings.showOutline ? settings.outlineWidth : 0,
      frame: settings.showFrame,
      icon: settings.showIcon,
      fill: settings.showFill,
    });
  }

  async function copySvg() {
    try {
      const svg = getSymbol().asSVG();
      await navigator.clipboard.writeText(svg);
      send({ message: "SVG copied to clipboard" });
    } catch {
      send({ message: "Failed to copy SVG", type: "error" });
    }
  }

  async function copyPng() {
    try {
      const canvas = getSymbol().asCanvas();
      const blob = await canvasToBlob(canvas);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      send({ message: "PNG copied to clipboard" });
    } catch {
      send({ message: "Failed to copy PNG", type: "error" });
    }
  }

  async function downloadSvg() {
    const svg = getSymbol().asSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    await saveBlobToLocalFile(blob, `${toValue(sidc)}.svg`, {
      mimeTypes: ["image/svg+xml"],
      extensions: [".svg"],
    });
  }

  async function downloadPng() {
    const canvas = getSymbol().asCanvas();
    const blob = await canvasToBlob(canvas);
    await saveBlobToLocalFile(blob, `${toValue(sidc)}.png`, {
      mimeTypes: ["image/png"],
      extensions: [".png"],
    });
  }

  return { copySvg, copyPng, downloadSvg, downloadPng };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to convert canvas to blob"));
    }, "image/png");
  });
}
