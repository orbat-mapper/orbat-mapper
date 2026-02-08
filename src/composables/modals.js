"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDateModal = useDateModal;
exports.useSidcModal = useSidcModal;
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
var nprogress_1 = require("nprogress");
function useDateModal() {
    var _this = this;
    var _a = (0, core_1.useConfirmDialog)(), isRevealed = _a.isRevealed, reveal = _a.reveal, confirm = _a.confirm, cancel = _a.cancel;
    var initialDateModalValue = (0, vue_1.ref)(0);
    var dateModalTimeZone = (0, vue_1.ref)("UTC");
    var dateModalTitle = (0, vue_1.ref)("Set scenario time");
    var getModalTimestamp = function (initialValue_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([initialValue_1], args_1, true), void 0, function (initialValue, options) {
            var _a, data, isCanceled;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        initialDateModalValue.value = initialValue;
                        dateModalTimeZone.value = options.timeZone || "UTC";
                        dateModalTitle.value = options.title || "Set scenario time";
                        return [4 /*yield*/, reveal()];
                    case 1:
                        _a = _b.sent(), data = _a.data, isCanceled = _a.isCanceled;
                        if (!isCanceled) {
                            return [2 /*return*/, data];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    var showDateModal = (0, vue_1.computed)({
        get: function () {
            return isRevealed.value;
        },
        set: function (v) { },
    });
    return {
        isRevealed: isRevealed,
        showDateModal: showDateModal,
        revealDateModal: reveal,
        getModalTimestamp: getModalTimestamp,
        confirmDateModal: confirm,
        cancelDateModal: cancel,
        initialDateModalValue: initialDateModalValue,
        dateModalTimeZone: dateModalTimeZone,
        dateModalTitle: dateModalTitle,
    };
}
function useSidcModal() {
    var _this = this;
    var _a = (0, core_1.useConfirmDialog)(), isRevealed = _a.isRevealed, reveal = _a.reveal, confirm = _a.confirm, cancel = _a.cancel;
    var initialSidcModalValue = (0, vue_1.ref)("10031000001211000000");
    var sidcModalTitle = (0, vue_1.ref)("Select symbol");
    var hideModifiers = (0, vue_1.ref)(false);
    var hideSymbolColor = (0, vue_1.ref)(false);
    var hideCustomSymbols = (0, vue_1.ref)(false);
    var symbolOptions = (0, vue_1.ref)({});
    var inheritedSymbolOptions = (0, vue_1.ref)({});
    var initialTab = (0, vue_1.ref)(0);
    var initialReinforcedReduced = (0, vue_1.ref)();
    var getModalSidc = function (initialValue_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([initialValue_1], args_1, true), void 0, function (initialValue, options) {
            var _a, data, isCanceled;
            var _b;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        nprogress_1.default.start();
                        initialSidcModalValue.value = initialValue;
                        sidcModalTitle.value = options.title || "Symbol picker";
                        hideModifiers.value = options.hideModifiers || false;
                        hideSymbolColor.value = options.hideSymbolColor || false;
                        inheritedSymbolOptions.value = options.inheritedSymbolOptions || {};
                        symbolOptions.value = options.symbolOptions || {};
                        initialTab.value = (_b = options.initialTab) !== null && _b !== void 0 ? _b : 0;
                        initialReinforcedReduced.value = options.reinforcedStatus;
                        return [4 /*yield*/, reveal()];
                    case 1:
                        _a = _c.sent(), data = _a.data, isCanceled = _a.isCanceled;
                        if (!isCanceled) {
                            return [2 /*return*/, data];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    var showSidcModal = (0, vue_1.computed)({
        get: function () {
            return isRevealed.value;
        },
        set: function (v) { },
    });
    return {
        isRevealed: isRevealed,
        showSidcModal: showSidcModal,
        revealSidcModal: reveal,
        getModalSidc: getModalSidc,
        confirmSidcModal: confirm,
        cancelSidcModal: cancel,
        initialSidcModalValue: initialSidcModalValue,
        sidcModalTitle: sidcModalTitle,
        hideModifiers: hideModifiers,
        hideSymbolColor: hideSymbolColor,
        symbolOptions: symbolOptions,
        inheritedSymbolOptions: inheritedSymbolOptions,
        initialTab: initialTab,
        initialReinforcedReduced: initialReinforcedReduced,
        hideCustomSymbols: hideCustomSymbols,
    };
}
