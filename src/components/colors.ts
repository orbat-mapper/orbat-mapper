export interface SelectableColor {
  name: string;
  value: string;
  bgColor: string;
  selectedColor: string;
}

export const defaultColors: SelectableColor[] = [
  {
    name: "Black",
    value: "Black",
    bgColor: "bg-black",
    selectedColor: "ring-black",
  },
  {
    name: "Slate",
    value: "#64748b",
    bgColor: "bg-slate-500",
    selectedColor: "ring-slate-500",
  },
  {
    name: "Purple",
    value: "#a855f7",
    bgColor: "bg-purple-500",
    selectedColor: "ring-purple-500",
  },
  {
    name: "Blue",
    value: "#3b82f6",
    bgColor: "bg-blue-500",
    selectedColor: "ring-blue-500",
  },
  {
    name: "Green",
    value: "#22c55e",
    bgColor: "bg-green-500",
    selectedColor: "ring-green-500",
  },
  {
    name: "Yellow",
    value: "#eab308",
    bgColor: "bg-yellow-500",
    selectedColor: "ring-yellow-500",
  },
  {
    name: "Pink",
    value: "#ec4899",
    bgColor: "bg-pink-500",
    selectedColor: "ring-pink-500",
  },
  {
    name: "Rose",
    value: "#f43f5e",
    bgColor: "bg-rose-500",
    selectedColor: "ring-rose-500",
  },
];

export const extraColors: SelectableColor[] = [];

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
