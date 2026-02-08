"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToeEditableItems = useToeEditableItems;
exports.createToeTableColumns = createToeTableColumns;
exports.asPercent = asPercent;
var vue_1 = require("vue");
function useToeEditableItems() {
    var editMode = (0, vue_1.ref)(false);
    var editedId = (0, vue_1.ref)();
    var showAddForm = (0, vue_1.ref)(false);
    var rerender = (0, vue_1.ref)(true);
    var selectedItems = (0, vue_1.ref)([]);
    return { editMode: editMode, editedId: editedId, showAddForm: showAddForm, rerender: rerender, selectedItems: selectedItems };
}
function createToeTableColumns() {
    var columns = [
        { id: "name", header: "Name", accessorKey: "name", size: 120 },
        {
            id: "assigned",
            header: "Asgd.",
            accessorKey: "count",
            size: 80,
            meta: { align: "right" },
        },
        {
            id: "onHand",
            header: "Avail.",
            accessorKey: "onHand",
            size: 80,
            meta: { align: "right" },
        },
        {
            id: "percentage",
            header: "%",
            accessorFn: function (f) { return asPercent(f); },
            size: 80,
            meta: { align: "right" },
        },
    ];
    return columns;
}
function asPercent(item) {
    var _a;
    return Math.floor((((_a = item.onHand) !== null && _a !== void 0 ? _a : 1) / item.count) * 100) + "%";
}
