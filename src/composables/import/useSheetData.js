"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSheetData = useSheetData;
var vue_1 = require("vue");
var xlsx_lazy_1 = require("@/extlib/xlsx-lazy");
function useSheetData(workbook) {
    var sheetNames = workbook.SheetNames;
    var activeSheet = (0, vue_1.ref)(sheetNames[0]);
    var data = (0, vue_1.computed)(function () {
        var sheet = workbook.Sheets[activeSheet.value];
        if (!sheet || !sheet["!ref"])
            return [];
        return xlsx_lazy_1.xlsxUtils.sheet_to_json(sheet);
    });
    var headers = (0, vue_1.computed)(function () {
        if (data.value.length === 0)
            return [];
        return Object.keys(data.value[0]);
    });
    return {
        sheetNames: sheetNames,
        activeSheet: activeSheet,
        data: data,
        headers: headers,
    };
}
