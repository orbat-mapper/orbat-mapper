export function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export async function saveBlobToLocalFile(
  data: Blob | Promise<Blob> | Response,
  fileName: string,
) {
  const { fileSave } = await import("browser-fs-access");
  try {
    return await fileSave(data, { fileName });
  } catch (AbortError) {}
}
