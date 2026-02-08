"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemMediaVariants = exports.itemVariants = exports.ItemTitle = exports.ItemSeparator = exports.ItemMedia = exports.ItemHeader = exports.ItemGroup = exports.ItemFooter = exports.ItemDescription = exports.ItemContent = exports.ItemActions = exports.Item = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var Item_vue_1 = require("./Item.vue");
Object.defineProperty(exports, "Item", { enumerable: true, get: function () { return Item_vue_1.default; } });
var ItemActions_vue_1 = require("./ItemActions.vue");
Object.defineProperty(exports, "ItemActions", { enumerable: true, get: function () { return ItemActions_vue_1.default; } });
var ItemContent_vue_1 = require("./ItemContent.vue");
Object.defineProperty(exports, "ItemContent", { enumerable: true, get: function () { return ItemContent_vue_1.default; } });
var ItemDescription_vue_1 = require("./ItemDescription.vue");
Object.defineProperty(exports, "ItemDescription", { enumerable: true, get: function () { return ItemDescription_vue_1.default; } });
var ItemFooter_vue_1 = require("./ItemFooter.vue");
Object.defineProperty(exports, "ItemFooter", { enumerable: true, get: function () { return ItemFooter_vue_1.default; } });
var ItemGroup_vue_1 = require("./ItemGroup.vue");
Object.defineProperty(exports, "ItemGroup", { enumerable: true, get: function () { return ItemGroup_vue_1.default; } });
var ItemHeader_vue_1 = require("./ItemHeader.vue");
Object.defineProperty(exports, "ItemHeader", { enumerable: true, get: function () { return ItemHeader_vue_1.default; } });
var ItemMedia_vue_1 = require("./ItemMedia.vue");
Object.defineProperty(exports, "ItemMedia", { enumerable: true, get: function () { return ItemMedia_vue_1.default; } });
var ItemSeparator_vue_1 = require("./ItemSeparator.vue");
Object.defineProperty(exports, "ItemSeparator", { enumerable: true, get: function () { return ItemSeparator_vue_1.default; } });
var ItemTitle_vue_1 = require("./ItemTitle.vue");
Object.defineProperty(exports, "ItemTitle", { enumerable: true, get: function () { return ItemTitle_vue_1.default; } });
exports.itemVariants = (0, class_variance_authority_1.cva)("group/item flex items-center border border-transparent text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", {
    variants: {
        variant: {
            default: "bg-transparent",
            outline: "border-border",
            muted: "bg-muted/50",
        },
        size: {
            default: "p-4 gap-4 ",
            sm: "py-3 px-4 gap-2.5",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
exports.itemMediaVariants = (0, class_variance_authority_1.cva)("flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5", {
    variants: {
        variant: {
            default: "bg-transparent",
            icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
            image: "size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
