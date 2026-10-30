/**
 * Line syntax of the text format: one unit per line, indentation for
 * hierarchy, `#` comments, and metadata in `[...]`, after `//`, after a single
 * `|` or between `|...|` pairs. Metadata is matched for echelon and icon but is
 * not part of the unit name.
 *
 * Parsing, highlighting and short-name rewriting all read lines through one
 * scanner, so they always agree on what is name, metadata and comment.
 */

export interface UnitLine {
  /** The unit name with metadata and comments removed. */
  displayName: string;
  /** All metadata segments joined with spaces. */
  metadataName: string;
}

export interface LineRange {
  kind: "metadata" | "comment";
  /** Offset into the line, inclusive. */
  from: number;
  /** Offset into the line, exclusive. */
  to: number;
}

interface MetadataRange {
  from: number;
  to: number;
  /** Normalized text inside the markup. */
  text: string;
}

interface ScannedLine {
  /** Metadata ranges in reading order: brackets, then `//`, then pipes. */
  metadata: MetadataRange[];
  /** Offset of `#`, or -1. */
  commentStart: number;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function scanLine(line: string): ScannedLine {
  const commentStart = line.indexOf("#");
  const content = commentStart === -1 ? line : line.slice(0, commentStart);
  const metadata: MetadataRange[] = [];
  // Content with found markup blanked out, so later rules skip it
  let masked = content;

  const add = (from: number, to: number, inner: string) => {
    metadata.push({ from, to, text: normalizeWhitespace(inner) });
    masked = masked.slice(0, from) + " ".repeat(to - from) + masked.slice(to);
  };

  for (const match of content.matchAll(/\[([^[\]]*)\]/g)) {
    add(match.index, match.index + match[0].length, match[1]);
  }

  const slashSlashIndex = masked.indexOf("//");
  if (slashSlashIndex !== -1) {
    add(slashSlashIndex, content.length, masked.slice(slashSlashIndex + 2));
  }

  const pipeIndexes = [...masked.matchAll(/\|/g)].map((match) => match.index);
  if (pipeIndexes.length === 1) {
    const end = slashSlashIndex === -1 ? content.length : slashSlashIndex;
    add(pipeIndexes[0], end, masked.slice(pipeIndexes[0] + 1, end));
  } else if (pipeIndexes.length >= 2) {
    for (const match of masked.matchAll(/\|([^|]*)\|/g)) {
      add(match.index, match.index + match[0].length, match[1]);
    }
  }

  return { metadata, commentStart };
}

export function readUnitLine(line: string): UnitLine {
  const { metadata, commentStart } = scanLine(line);
  const content = commentStart === -1 ? line : line.slice(0, commentStart);

  // Markup splits words apart unless it was empty
  let displayName = "";
  let position = 0;
  for (const range of [...metadata].sort((a, b) => a.from - b.from)) {
    displayName += content.slice(position, range.from) + (range.text ? " " : "");
    position = range.to;
  }
  displayName += content.slice(position);

  return {
    displayName: normalizeWhitespace(displayName),
    metadataName: metadata
      .map((range) => range.text)
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * Offset in a line body (no indent, no comment) where metadata markup starts,
 * including one leading space. Returns the body length when there is none.
 */
export function findMarkupStartIndex(body: string): number {
  const { metadata } = scanLine(body);
  if (metadata.length === 0) return body.length;

  let start = Math.min(...metadata.map((range) => range.from));
  if (start > 0 && body[start - 1] === " ") {
    start -= 1;
  }
  return start;
}

/**
 * Metadata and comment ranges in one line of text, sorted by offset, for
 * syntax highlighting. A lone `|` at the end of the content is not marked.
 */
export function analyzeLine(line: string): LineRange[] {
  const { metadata, commentStart } = scanLine(line);
  const ranges: LineRange[] = metadata
    .filter((range) => range.to - range.from > 1)
    .map(({ from, to }) => ({ kind: "metadata", from, to }));
  ranges.sort((a, b) => a.from - b.from);
  if (commentStart !== -1) {
    ranges.push({ kind: "comment", from: commentStart, to: line.length });
  }
  return ranges;
}
