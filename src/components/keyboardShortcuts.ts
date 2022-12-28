export type KeyboardShortcut = string[];

export interface KeyboardEntry {
  description: string;
  shortcut: KeyboardShortcut[];
}

export interface KeyboardCategory {
  label: string;
  shortcuts: KeyboardEntry[];
}

const genericShortcuts: KeyboardCategory = {
  label: "Generic",
  shortcuts: [
    { shortcut: [["?"]], description: "Show this help dialog" },
    { shortcut: [["ctrl", "k"], ["s"]], description: "Open search" },
    { shortcut: [["ctrl", "z"]], description: "Undo" },
    {
      shortcut: [
        ["ctrl", "shift", "z"],
        ["ctrl", "y"],
      ],
      description: "Redo",
    },
  ],
};

export const mapEditModeShortcuts: KeyboardCategory[] = [
  genericShortcuts,
  {
    label: "Unit editing and manipulation",
    shortcuts: [
      { shortcut: [["c"]], description: "Create subordinate unit" },
      { shortcut: [["e"]], description: "Edit active unit" },
      { shortcut: [["d"]], description: "Duplicate unit" },
      { shortcut: [["z"]], description: "Zoom to unit" },
      { shortcut: [["p"]], description: "Pan to unit" },
    ],
  },
  {
    label: "Time manipulation",
    shortcuts: [{ shortcut: [["t"]], description: "Set scenario time" }],
  },
];

export const gridEditModeShortcuts: KeyboardCategory[] = [
  genericShortcuts,
  {
    label: "Unit editing and manipulation",
    shortcuts: [
      { shortcut: [["alt", "enter"]], description: "Create subordinate unit" },
      { shortcut: [["shift", "enter"]], description: "Duplicate unit" },
      { shortcut: [["alt", "x"]], description: "Open/close item" },
      { shortcut: [["ctrl", "e"]], description: "Open/close item and subordinates" },
    ],
  },
  {
    label: "Cell editing",
    shortcuts: [
      { shortcut: [["enter"]], description: "Enter cell editing mode" },
      { shortcut: [["esc"]], description: "Cancel cell editing" },
      { shortcut: [["del"]], description: "Clear cell content" },
      { shortcut: [["ctrl", "c"]], description: "Copy cell content to clipboard" },
      { shortcut: [["ctrl", "v"]], description: "Paste clipboard content to cell" },
    ],
  },
];

export const defaultShortcuts = [genericShortcuts];
