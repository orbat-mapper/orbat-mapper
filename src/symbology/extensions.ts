// @ts-nocheck
//sigint and reinforced addons to base geometries ####################################
export function testExtension(ms) {
  let drawArray1 = [];
  let drawArray2 = [];
  let bbox_org = ms.BBox(this.bbox);
  let this_bbox = ms.BBox(this.bbox);
  let frameColor = this.colors.frameColor[this.metadata.affiliation];
  //If we don't have a geometry we shouldn't add anything.
  if (this.metadata.baseGeometry.g && frameColor) {
    let spacing = 18;
    if (
      this.metadata.affiliation == "Unknown" ||
      (this.metadata.affiliation == "Hostile" && this.metadata.dimension != "Subsurface")
    ) {
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
    if (
      this.options.specialheadquarter != undefined &&
      this.options.specialheadquarter != ""
    ) {
      let size = 42;
      let fontFamily = this.style.fontfamily;
      let fontColor =
        (typeof this.style.infoColor === "object"
          ? this.style.infoColor[this.metadata.affiliation]
          : this.style.infoColor) ||
        this.colors.iconColor[this.metadata.affiliation] ||
        this.colors.iconColor["Friend"];
      let y = 115;
      let str = this.options.specialheadquarter;
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
      drawArray1.push(
        ms.outline(
          drawArray2,
          this.style.outlineWidth,
          this.style.strokeWidth,
          typeof this.style.outlineColor === "object"
            ? this.style.outlineColor[this.metadata.affiliation]
            : this.style.outlineColor,
        ),
      );
  }
  return { pre: drawArray1, post: drawArray2, bbox: this_bbox };
}
