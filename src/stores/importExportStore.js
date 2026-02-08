"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExportStore = exports.useImportStore = void 0;
var pinia_1 = require("pinia");
var core_1 = require("@vueuse/core");
exports.useImportStore = (0, pinia_1.defineStore)("import", {
    state: function () {
        return ({
            inputSource: "file",
            format: "milx",
            keepOpen: (0, core_1.useLocalStorage)("importKeepOpen", false),
        });
    },
});
exports.useExportStore = (0, pinia_1.defineStore)("exportStore", {
    state: function () {
        return {
            keepOpen: (0, core_1.useLocalStorage)("exportKeepOpen", false),
            currentFormat: (0, core_1.useLocalStorage)("exportCurrentFormat", "orbatmapper"),
        };
    },
});
