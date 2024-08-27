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

export function sizeToWidthHeight(size: string) {
  if (size === "A4") return { width: mm2px(210), height: mm2px(297) };
  if (size === "A4landscape") return { width: mm2px(297), height: mm2px(210) };
  if (size === "A3") return { width: mm2px(297), height: mm2px(420) };
  if (size === "16:9") return { width: 1600, height: 900 };
  if (size === "16:10") return { width: 1920, height: 1200 };
  if (size === "4:3") return { width: 1600, height: 1200 };
  if (size === "A2") return { width: mm2px(420), height: mm2px(594) };
  if (size === "A1") return { width: mm2px(594), height: mm2px(841) };
  if (size === "A0") return { width: mm2px(841), height: mm2px(1189) };
  if (size === "A0landscape") return { width: mm2px(1189), height: mm2px(841) };
  if (size === "huuuge") return { width: mm2px(3000), height: mm2px(3000) };
  return { width: 600, height: 600 };
}
