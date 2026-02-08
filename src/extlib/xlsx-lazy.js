"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xlsxUtils = exports.writeFileXLSX = void 0;
// Wrapper module for lazy loading.
// If we use await import("xlsx") directly, tree shaking will not work.
var xlsx_1 = require("xlsx");
Object.defineProperty(exports, "writeFileXLSX", { enumerable: true, get: function () { return xlsx_1.writeFileXLSX; } });
var xlsx_2 = require("xlsx");
Object.defineProperty(exports, "xlsxUtils", { enumerable: true, get: function () { return xlsx_2.utils; } });
