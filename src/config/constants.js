"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_SYMBOL_SLICE = exports.CUSTOM_SYMBOL_PREFIX = exports.DEFAULT_BASEMAP_ID = exports.SHARE_HISTORY_LOCALSTORAGE_KEY = exports.LOCALSTORAGE_KEY = exports.SCENARIO_FILE_VERSION = void 0;
exports.SCENARIO_FILE_VERSION = "2.2.0";
exports.LOCALSTORAGE_KEY = "orbat-scenario4";
exports.SHARE_HISTORY_LOCALSTORAGE_KEY = "orbat-share-history";
exports.DEFAULT_BASEMAP_ID = "osm";
// custom symbol format: custom1:1003100000:someid
exports.CUSTOM_SYMBOL_PREFIX = "custom1:";
exports.CUSTOM_SYMBOL_SLICE = 8 + 20 + 1; // length of "custom1:" + length of "1003100000" + 1 colon
