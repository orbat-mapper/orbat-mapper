"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRTAB = exports.TAB = exports.BR = void 0;
exports.createFromString = createFromString;
exports.getElements = getElements;
exports.getOneElement = getOneElement;
exports.nodeValue = nodeValue;
exports.tagValue = tagValue;
exports.tagIdValue = tagIdValue;
var unist_builder_1 = require("unist-builder");
var xastscript_1 = require("xastscript");
function createFromString(xmlString) {
    var parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
}
function getElements(element, tagName) {
    return Array.from(element.getElementsByTagName(tagName));
}
function getOneElement(element, tagName) {
    var elements = getElements(element, tagName);
    return elements.length ? elements[0] : null;
}
function nodeValue(node) {
    node === null || node === void 0 ? void 0 : node.normalize();
    return (node && node.textContent) || "";
}
exports.BR = (0, unist_builder_1.u)("text", "\n");
exports.TAB = (0, unist_builder_1.u)("text", "  ");
exports.BRTAB = (0, unist_builder_1.u)("text", "\n  ");
function tagValue(tagName, value) {
    return (0, xastscript_1.x)(tagName, [(0, unist_builder_1.u)("text", "".concat(value))]);
}
function tagIdValue(tagName, id, value) {
    return (0, xastscript_1.x)(tagName, { ID: id }, [(0, unist_builder_1.u)("text", "".concat(value))]);
}
