"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSpreadsheetDialect = detectSpreadsheetDialect;
function detectSpreadsheetDialect(wb) {
    var sheetNames = wb.SheetNames;
    if (sheetNames[0] === "UNIT INFO") {
        return "ODIN_DRAGON";
    }
    return "generic";
}
