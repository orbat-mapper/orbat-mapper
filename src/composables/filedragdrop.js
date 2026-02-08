"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFileDropZone = useFileDropZone;
var vue_1 = require("vue");
var adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/external/adapter");
var file_1 = require("@atlaskit/pragmatic-drag-and-drop/external/file");
function useFileDropZone(target, onDropHandler) {
    var isOverDropZone = (0, vue_1.ref)(false);
    var cleanup;
    (0, vue_1.onMounted)(function () {
        if (!target.value)
            return;
        cleanup = (0, adapter_1.dropTargetForExternal)({
            element: target.value,
            canDrop: file_1.containsFiles,
            onDragEnter: function () { return (isOverDropZone.value = true); },
            onDragLeave: function () { return (isOverDropZone.value = false); },
            onDrop: function (_a) {
                var source = _a.source;
                var files = (0, file_1.getFiles)({ source: source });
                isOverDropZone.value = false;
                onDropHandler === null || onDropHandler === void 0 ? void 0 : onDropHandler(files.length === 0 ? null : files);
            },
        });
    });
    (0, vue_1.onUnmounted)(function () {
        cleanup();
    });
    return {
        isOverDropZone: isOverDropZone,
    };
}
