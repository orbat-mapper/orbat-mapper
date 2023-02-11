export function htmlTagEscape(text: string) {
  return text.replace(/&/g, " ").replace(/</g, " ").replace(/>/g, " ");
}
