"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapCtrlClick = void 0;
var interaction_1 = require("ol/interaction");
var condition_1 = require("ol/events/condition");
var ctrlKeyOnly = function (mapBrowserEvent) {
    var originalEvent = mapBrowserEvent.originalEvent;
    return ((originalEvent.metaKey || originalEvent.ctrlKey) &&
        !originalEvent.shiftKey &&
        !originalEvent.altKey);
};
var MapCtrlClick = /** @class */ (function (_super) {
    __extends(MapCtrlClick, _super);
    function MapCtrlClick(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        if (options.handleCtrlClickEvent) {
            _this.handleCtrlClickEvent = options.handleCtrlClickEvent;
        }
        return _this;
    }
    MapCtrlClick.prototype.handleEvent = function (mapBrowserEvent) {
        var _a;
        var stopEvent = false;
        if (ctrlKeyOnly(mapBrowserEvent)) {
            stopEvent = true;
            if ((0, condition_1.click)(mapBrowserEvent)) {
                stopEvent = (_a = this.handleCtrlClickEvent(mapBrowserEvent)) !== null && _a !== void 0 ? _a : true;
            }
        }
        return !stopEvent;
    };
    MapCtrlClick.prototype.handleCtrlClickEvent = function (mapBrowserEvent) {
        console.log("Ctrl click it is", mapBrowserEvent);
    };
    return MapCtrlClick;
}(interaction_1.Interaction));
exports.MapCtrlClick = MapCtrlClick;
