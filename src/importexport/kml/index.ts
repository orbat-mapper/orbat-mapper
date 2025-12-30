import { createFromString, getOneElement } from "@/importexport/milx/domutils.ts";

export async function getKmlAsDom(kmlStringOrBlobUrl: string) {
  if (kmlStringOrBlobUrl.startsWith("blob:")) {
    const response = await fetch(kmlStringOrBlobUrl);
    const kmlString = await response.text();
    return createFromString(kmlString);
  }
  return createFromString(kmlStringOrBlobUrl);
}

export function getKmlFolders(dom: Document): [Element, string][] {
  const doc = getOneElement(dom, "Document");
  if (!doc) {
    return [];
  }

  const rootFolders = getAllChildFoldersFromElement(doc);
  return rootFolders.map((folder) => {
    const folderName = getFolderName(folder);
    return [folder, folderName];
  });
}

type GetFolderNameOptions = {
  prependParentNames?: boolean;
  separator?: string;
  maxDepth?: number;
};

function getFolderName(
  folder: Element,
  {
    prependParentNames = true,
    separator = " / ",
    maxDepth = Infinity,
  }: GetFolderNameOptions = {},
): string {
  const nameElement = getOneElement(folder, "name");
  const currentName = nameElement
    ? nameElement.textContent || "Unnamed Folder"
    : "Unnamed Folder";

  if (!prependParentNames || maxDepth === 0) {
    return currentName;
  }

  const parentFolder = folder.parentElement;
  if (parentFolder && parentFolder.tagName === "Folder") {
    const parentName = getFolderName(parentFolder, {
      prependParentNames: true,
      separator,
      maxDepth: maxDepth - 1,
    });
    return `${parentName}${separator}${currentName}`;
  }

  return currentName;
}

export function getAllChildFoldersFromElement(element: Element): Element[] {
  return Array.from(element.getElementsByTagName("Folder"));
}
