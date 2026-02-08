"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testExtension = testExtension;
// @ts-nocheck
//sigint and reinforced addons to base geometries ####################################
function testExtension(ms) {
    var drawArray1 = [];
    var drawArray2 = [];
    var bbox_org = ms.BBox(this.bbox);
    var this_bbox = ms.BBox(this.bbox);
    var frameColor = this.colors.frameColor[this.metadata.affiliation];
    //If we don't have a geometry we shouldn't add anything.
    if (this.metadata.baseGeometry.g && frameColor) {
        var spacing = 18;
        if (this.metadata.affiliation == "Unknown" ||
            (this.metadata.affiliation == "Hostile" && this.metadata.dimension != "Subsurface")) {
            spacing = 18;
        }
        if (this.options.reinforced != undefined && this.options.reinforced != "") {
            drawArray2.push({
                type: "text",
                text: this.options.reinforced,
                x: bbox_org.x2 + spacing,
                y: 65,
                fill: frameColor,
                fontfamily: this.style.fontfamily,
                fontsize: 30,
                fontweight: "bold",
                textanchor: "middle",
            });
            this_bbox.merge({ x2: bbox_org.x2 + spacing + 22, y1: 65 - 40 });
        }
        if (this.options.signature == "!") {
            drawArray2.push({
                type: "text",
                text: "!",
                x: bbox_org.x2 + spacing,
                y: 170,
                fill: frameColor,
                fontfamily: this.style.fontfamily,
                fontsize: 50,
                fontweight: "bold",
                textanchor: "middle",
            });
            this_bbox.merge({
                x2: bbox_org.x2 + spacing + 22,
                y1: 170 - 25,
                y2: 170,
            });
        }
        if (this.options.specialheadquarter != undefined &&
            this.options.specialheadquarter != "") {
            var size = 42;
            var fontFamily = this.style.fontfamily;
            var fontColor = (typeof this.style.infoColor === "object"
                ? this.style.infoColor[this.metadata.affiliation]
                : this.style.infoColor) ||
                this.colors.iconColor[this.metadata.affiliation] ||
                this.colors.iconColor["Friend"];
            var y = 115;
            var str = this.options.specialheadquarter;
            if (str.length == 1) {
                size = 45;
                y = 115;
            }
            if (str.length == 3) {
                size = 35;
                y = 110;
            }
            if (str.length >= 4) {
                size = 32;
                y = 110;
            }
            drawArray2.push({
                type: "text",
                text: this.options.specialheadquarter,
                x: 100,
                y: y,
                textanchor: "middle",
                fontsize: size,
                fontfamily: fontFamily,
                fill: fontColor,
                stroke: false,
                fontweight: "bold",
            });
        }
        //outline
        if (this.style.outlineWidth > 0)
            drawArray1.push(ms.outline(drawArray2, this.style.outlineWidth, this.style.strokeWidth, typeof this.style.outlineColor === "object"
                ? this.style.outlineColor[this.metadata.affiliation]
                : this.style.outlineColor));
    }
    return { pre: drawArray1, post: drawArray2, bbox: this_bbox };
}
