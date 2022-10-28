export function createFromString(xmlString: string): Document {
  let parser = new DOMParser();
  let doc = parser.parseFromString(xmlString, "text/xml");
  return doc;
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
