"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSpreadsheet = void 0;
// Wrapper module for lazy loading.
// If we use await import("xlsx") directly, tree shaking will not work.
var xlsx_1 = require("xlsx");
Object.defineProperty(exports, "readSpreadsheet", { enumerable: true, get: function () { return xlsx_1.read; } });
