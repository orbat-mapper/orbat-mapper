export function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
