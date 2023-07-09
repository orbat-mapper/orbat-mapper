export const isClient = typeof window !== "undefined";

export function sanitizeHTML(str: string) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
