import { u } from "unist-builder";
import { x } from "xastscript";

export function createFromString(xmlString: string): Document {
  let parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
}

export function getElements(element: Element | Document, tagName: string): Element[] {
  return Array.from(element.getElementsByTagName(tagName));
}

export function getOneElement(
  element: Element | Document,
  tagName: string,
): Element | null {
  const elements = getElements(element, tagName);
  return elements.length ? elements[0] : null;
}

export function nodeValue(node: Element | null) {
  node?.normalize();
  return (node && node.textContent) || "";
}

export const BR = u("text", "\n");
export const TAB = u("text", "  ");
export const BRTAB = u("text", "\n  ");

export function tagValue(tagName: string, value: string) {
  return x(tagName, [u("text", value)]);
}

export function tagIdValue(tagName: string, id: string, value: string) {
  return x(tagName, { ID: id }, [u("text", value)]);
}
