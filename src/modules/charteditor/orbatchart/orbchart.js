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
exports.OrbatChart = void 0;
exports.isTreeLayout = isTreeLayout;
exports.isStackedTreeLayout = isStackedTreeLayout;
var d3_selection_1 = require("d3-selection");
var utils_1 = require("./utils");
var types_1 = require("./types");
var defaults_1 = require("./defaults");
var svgRender_1 = require("./svgRender");
var panzoom_1 = require("@panzoom/panzoom");
function isStackedLayout(layout) {
    return layout === types_1.LevelLayouts.Stacked;
}
function isLeftRightLayout(layout) {
    return layout === types_1.LevelLayouts.TreeRight || layout === types_1.LevelLayouts.TreeLeft;
}
function isTreeLayout(layout) {
    return (layout === types_1.LevelLayouts.TreeRight ||
        layout === types_1.LevelLayouts.TreeLeft ||
        layout === types_1.LevelLayouts.Tree);
}
function isStackedTreeLayout(layout) {
    return (layout === types_1.LevelLayouts.TreeRight ||
        layout === types_1.LevelLayouts.TreeLeft ||
        layout === types_1.LevelLayouts.Tree ||
        layout === types_1.LevelLayouts.Stacked);
}
var OrbatChart = /** @class */ (function () {
    function OrbatChart(rootNode, options, specificOptions) {
        if (options === void 0) { options = {}; }
        if (specificOptions === void 0) { specificOptions = {}; }
        this.rootNode = rootNode;
        this.specificOptions = specificOptions;
        this.groupedLevels = [];
        this.options = __assign(__assign({}, defaults_1.DEFAULT_OPTIONS), options);
        if (rootNode)
            this._computeOrbatInfo(rootNode);
        this.pz = null;
    }
    OrbatChart.prototype.cleanup = function () {
        // Remove event listeners
        if (this.svg) {
            this.svg.selectAll("g.o-unit").on("click", null);
            this._removeSelectEventListeners();
        }
        this._cleanupPanZoomInteraction();
    };
    OrbatChart.prototype._removeSelectEventListeners = function () {
        this.svg.selectAll(".select-rect").on("click", null);
    };
    OrbatChart.prototype.toSVG = function (parentElement, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.width, width = _c === void 0 ? defaults_1.DEFAULT_CHART_WIDTH : _c, _d = _b.height, height = _d === void 0 ? defaults_1.DEFAULT_CHART_HEIGHT : _d, elementId = _b.elementId, _e = _b.enablePanZoom, enablePanZoom = _e === void 0 ? false : _e;
        this.width = width;
        this.height = height;
        var renderedChart = this._createSvgRootElement(parentElement, elementId);
        var chartGroup = (0, svgRender_1.createGroupElement)(this.wrapperGroup, "o-chart");
        (0, svgRender_1.addFontAttributes)(chartGroup, this.options);
        this.connectorGroup = (0, svgRender_1.createGroupElement)(chartGroup, "o-connectors");
        (0, svgRender_1.addConnectorAttributes)(this.connectorGroup, this.options);
        // Pass 1: Create g elements and other svg elements
        // Pass 2: Do unit layout
        // Pass 3: Draw connectors
        renderedChart.levels = (0, svgRender_1.createInitialNodeStructure)(chartGroup, this.groupedLevels, this.options, this.specificOptions);
        this._doNodeLayout(renderedChart);
        this._drawConnectors(renderedChart);
        this.renderedChart = renderedChart;
        if (enablePanZoom) {
            this._addPanZoomInteraction();
        }
        else {
            this.pz = null;
        }
        return this.svg.node();
    };
    OrbatChart.prototype._addPanZoomInteraction = function () {
        var _this = this;
        var _a, _b;
        this.pz = (0, panzoom_1.default)(this.svg.node(), {
            maxScale: 10,
            pinchAndPan: true,
        });
        (_b = (_a = this.svg.node()) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.addEventListener("wheel", function (event) {
            var _a;
            (_a = _this.pz) === null || _a === void 0 ? void 0 : _a.zoomWithWheel(event);
        });
    };
    OrbatChart.prototype._cleanupPanZoomInteraction = function () {
        var _a, _b;
        if (this.pz) {
            (_b = (_a = this.svg.node()) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.removeEventListener("wheel", this.pz.zoomWithWheel);
            this.pz.destroy();
        }
    };
    OrbatChart.prototype.highlightLevel = function (levelNumber) {
        var _this = this;
        var _a;
        var backgroundLayer = (0, d3_selection_1.select)("#o-highlight-layer");
        var groupElement = (0, d3_selection_1.select)("#o-level-".concat(levelNumber));
        var bbox = (_a = groupElement.node()) === null || _a === void 0 ? void 0 : _a.getBBox();
        if (!bbox)
            return;
        var offset = 20;
        var tmp = backgroundLayer
            .append("rect")
            .attr("x", bbox.x - offset * 2)
            .attr("y", bbox.y - offset)
            .attr("width", bbox.width + 4 * offset)
            .attr("height", bbox.height + 2 * offset)
            .attr("class", "highlight select-rect");
        if (this.options.onLevelClick) {
            tmp.on("click", function (e) {
                _this.options.onLevelClick(levelNumber);
            });
        }
    };
    OrbatChart.prototype.highlightGroup = function (renderedBranch) {
        var _this = this;
        var backgroundLayer = (0, d3_selection_1.select)("#o-highlight-layer");
        var groupElement = renderedBranch.groupElement;
        var bbox = groupElement.node().getBBox();
        var offset = 10;
        var tmp = backgroundLayer
            .append("rect")
            .attr("x", bbox.x - offset * 2)
            .attr("y", bbox.y - offset)
            .attr("width", bbox.width + 4 * offset)
            .attr("height", bbox.height + 2 * offset)
            .attr("class", "highlight select-rect");
        if (this.options.onBranchClick) {
            tmp.on("click", function (e) {
                var _a, _b;
                _this.options.onBranchClick(((_b = (_a = renderedBranch.units[0]) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.unit.id) || 0, renderedBranch.level);
            });
        }
    };
    OrbatChart.prototype._createSvgRootElement = function (parentElement, elementId) {
        parentElement.innerHTML = "";
        var svg = (0, d3_selection_1.select)(parentElement)
            .append("svg")
            .attr("viewBox", "0 0 ".concat(this.width, " ").concat(this.height))
            .attr("class", "orbat-chart");
        if (elementId)
            svg.attr("id", elementId);
        svg.append("style").text((0, svgRender_1.createChartStyle)(this.options));
        svg.attr("width", "100%");
        svg.attr("height", "100%");
        this.wrapperGroup = (0, svgRender_1.createGroupElement)(svg, "o-wrapper");
        if (this.options.debug) {
            this.wrapperGroup
                .append("rect")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("y", "0")
                .attr("x", "0")
                .attr("width", this.width)
                .attr("height", this.height);
        }
        (0, svgRender_1.createGroupElement)(this.wrapperGroup, "", "o-highlight-layer");
        this.svg = svg;
        return {
            groupElement: this.wrapperGroup,
            levels: [],
        };
    };
    OrbatChart.prototype._computeOrbatInfo = function (rootNode) {
        var levels = [];
        var nodeMap = {};
        (0, utils_1.walkTree)(rootNode, function (unit, levelIdx, parent) {
            var unitNodeInfo = { unit: unit };
            var currentLevel = levels[levelIdx] || [];
            if (parent) {
                unitNodeInfo.parent = nodeMap[parent.id];
            }
            nodeMap[unit.id] = unitNodeInfo;
            currentLevel.push(unitNodeInfo);
            levels[levelIdx] = currentLevel;
        });
        this.groupedLevels = groupLevelsByParent();
        function groupLevelsByParent() {
            var groupedLevels = [];
            levels.forEach(function (level, yIdx) {
                groupedLevels[yIdx] = level.reduce(function (accumulator, currentValue, currentIndex, array) {
                    if (currentIndex === 0) {
                        accumulator.push([currentValue]);
                        return accumulator;
                    }
                    if (array[currentIndex - 1].parent === currentValue.parent) {
                        accumulator[accumulator.length - 1].push(currentValue);
                        return accumulator;
                    }
                    accumulator.push([currentValue]);
                    return accumulator;
                }, []);
            });
            return groupedLevels;
        }
    };
    OrbatChart.prototype._doNodeLayout = function (renderedChart) {
        var _this = this;
        var numberOfLevels = this.groupedLevels.length;
        var maxLevels = this.options.maxLevels || numberOfLevels;
        var chartHeight = this.height;
        var prevY = defaults_1.MARGIN_TOP;
        renderedChart.levels.forEach(function (renderedLevel, yIdx) {
            var levelOptions = __assign(__assign({}, _this.options), renderedLevel.options);
            var y;
            if (_this.options.verticalAlignment === types_1.VerticalAlignments.Middle) {
                y = chartHeight * ((yIdx + 1) / (numberOfLevels + 1));
            }
            else {
                y = prevY;
                prevY += levelOptions.levelPadding;
            }
            var levelLayout = types_1.LevelLayouts.Horizontal;
            if (yIdx === maxLevels - 1)
                levelLayout = _this.options.lastLevelLayout;
            _this._renderLevel(renderedLevel, y, levelLayout);
        });
    };
    OrbatChart.prototype._renderLevel = function (renderedLevel, y, levelLayout) {
        if (levelLayout === void 0) { levelLayout = types_1.LevelLayouts.Horizontal; }
        var levelOptions = __assign(__assign({}, this.options), renderedLevel.options);
        var chartWidth = this.width;
        var wrapperGroup = this.wrapperGroup;
        var renderGroups = renderedLevel.branches;
        var unitsOnLevel = (0, utils_1.flattenArray)(renderGroups.map(function (unitGroup) { return unitGroup.units; }));
        var numberOfUnitsOnLevel = unitsOnLevel.length;
        var totalWidth = (0, utils_1.arrSum)(unitsOnLevel.map(function (u) { return u.boundingBox.width; }));
        var availableSpace = chartWidth - totalWidth;
        var padding = availableSpace / numberOfUnitsOnLevel;
        switch (levelLayout) {
            case types_1.LevelLayouts.Horizontal:
                _doHorizontalLayout();
                break;
            case types_1.LevelLayouts.Tree:
                _doTreeLayout();
                break;
            case types_1.LevelLayouts.Stacked:
            case types_1.LevelLayouts.TreeRight:
            case types_1.LevelLayouts.TreeLeft:
                _doStackedLayout(levelLayout);
                break;
            default:
                console.warn("Unhandled layout", levelLayout);
        }
        if (levelOptions.debug)
            (0, svgRender_1.drawDebugRect)(renderedLevel.groupElement);
        function _doHorizontalLayout() {
            var xIdx = 0;
            var prevX = -padding / 2;
            renderedLevel.branches.forEach(function (unitBranch, groupIdx) {
                var branchOptions = __assign(__assign({}, levelOptions), unitBranch.options);
                for (var _i = 0, _a = unitBranch.units; _i < _a.length; _i++) {
                    var unitNode = _a[_i];
                    var x = void 0;
                    var unitOptions = __assign(__assign({}, branchOptions), unitNode.options);
                    if (unitOptions.unitLevelDistance === types_1.UnitLevelDistances.EqualPadding) {
                        x = prevX + unitNode.boundingBox.width / 2 + padding;
                    }
                    else {
                        x = ((xIdx + 1) * chartWidth) / (numberOfUnitsOnLevel + 1);
                    }
                    unitNode.x = x;
                    unitNode.y = y;
                    (0, svgRender_1.calculateAnchorPoints)(unitNode);
                    prevX = unitNode.x + unitNode.boundingBox.width / 2;
                    (0, svgRender_1.putGroupAt)(unitNode.groupElement, unitNode, x, y, unitOptions.debug);
                    if (unitOptions.debug)
                        (0, svgRender_1.drawDebugAnchors)(wrapperGroup, unitNode);
                    xIdx += 1;
                }
                if (branchOptions.debug)
                    (0, svgRender_1.drawDebugRect)(unitBranch.groupElement, "yellow");
            });
        }
        function _doTreeLayout() {
            var groupsOnLevel = renderedLevel.branches.length;
            renderedLevel.branches.forEach(function (unitBranch, groupIdx) {
                var branchOptions = __assign(__assign({}, levelOptions), unitBranch.options);
                var prevY = y;
                for (var _i = 0, _a = unitBranch.units.entries(); _i < _a.length; _i++) {
                    var _b = _a[_i], yIdx = _b[0], unitNode = _b[1];
                    var unitOptions = __assign(__assign({}, branchOptions), unitNode.options);
                    var x = unitNode.parent
                        ? unitNode.parent.x
                        : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);
                    if (yIdx % 2) {
                        x += unitOptions.treeOffset;
                    }
                    else {
                        x -= unitOptions.treeOffset;
                    }
                    var ny = prevY;
                    unitNode.x = x;
                    unitNode.y = ny;
                    (0, svgRender_1.calculateAnchorPoints)(unitNode);
                    if (yIdx % 2)
                        prevY = unitNode.ly + unitOptions.stackedOffset;
                    (0, svgRender_1.putGroupAt)(unitNode.groupElement, unitNode, x, ny, unitOptions.debug);
                    if (unitOptions.debug)
                        (0, svgRender_1.drawDebugAnchors)(wrapperGroup, unitNode);
                }
                if (branchOptions.debug)
                    (0, svgRender_1.drawDebugRect)(unitBranch.groupElement, "yellow");
            });
        }
        function _doStackedLayout(layout) {
            var groupsOnLevel = renderedLevel.branches.length;
            renderedLevel.branches.forEach(function (unitBranch, groupIdx) {
                var branchOptions = __assign(__assign({}, levelOptions), unitBranch.options);
                var prevY = y;
                for (var _i = 0, _a = unitBranch.units.entries(); _i < _a.length; _i++) {
                    var _b = _a[_i], yIdx = _b[0], unitNode = _b[1];
                    var unitOptions = __assign(__assign({}, branchOptions), unitNode.options);
                    var x = unitNode.parent
                        ? unitNode.parent.x
                        : ((groupIdx + 1) * chartWidth) / (groupsOnLevel + 1);
                    if (layout === types_1.LevelLayouts.TreeRight) {
                        x += unitOptions.treeOffset;
                    }
                    else if (layout === types_1.LevelLayouts.TreeLeft) {
                        x -= unitOptions.treeOffset;
                    }
                    var ny = prevY;
                    unitNode.x = x;
                    unitNode.y = ny;
                    (0, svgRender_1.calculateAnchorPoints)(unitNode);
                    prevY = unitNode.ly + unitOptions.stackedOffset;
                    (0, svgRender_1.putGroupAt)(unitNode.groupElement, unitNode, x, ny, unitOptions.debug);
                    if (unitOptions.debug)
                        (0, svgRender_1.drawDebugAnchors)(wrapperGroup, unitNode);
                }
                if (branchOptions.debug)
                    (0, svgRender_1.drawDebugRect)(unitBranch.groupElement, "yellow");
            });
        }
    };
    OrbatChart.prototype._drawConnectors = function (renderedChart) {
        var _this = this;
        var nLevels = this.options.maxLevels || renderedChart.levels.length;
        renderedChart.levels.forEach(function (renderedLevel, yIdx) {
            var levelOptions = __assign(__assign({}, _this.options), renderedLevel.options);
            var currentLevelGElement = yIdx > 0
                ? (0, svgRender_1.createGroupElement)(_this.connectorGroup, "", "o-connectors-level-".concat(yIdx))
                : null;
            if (currentLevelGElement)
                (0, svgRender_1.addConnectorAttributes)(currentLevelGElement, levelOptions);
            renderedLevel.branches.forEach(function (branch, groupIdx) {
                var parent = branch.units[0].parent;
                var currentLevelLayout = yIdx === nLevels - 1 ? _this.options.lastLevelLayout : types_1.LevelLayouts.Horizontal;
                var branchOptions = __assign(__assign({}, levelOptions), branch.options);
                if (!currentLevelGElement)
                    return;
                var branchId = "o-connectors-group-".concat(parent ? parent.unit.id : 0);
                var currentBranchElement = (0, svgRender_1.createGroupElement)(currentLevelGElement, "", branchId);
                (0, svgRender_1.addConnectorAttributes)(currentBranchElement, branchOptions);
                branch.units.forEach(function (unitNode, idx) {
                    var unitOptions = __assign(__assign({}, branchOptions), unitNode.options);
                    if (currentLevelLayout === types_1.LevelLayouts.Stacked && idx > 0)
                        return;
                    if (isLeftRightLayout(currentLevelLayout))
                        return;
                    if (currentLevelLayout === types_1.LevelLayouts.Tree)
                        return;
                    (0, svgRender_1.drawUnitBranchConnectorPath)(currentBranchElement, unitNode, unitOptions);
                });
                switch (currentLevelLayout) {
                    case types_1.LevelLayouts.TreeRight:
                    case types_1.LevelLayouts.TreeLeft:
                    case types_1.LevelLayouts.Tree:
                        (0, svgRender_1.drawUnitBranchTreeLeftRightConnectorPath)(currentBranchElement, branch.units, currentLevelLayout, branchOptions);
                        break;
                    default:
                        (0, svgRender_1.drawUnitLevelConnectorPath)(currentBranchElement, branch.units, branchOptions);
                }
            });
        });
    };
    OrbatChart.prototype.makeInteractive = function () {
        this._addSelectionLayer(this.renderedChart);
    };
    OrbatChart.prototype._addSelectionLayer = function (renderedChart) {
        var _this = this;
        renderedChart.levels.forEach(function (level, levelNumber) {
            _this.highlightLevel(levelNumber);
            level.branches.forEach(function (branch) {
                _this.highlightGroup(branch);
            });
        });
    };
    OrbatChart.prototype.removeSelectionLayer = function () {
        this._removeSelectEventListeners();
        this.svg.selectAll("#o-highlight-layer rect").remove();
    };
    OrbatChart.prototype.highlightLevels = function (levelIndexes) {
        console.log("Not implemented yet", levelIndexes);
    };
    OrbatChart.prototype.resetZoom = function () {
        var _a;
        (_a = this.pz) === null || _a === void 0 ? void 0 : _a.reset();
    };
    OrbatChart.prototype.zoomIn = function () {
        var _a;
        (_a = this.pz) === null || _a === void 0 ? void 0 : _a.zoomIn();
    };
    OrbatChart.prototype.zoomOut = function () {
        var _a;
        (_a = this.pz) === null || _a === void 0 ? void 0 : _a.zoomOut();
    };
    OrbatChart.prototype.getPanScale = function () {
        if (this.pz) {
            return { pan: this.pz.getPan(), scale: this.pz.getScale() };
        }
        else
            return null;
    };
    OrbatChart.prototype.setPanScale = function (pan, scale) {
        var _this = this;
        if (this.pz) {
            this.pz.zoom(scale);
            setTimeout(function () { var _a; return (_a = _this.pz) === null || _a === void 0 ? void 0 : _a.pan(pan.x, pan.y); });
        }
    };
    return OrbatChart;
}());
exports.OrbatChart = OrbatChart;
