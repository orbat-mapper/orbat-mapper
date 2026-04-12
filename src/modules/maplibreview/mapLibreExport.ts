import type { Map as MlMap } from "maplibre-gl";
import { saveBlobToLocalFile } from "@/utils/files";

export async function saveMapLibreMapAsPng(
  map: MlMap,
  options: { fileName?: string } = {},
) {
  const fileName = options.fileName ?? "image.png";
  const canvas = map.getCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return;

  await saveBlobToLocalFile(blob, fileName);
}
