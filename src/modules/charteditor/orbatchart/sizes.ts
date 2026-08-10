/*

US-Letter (8,5\" x 11\")
US-Legal (8,5\" x 14\")
US-Tabloid (11\" x 17\")
US-Executive (7\" x 10\")
A0 (841 mm x 1189 mm)
A1 (594 mm x 841 mm)
A2 (420 mm x 594 mm)
A3 (297 mm x 420 mm)
A4 (210 mm x 297 mm)
A5 (148 mm x 210 mm)
A6 (105 mm x 148 mm)
A7 (74 mm x 105 mm)
B4 (250 mm x 353 mm)
B5 (176 mm x 250 mm)
16:9 (1600 x 900)
16:10 (1920 x 1200)
4:3 (1600 x 1200)
Custom"
*/

export const canvasSizeItems = [
  { label: "A4", value: "A4" },
  { label: "A4 Landscape", value: "A4landscape" },
  { label: "A3", value: "A3" },
  { label: "A2", value: "A2" },
  { label: "A1", value: "A1" },
  { label: "A0", value: "A0" },
  { label: "A0 Landscape", value: "A0landscape" },
  { label: "16:9", value: "16:9" },
  { label: "16:10", value: "16:10" },
  { label: "4:3", value: "4:3" },
  { label: "Huuuge", value: "huuuge" },
];

const MM2PX = 3.779527559055118;

function mm2px(mm: number) {
  return Math.round(mm * MM2PX);
}

/** Paper presets, in millimetres. Only these get physical dimensions on SVG export. */
const physicalSizes: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A4landscape: { width: 297, height: 210 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  A1: { width: 594, height: 841 },
  A0: { width: 841, height: 1189 },
  A0landscape: { width: 1189, height: 841 },
};

/** Screen presets, in pixels. */
const pixelSizes: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1600, height: 900 },
  "16:10": { width: 1920, height: 1200 },
  "4:3": { width: 1600, height: 1200 },
  huuuge: { width: mm2px(3000), height: mm2px(3000) },
};

const DEFAULT_SIZE = { width: 600, height: 600 };

export function sizeToWidthHeight(size: string) {
  const physicalSize = physicalSizes[size];
  if (physicalSize) {
    return { width: mm2px(physicalSize.width), height: mm2px(physicalSize.height) };
  }
  return { ...(pixelSizes[size] ?? DEFAULT_SIZE) };
}

export function sizeToPhysicalWidthHeight(size: string) {
  const physicalSize = physicalSizes[size];
  return physicalSize ? { ...physicalSize } : null;
}
