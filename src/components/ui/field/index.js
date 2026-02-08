"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTitle = exports.FieldSet = exports.FieldSeparator = exports.FieldLegend = exports.FieldLabel = exports.FieldGroup = exports.FieldError = exports.FieldDescription = exports.FieldContent = exports.Field = exports.fieldVariants = void 0;
var class_variance_authority_1 = require("class-variance-authority");
exports.fieldVariants = (0, class_variance_authority_1.cva)("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
    variants: {
        orientation: {
            vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
            horizontal: [
                "flex-row items-center",
                "[&>[data-slot=field-label]]:flex-auto",
                "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
            ],
            responsive: [
                "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
                "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
                "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
            ],
        },
    },
    defaultVariants: {
        orientation: "vertical",
    },
});
var Field_vue_1 = require("./Field.vue");
Object.defineProperty(exports, "Field", { enumerable: true, get: function () { return Field_vue_1.default; } });
var FieldContent_vue_1 = require("./FieldContent.vue");
Object.defineProperty(exports, "FieldContent", { enumerable: true, get: function () { return FieldContent_vue_1.default; } });
var FieldDescription_vue_1 = require("./FieldDescription.vue");
Object.defineProperty(exports, "FieldDescription", { enumerable: true, get: function () { return FieldDescription_vue_1.default; } });
var FieldError_vue_1 = require("./FieldError.vue");
Object.defineProperty(exports, "FieldError", { enumerable: true, get: function () { return FieldError_vue_1.default; } });
var FieldGroup_vue_1 = require("./FieldGroup.vue");
Object.defineProperty(exports, "FieldGroup", { enumerable: true, get: function () { return FieldGroup_vue_1.default; } });
var FieldLabel_vue_1 = require("./FieldLabel.vue");
Object.defineProperty(exports, "FieldLabel", { enumerable: true, get: function () { return FieldLabel_vue_1.default; } });
var FieldLegend_vue_1 = require("./FieldLegend.vue");
Object.defineProperty(exports, "FieldLegend", { enumerable: true, get: function () { return FieldLegend_vue_1.default; } });
var FieldSeparator_vue_1 = require("./FieldSeparator.vue");
Object.defineProperty(exports, "FieldSeparator", { enumerable: true, get: function () { return FieldSeparator_vue_1.default; } });
var FieldSet_vue_1 = require("./FieldSet.vue");
Object.defineProperty(exports, "FieldSet", { enumerable: true, get: function () { return FieldSet_vue_1.default; } });
var FieldTitle_vue_1 = require("./FieldTitle.vue");
Object.defineProperty(exports, "FieldTitle", { enumerable: true, get: function () { return FieldTitle_vue_1.default; } });
