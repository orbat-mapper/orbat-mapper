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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTypedCharValid = void 0;
exports.useExpandTree = useExpandTree;
exports.inputEventFilter = inputEventFilter;
exports.setCharAt = setCharAt;
exports.useFocusOnMount = useFocusOnMount;
var vue_1 = require("vue");
var nanoid_1 = require("nanoid");
var core_1 = require("@vueuse/core");
function useExpandTree(isOpen) {
    var _this = this;
    var itemRefs = [];
    var expandChildren = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isOpen)
                        isOpen.value = true;
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    if (itemRefs)
                        itemRefs.forEach(function (i) { return i.expandChildren(); });
                    return [2 /*return*/];
            }
        });
    }); };
    var setItemRef = function (el) {
        if (el)
            itemRefs.push(el);
    };
    (0, vue_1.onBeforeUpdate)(function () {
        itemRefs = [];
    });
    return { expandChildren: expandChildren, setItemRef: setItemRef };
}
function inputEventFilter(event) {
    var _a;
    return !(["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
        ((_a = event.target.dataset) === null || _a === void 0 ? void 0 : _a.indent) // added for FilterTree to avoid intervening with search
    );
}
function setCharAt(str, index, chr) {
    if (index > str.length - 1) {
        return str;
    }
    return str.substr(0, index) + chr + str.substr(index + 1);
}
function useFocusOnMount(id, delay) {
    var _this = this;
    if (delay === void 0) { delay = 0; }
    var focusId = id || (0, nanoid_1.nanoid)();
    (0, vue_1.onMounted)(function () { return __awaiter(_this, void 0, void 0, function () {
        var inputElement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!delay) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, core_1.promiseTimeout)(delay)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    inputElement = document.getElementById(focusId);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inputElement && inputElement.focus();
                    return [2 /*return*/];
            }
        });
    }); });
    return { focusId: focusId };
}
// Copied from https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/index.ts
var isTypedCharValid = function (_a) {
    var keyCode = _a.keyCode, metaKey = _a.metaKey, ctrlKey = _a.ctrlKey, altKey = _a.altKey;
    if (metaKey || ctrlKey || altKey)
        return false;
    // 0...9
    if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
        return true;
    // a...z
    if (keyCode >= 65 && keyCode <= 90)
        return true;
    // All other keys.
    return false;
};
exports.isTypedCharValid = isTypedCharValid;
