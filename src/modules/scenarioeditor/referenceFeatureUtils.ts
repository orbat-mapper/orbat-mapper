import type { FeatureLike } from "ol/Feature";
import type BaseLayer from "ol/layer/Base";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";
import { sanitizeHTML } from "@/utils/dom";

const allowedHtmlTags = new Set([
  "a",
  "b",
  "blockquote",
  "body",
  "br",
  "caption",
  "col",
  "colgroup",
  "code",
  "dd",
  "dl",
  "dt",
  "div",
  "em",
  "font",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const allowedCssProperties = new Set([
  "background",
  "background-color",
  "border",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-style",
  "border-top-width",
  "border-width",
  "color",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "text-align",
  "text-decoration",
  "vertical-align",
  "white-space",
  "width",
]);

export interface ReferenceFeatureDisplayValue {
  kind: "text" | "html";
  value: string;
}

export function extractReferenceFeatureSelection(
  feature: FeatureLike,
  layer?: BaseLayer | null,
): ReferenceFeatureSelection {
  const properties = { ...(feature.getProperties?.() ?? {}) };
  delete properties.geometry;

  const featureName =
    typeof properties.name === "string"
      ? properties.name
      : typeof properties.title === "string"
        ? properties.title
        : undefined;

  return {
    layerId: layer?.get("id"),
    layerName: String(layer?.get("title") ?? layer?.get("name") ?? "Reference layer"),
    featureId: feature.getId?.(),
    name: featureName,
    properties,
  };
}

export function formatReferenceFeatureValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function getReferenceFeatureDisplayValue(
  value: unknown,
): ReferenceFeatureDisplayValue {
  const textValue = formatReferenceFeatureValue(value);
  if (typeof value === "string" && isProbablyHtml(value)) {
    return {
      kind: "html",
      value: sanitizeReferenceFeatureHtml(value),
    };
  }
  return {
    kind: "text",
    value: textValue,
  };
}

function isProbablyHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeReferenceFeatureHtml(value: string): string {
  if (typeof document === "undefined") return sanitizeHTML(value);

  const template = document.createElement("template");
  template.innerHTML = value;
  return Array.from(template.content.childNodes)
    .map((node) => serializeSanitizedNode(node))
    .join("");
}

function serializeSanitizedNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return sanitizeHTML(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map((child) => serializeSanitizedNode(child))
    .join("");

  if (!allowedHtmlTags.has(tagName)) {
    return children;
  }

  if (tagName === "br") {
    return "<br>";
  }

  if (tagName === "a") {
    const href = sanitizeReferenceHref(element.getAttribute("href"));
    const title = element.getAttribute("title");
    const attrs = [
      href ? ` href="${sanitizeHTML(href)}"` : "",
      href ? ' target="_blank" rel="noopener noreferrer"' : "",
      title ? ` title="${sanitizeHTML(title)}"` : "",
      serializeCommonAttributes(element),
    ].join("");
    return `<a${attrs}>${children}</a>`;
  }

  if (tagName === "img") {
    const src = sanitizeReferenceImageSrc(element.getAttribute("src"));
    const alt = element.getAttribute("alt");
    const title = element.getAttribute("title");
    const attrs = [
      src ? ` src="${sanitizeHTML(src)}"` : "",
      alt ? ` alt="${sanitizeHTML(alt)}"` : "",
      title ? ` title="${sanitizeHTML(title)}"` : "",
      serializeCommonAttributes(element),
    ].join("");
    return src ? `<img${attrs}>` : children;
  }

  const attrs = serializeCommonAttributes(element);
  return `<${tagName}${attrs}>${children}</${tagName}>`;
}

function sanitizeReferenceHref(href: string | null): string | null {
  if (!href) return null;
  const trimmedHref = href.trim();
  if (
    trimmedHref.startsWith("http://") ||
    trimmedHref.startsWith("https://") ||
    trimmedHref.startsWith("mailto:") ||
    trimmedHref.startsWith("tel:") ||
    trimmedHref.startsWith("#")
  ) {
    return trimmedHref;
  }
  return null;
}

function sanitizeReferenceImageSrc(src: string | null): string | null {
  if (!src) return null;
  const trimmedSrc = src.trim();
  if (
    trimmedSrc.startsWith("http://") ||
    trimmedSrc.startsWith("https://") ||
    trimmedSrc.startsWith("data:image/") ||
    trimmedSrc.startsWith("blob:") ||
    trimmedSrc.startsWith("/")
  ) {
    return trimmedSrc;
  }
  return null;
}

function serializeCommonAttributes(element: HTMLElement): string {
  const attrs = [];
  const style = sanitizeReferenceStyle(element.getAttribute("style"));
  const title = element.getAttribute("title");
  const align = sanitizeTokenAttribute(element.getAttribute("align"));
  const valign = sanitizeTokenAttribute(element.getAttribute("valign"));
  const width = sanitizeSizeAttribute(element.getAttribute("width"));
  const height = sanitizeSizeAttribute(element.getAttribute("height"));
  const colspan = sanitizeNumberAttribute(element.getAttribute("colspan"));
  const rowspan = sanitizeNumberAttribute(element.getAttribute("rowspan"));
  const cellpadding = sanitizeNumberAttribute(element.getAttribute("cellpadding"));
  const cellspacing = sanitizeNumberAttribute(element.getAttribute("cellspacing"));
  const border = sanitizeNumberAttribute(element.getAttribute("border"));

  if (style) attrs.push(` style="${sanitizeHTML(style)}"`);
  if (title) attrs.push(` title="${sanitizeHTML(title)}"`);
  if (align) attrs.push(` align="${sanitizeHTML(align)}"`);
  if (valign) attrs.push(` valign="${sanitizeHTML(valign)}"`);
  if (width) attrs.push(` width="${sanitizeHTML(width)}"`);
  if (height) attrs.push(` height="${sanitizeHTML(height)}"`);
  if (colspan) attrs.push(` colspan="${sanitizeHTML(colspan)}"`);
  if (rowspan) attrs.push(` rowspan="${sanitizeHTML(rowspan)}"`);
  if (cellpadding) attrs.push(` cellpadding="${sanitizeHTML(cellpadding)}"`);
  if (cellspacing) attrs.push(` cellspacing="${sanitizeHTML(cellspacing)}"`);
  if (border) attrs.push(` border="${sanitizeHTML(border)}"`);

  return attrs.join("");
}

function sanitizeReferenceStyle(styleValue: string | null): string {
  if (!styleValue) return "";

  const sanitizedDeclarations = styleValue
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(":");
      if (separatorIndex === -1) return null;

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
      const value = declaration.slice(separatorIndex + 1).trim();
      if (!allowedCssProperties.has(property) || !isSafeCssValue(value)) {
        return null;
      }
      return `${property}: ${value}`;
    })
    .filter((declaration): declaration is string => Boolean(declaration));

  return sanitizedDeclarations.join("; ");
}

function isSafeCssValue(value: string): boolean {
  const lowerValue = value.toLowerCase();
  return !(
    lowerValue.includes("expression(") ||
    lowerValue.includes("javascript:") ||
    lowerValue.includes("vbscript:") ||
    lowerValue.includes("url(")
  );
}

function sanitizeNumberAttribute(value: string | null): string | null {
  if (!value) return null;
  const trimmedValue = value.trim();
  return /^\d+$/.test(trimmedValue) ? trimmedValue : null;
}

function sanitizeSizeAttribute(value: string | null): string | null {
  if (!value) return null;
  const trimmedValue = value.trim();
  return /^\d+(%|px)?$/i.test(trimmedValue) ? trimmedValue : null;
}

function sanitizeTokenAttribute(value: string | null): string | null {
  if (!value) return null;
  const trimmedValue = value.trim();
  return /^[a-z0-9_-]+$/i.test(trimmedValue) ? trimmedValue : null;
}
