"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlTagEscape = htmlTagEscape;
exports.isUrl = isUrl;
exports.wordWrap = wordWrap;
function htmlTagEscape(text) {
    return text.replace(/&/g, " ").replace(/</g, " ").replace(/>/g, " ");
}
function isUrl(str) {
    try {
        new URL(str);
    }
    catch (_) {
        return false;
    }
    return true;
}
/**
 * Word wraps a string to a specific line length.
 *
 * Note: this is a very simple and naive implementation. For more robust solutions,
 * consider using libraries like 'wordwrapjs' or 'wrap-ansi'.
 */
function wordWrap(text, _a) {
    var _b = _a.width, width = _b === void 0 ? 20 : _b;
    var words = text.split(" ");
    var line = "";
    var result = "";
    for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
        var word = words_1[_i];
        // If adding the next word exceeds maxLength, start a new line
        if ((line + word).length > width) {
            if (result)
                result += "\n";
            result += line.trim();
            line = "";
        }
        line += word + " ";
    }
    // Add the last line
    if (line.trim().length > 0) {
        if (result)
            result += "\n";
        result += line.trim();
    }
    return result;
}
