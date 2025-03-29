export function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export async function saveBlobToLocalFile(
  data: Blob | Promise<Blob> | Response,
  fileName: string,
  options: { mimeTypes?: string[]; extensions?: string[] } = {},
) {
  const { fileSave } = await import("browser-fs-access");
  try {
    return await fileSave(data, { fileName, ...options });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    } else {
      throw error;
    }
  }
}
