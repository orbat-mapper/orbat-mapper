"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultShortcuts = exports.gridEditModeShortcuts = exports.mapEditModeShortcuts = void 0;
var genericShortcuts = {
    label: "Generic",
    shortcuts: [
        { shortcut: [["?"]], description: "Show this help dialog" },
        { shortcut: [["ctrl / ⌘", "k"], ["s"]], description: "Open search" },
        { shortcut: [["ctrl / ⌘", "z"]], description: "Undo" },
        {
            shortcut: [
                ["ctrl / ⌘", "shift", "z"],
                ["ctrl", "y"],
            ],
            description: "Redo",
        },
    ],
};
exports.mapEditModeShortcuts = [
    genericShortcuts,
    {
        label: "Unit editing and manipulation",
        shortcuts: [
            { shortcut: [["del"]], description: "Delete selected units" },
            { shortcut: [["c"]], description: "Create subordinate unit" },
            { shortcut: [["e"]], description: "Edit active unit" },
            { shortcut: [["d"]], description: "Duplicate unit" },
            { shortcut: [["z"]], description: "Zoom to unit" },
            { shortcut: [["p"]], description: "Pan to unit" },
            { shortcut: [["m"]], description: "Toggle move unit/feature mode" },
            { shortcut: [["l"]], description: "Locate unit in the ORBAT" },
        ],
    },
    {
        label: "Time manipulation",
        shortcuts: [
            { shortcut: [["t"]], description: "Set scenario time" },
            { shortcut: [["alt", "p"], ["k"]], description: "Play/pause" },
            { description: "Increase playback speed", shortcut: [[">"]] },
            { description: "Decrease playback speed", shortcut: [["<"]] },
        ],
    },
];
exports.gridEditModeShortcuts = [
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
exports.defaultShortcuts = [genericShortcuts];
