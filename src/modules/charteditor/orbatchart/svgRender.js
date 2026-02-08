"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChartStyle = createChartStyle;
exports.createInitialNodeStructure = createInitialNodeStructure;
exports.putGroupAt = putGroupAt;
exports.createGroupElement = createGroupElement;
exports.drawDebugRect = drawDebugRect;
exports.createUnitGroup = createUnitGroup;
exports.calculateAnchorPoints = calculateAnchorPoints;
exports.drawDebugAnchors = drawDebugAnchors;
exports.drawUnitBranchConnectorPath = drawUnitBranchConnectorPath;
exports.drawUnitLevelConnectorPath = drawUnitLevelConnectorPath;
exports.drawUnitBranchTreeLeftRightConnectorPath = drawUnitBranchTreeLeftRightConnectorPath;
exports.addFontAttributes = addFontAttributes;
exports.addConnectorAttributes = addConnectorAttributes;
var types_1 = require("./types");
var milsymbol_1 = require("milsymbol");
var utils_1 = require("@/utils");
var utils_2 = require("@/modules/charteditor/orbatchart/utils");
var HIGHLIGT_STYLE = "\n  .o-unit:hover {\n    fill: #770303;\n    cursor: pointer;\n    font-weight: bold;\n  }\n\n  .highlight {\n    stroke: none;\n    stroke-dasharray: 5, 5;\n    fill: white;\n    fill-opacity: 0;\n  }\n\n  .highlight:hover {\n    stroke: gray;\n    stroke-width: 2pt;\n    fill: #ccc;\n    fill-opacity: 0.1;\n  }\n";
function createChartStyle(options) {
    return "\n.o-line {\nstroke-linecap: round\n \n}\n\n.o-label {\n  text-anchor: middle;\n  dominant-baseline: hanging;\n}\n\n.o-label-right {\n  text-anchor: start;\n  dominant-baseline: middle;\n}\n\n".concat(HIGHLIGT_STYLE, "\n");
}
function convertBasicUnitNode2UnitNodeInfo(basicUnitNode, options) {
    var symbolOptions = __assign({ size: options.symbolSize }, basicUnitNode.unit.symbolOptions);
    var symb = options.symbolGenerator
        ? options.symbolGenerator(basicUnitNode.unit.sidc, symbolOptions)
        : new milsymbol_1.default.Symbol(basicUnitNode.unit.sidc, symbolOptions);
    var unitNodeInfo = basicUnitNode;
    unitNodeInfo.symbolBoxSize = symb.getSize();
    unitNodeInfo.anchor = symb.getAnchor();
    unitNodeInfo.octagonAnchor = symb.getOctagonAnchor();
    unitNodeInfo.symb = symb;
    unitNodeInfo.x = 0;
    unitNodeInfo.y = 0;
    unitNodeInfo.lx = 0;
    unitNodeInfo.rx = 0;
    unitNodeInfo.ly = 0;
    return unitNodeInfo;
}
function createInitialNodeStructure(parentElement, groupedLevels, options, specificOptions) {
    var _a;
    var renderedLevels = [];
    var _loop_1 = function (levelNumber, currentLevel) {
        if (options.maxLevels && levelNumber >= options.maxLevels)
            return "break";
        var levelSpecificOptions = ((_a = specificOptions.level) === null || _a === void 0 ? void 0 : _a[levelNumber]) || {};
        var levelGElement = createGroupElement(parentElement, "o-level", "o-level-".concat(levelNumber));
        addFontAttributes(levelGElement, levelSpecificOptions);
        var renderedLevel = {
            groupElement: levelGElement,
            branches: [],
            options: levelSpecificOptions,
        };
        renderedLevels.push(renderedLevel);
        var levelOptions = __assign(__assign({}, options), levelSpecificOptions);
        currentLevel.forEach(function (branch, groupIdx) {
            var _a;
            var parent = branch[0].parent;
            var branchSpecificOptions = {};
            if (parent) {
                branchSpecificOptions = ((_a = specificOptions.branch) === null || _a === void 0 ? void 0 : _a[parent.unit.id]) || {};
            }
            var branchOptions = __assign(__assign({}, levelOptions), branchSpecificOptions);
            var branchId = "o-branch-".concat(parent ? parent.unit.id : 0);
            var branchGElement = createGroupElement(levelGElement, "o-branch", branchId);
            addFontAttributes(branchGElement, branchSpecificOptions);
            var units = branch.map(function (unitNode) {
                var _a;
                var unitSpecificOptions = ((_a = specificOptions.unit) === null || _a === void 0 ? void 0 : _a[unitNode.unit.id]) || {};
                var unitOptions = __assign(__assign({}, branchOptions), unitSpecificOptions);
                var renderedUnitNode = createUnitGroup(branchGElement, convertBasicUnitNode2UnitNodeInfo(unitNode, unitOptions), unitOptions, unitSpecificOptions, levelNumber);
                renderedUnitNode.options = unitSpecificOptions;
                return renderedUnitNode;
            });
            renderedLevel.branches.push({
                groupElement: branchGElement,
                units: units,
                options: branchSpecificOptions,
                level: levelNumber,
            });
        });
    };
    for (var _i = 0, _b = groupedLevels.entries(); _i < _b.length; _i++) {
        var _c = _b[_i], levelNumber = _c[0], currentLevel = _c[1];
        var state_1 = _loop_1(levelNumber, currentLevel);
        if (state_1 === "break")
            break;
    }
    return renderedLevels;
}
function putGroupAt(g, node, x, y, debug) {
    if (debug === void 0) { debug = false; }
    var dx = x - node.octagonAnchor.x;
    var dy = y - node.octagonAnchor.y;
    return g.attr("transform", "translate(".concat(dx, ", ").concat(dy, ")"));
}
function createGroupElement(parentElement, className, id) {
    if (id === void 0) { id = ""; }
    var el = parentElement.append("g").attr("class", className);
    if (id) {
        el.attr("id", id);
    }
    return el;
}
function drawDebugRect(groupElement, fill) {
    if (fill === void 0) { fill = "#ccc"; }
    if (groupElement) {
        var bbox = groupElement.node().getBBox();
        groupElement
            .append("rect")
            .lower()
            .classed("dbg-rect", true)
            .attr("x", bbox.x)
            .attr("y", bbox.y)
            .attr("width", bbox.width)
            .attr("height", bbox.height)
            .style("fill", fill)
            .style("fill-opacity", ".4")
            .style("stroke", "#666")
            .style("stroke-width", "1.5px");
    }
}
function drawDebugPoint(parentElement, x, y, fillColor) {
    if (fillColor === void 0) { fillColor = "red"; }
    parentElement
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", fillColor);
}
function createUnitGroup(parentElement, unitNode, options, specificOptions, level) {
    var _a;
    var g = createGroupElement(parentElement, "o-unit");
    var unitLabel = options.useShortName
        ? unitNode.unit.shortName || unitNode.unit.name
        : unitNode.unit.name;
    var isLastLevel = level === options.maxLevels - 1;
    g.append("g").html(unitNode.symb.asSVG());
    var x = unitNode.octagonAnchor.x;
    var y = unitNode.symbolBoxSize.height;
    var dy = "".concat(options.labelOffset, "pt");
    var dx = "0";
    var classes = "o-label";
    if (!options.hideLabel) {
        if (options.labelPlacement === "right") {
            y = unitNode.octagonAnchor.y;
            x = x + unitNode.symbolBoxSize.width / 2;
            dx = "".concat(options.labelOffset, "pt");
            dy = "0";
            classes = "o-label-right";
        }
        var text = g
            .append("text")
            .attr("x", x)
            .attr("dy", dy)
            .attr("dx", dx)
            .attr("y", y)
            .attr("class", classes)
            .text(unitLabel);
        if (specificOptions.fontSize)
            text.attr("font-size", "".concat(options.fontSize, "pt"));
        if (specificOptions.fontWeight)
            text.attr("font-weight", options.fontWeight);
        if (specificOptions.fontStyle)
            text.attr("font-style", options.fontStyle);
        if (specificOptions.fontColor)
            text.attr("fill", options.fontColor);
    }
    if (options.showPersonnel || options.showEquipment) {
        var _b = aggregateData(unitNode.unit), aggregatedPersonnel = _b.aggregatedPersonnel, aggregatedEquipment = _b.aggregatedEquipment;
        if (options.showPersonnel && aggregatedPersonnel.length) {
            var sum = aggregatedPersonnel.reduce(function (acc, p) { return acc + p.count; }, 0);
            var label = aggregatedPersonnel.map(function (p) { return "".concat(p.count); }).join("/");
            y += 25;
            var text = g
                .append("text")
                .attr("x", x)
                .attr("dy", dy)
                .attr("y", y)
                .attr("class", classes)
                .text("".concat(label, "  (").concat(sum, ")"));
        }
        if (options.showEquipment && (isLastLevel || !((_a = unitNode.unit.subUnits) === null || _a === void 0 ? void 0 : _a.length))) {
            y += 25;
            aggregatedEquipment.forEach(function (e, idx) {
                var text = g
                    .append("text")
                    .attr("x", x)
                    .attr("dy", dy)
                    .attr("y", y + idx * 20)
                    .attr("class", classes)
                    .text("".concat(e.count, " x ").concat(e.name));
                text.attr("font-size", "".concat(options.fontSize * 0.9, "pt"));
            });
        }
    }
    if (options.onClick) {
        g.on("click", function (e) {
            // @ts-ignore
            options.onClick(unitNode);
        });
    }
    if (options.debug) {
        drawDebugRect(g);
    }
    var renderedUnitNode = unitNode;
    renderedUnitNode.groupElement = g;
    renderedUnitNode.boundingBox = g.node().getBBox();
    renderedUnitNode.level = level;
    return renderedUnitNode;
}
function aggregateData(unit) {
    var aggEquipment = {};
    var aggPersonnel = {};
    (0, utils_2.walkTree)(unit, function (unit) {
        var _a, _b;
        (_a = unit.equipment) === null || _a === void 0 ? void 0 : _a.forEach(function (e) {
            var _a;
            aggEquipment[e.name] = ((_a = aggEquipment[e.name]) !== null && _a !== void 0 ? _a : 0) + e.count;
        });
        (_b = unit.personnel) === null || _b === void 0 ? void 0 : _b.forEach(function (p) {
            var _a;
            aggPersonnel[p.name] = ((_a = aggPersonnel[p.name]) !== null && _a !== void 0 ? _a : 0) + p.count;
        });
    });
    var aggregatedEquipment = (0, utils_1.sortBy)(Object.entries(aggEquipment).map(function (_a) {
        var name = _a[0], count = _a[1];
        return ({
            name: name,
            count: count,
        });
    }), "name");
    var aggregatedPersonnel = (0, utils_1.sortBy)(Object.entries(aggPersonnel).map(function (_a) {
        var name = _a[0], count = _a[1];
        return ({
            name: name,
            count: count,
        });
    }), "name");
    return { aggregatedEquipment: aggregatedEquipment, aggregatedPersonnel: aggregatedPersonnel };
}
function calculateAnchorPoints(unitNode) {
    var x = unitNode.x, y = unitNode.y;
    unitNode.ly = y + (unitNode.boundingBox.height - unitNode.octagonAnchor.y);
    unitNode.lx = x - unitNode.boundingBox.width / 2;
    unitNode.rx = x + unitNode.boundingBox.width / 2;
    // Todo: should use octagon width instead
    unitNode.lsx = x - unitNode.symbolBoxSize.width / 2;
    unitNode.rsx = x + unitNode.symbolBoxSize.width / 2;
}
function drawDebugAnchors(svg, unitNode) {
    drawDebugPoint(svg, unitNode.x, unitNode.y);
    drawDebugPoint(svg, unitNode.x, unitNode.ly);
    drawDebugPoint(svg, unitNode.lx, unitNode.y);
    drawDebugPoint(svg, unitNode.rx, unitNode.y);
    drawDebugPoint(svg, unitNode.rsx, unitNode.y);
    drawDebugPoint(svg, unitNode.lsx, unitNode.y);
}
function drawUnitBranchConnectorPath(g, unit, options) {
    var x = unit.x, y = unit.y;
    if (unit.parent) {
        var dy = y - (y - unit.parent.y) / 2;
        var d = "M ".concat(x, ", ").concat(y - unit.octagonAnchor.y - options.connectorOffset, " V ").concat(dy);
        g.append("path").attr("d", d).classed("o-line", true);
    }
}
function drawUnitLevelConnectorPath(g, unitBranch, options) {
    var firstUnitInGroup = unitBranch[0];
    var parentUnit = firstUnitInGroup.parent;
    if (!parentUnit)
        return;
    var lastUnitInGroup = unitBranch[unitBranch.length - 1];
    var dy = firstUnitInGroup.y - (firstUnitInGroup.y - parentUnit.y) / 2;
    var d1 = "M ".concat(parentUnit.x, ", ").concat(parentUnit.ly + options.connectorOffset, " V ").concat(dy);
    g.append("path").attr("d", d1).classed("o-line", true);
    var d = "M ".concat(firstUnitInGroup.x, ", ").concat(dy, " \n  H ").concat(Math.max(lastUnitInGroup.x, parentUnit.x));
    g.append("path").attr("d", d).classed("o-line", true);
}
function drawUnitBranchTreeLeftRightConnectorPath(g, unitBranch, levelLayout, options) {
    var lastUnitInGroup = unitBranch[unitBranch.length - 1];
    var parentUnit = lastUnitInGroup.parent;
    if (!parentUnit)
        return;
    var d1 = "M ".concat(parentUnit.x, ", ").concat(parentUnit.ly + options.connectorOffset, " V ").concat(lastUnitInGroup.y);
    g.append("path").attr("d", d1).classed("o-line", true);
    // find the widest node
    var maxWidth = Math.max.apply(Math, unitBranch.map(function (u) { return u.boundingBox.width; }));
    for (var _i = 0, _a = unitBranch.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], yIdx = _b[0], unit = _b[1];
        var d1_1 = void 0;
        // const delta = Math.abs(unit.boundingBox.width / 2 - maxWidth / 2);
        var delta = 0;
        if (levelLayout === types_1.LevelLayouts.TreeRight ||
            (levelLayout === types_1.LevelLayouts.Tree && yIdx % 2))
            d1_1 = "M ".concat(unit.lsx - delta - options.connectorOffset, ", ").concat(unit.y, "  H ").concat(parentUnit.x);
        else
            d1_1 = "M ".concat(unit.rsx + delta + options.connectorOffset, ", ").concat(unit.y, "  H ").concat(parentUnit.x);
        g.append("path").attr("d", d1_1).classed("o-line", true);
    }
}
function addFontAttributes(group, options) {
    var fontSize = options.fontSize, fontWeight = options.fontWeight, fontStyle = options.fontStyle, fontColor = options.fontColor;
    fontSize && group.attr("font-size", "".concat(fontSize, "pt"));
    fontWeight && group.attr("font-weight", fontWeight);
    fontStyle && group.attr("font-style", fontStyle);
    fontColor && group.attr("fill", fontColor);
}
function addConnectorAttributes(group, options) {
    var lineColor = options.lineColor, lineWidth = options.lineWidth;
    lineColor && group.attr("stroke", lineColor);
    lineWidth && group.attr("stroke-width", "".concat(lineWidth, "pt"));
}
