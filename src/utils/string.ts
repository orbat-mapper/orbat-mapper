export function htmlTagEscape(text: string) {
  return text.replace(/&/g, " ").replace(/</g, " ").replace(/>/g, " ");
}

export function isUrl(str: string) {
  try {
    new URL(str);
  } catch (_) {
    return false;
  }

  return true;
}

/**
 * Word wraps a string to a specific line length.
 *
 * Note: this is a very simple and naive implementation. For more robust solutions,
 * consider using libraries like 'wordwrapjs' or 'wrap-ansi'.
 */
export function wordWrap(text: string, { width = 20 }: { width: number }): string {
  const words = text.split(" ");
  let line = "";
  let result = "";

  for (const word of words) {
    // If adding the next word exceeds maxLength, start a new line
    if ((line + word).length > width) {
      if (result) result += "\n";
      result += line.trim();
      line = "";
    }
    line += word + " ";
  }

  // Add the last line
  if (line.trim().length > 0) {
    if (result) result += "\n";
    result += line.trim();
  }

  return result;
}
