export async function toDom(xmlString: string) {
  // https://github.com/placemark/togeojson#protips
  const xmldom = await import("@xmldom/xmldom");
  return new xmldom.DOMParser().parseFromString(xmlString, "text/xml");
}

export function createFromString(xmlString: string): Document {
  let parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
}

export function getElements(element: Element | Document, tagName: string): Element[] {
  return Array.from(element.getElementsByTagName(tagName));
}

export function getOneElement(
  element: Element | Document,
  tagName: string
): Element | null {
  const elements = getElements(element, tagName);
  return elements.length ? elements[0] : null;
}

export function nodeValue(node: Element | null) {
  node?.normalize();
  return (node && node.textContent) || "";
}
