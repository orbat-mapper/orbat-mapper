export interface TextEditorCommandResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const NEWLINE = "\n";

function clampSelection(value: string, position: number) {
  return Math.max(0, Math.min(position, value.length));
}

export function applyTabIndent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentSize: number,
): TextEditorCommandResult {
  const indent = " ".repeat(indentSize);

  if (selectionStart === selectionEnd) {
    const nextValue =
      value.substring(0, selectionStart) + indent + value.substring(selectionEnd);
    const cursor = selectionStart + indent.length;
    return {
      value: nextValue,
      selectionStart: cursor,
      selectionEnd: cursor,
    };
  }

  const lineStart =
    value.lastIndexOf(NEWLINE, selectionStart - 1) === -1
      ? 0
      : value.lastIndexOf(NEWLINE, selectionStart - 1) + 1;
  const adjustedSelectionEnd =
    selectionEnd > selectionStart &&
    value.slice(selectionEnd - 1, selectionEnd) === NEWLINE
      ? selectionEnd - 1
      : selectionEnd;
  let lineEnd = value.indexOf(NEWLINE, adjustedSelectionEnd);
  if (lineEnd === -1) {
    lineEnd = value.length;
  }

  const middle = value.substring(lineStart, lineEnd);
  const lines = middle.split(NEWLINE);
  const indentedMiddle = lines.map((line) => indent + line).join(NEWLINE);
  const nextValue =
    value.substring(0, lineStart) + indentedMiddle + value.substring(lineEnd);
  const addedChars = indent.length * lines.length;

  return {
    value: nextValue,
    selectionStart: selectionStart + indent.length,
    selectionEnd: selectionEnd + addedChars,
  };
}

export function applyIndentedNewline(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): TextEditorCommandResult {
  const lastNewline = value.lastIndexOf(NEWLINE, selectionStart - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const lineSlice = value.substring(lineStart, selectionStart);
  const indentMatch = lineSlice.match(/^[\t ]*/);
  const indent = indentMatch ? indentMatch[0] : "";

  const nextValue =
    value.substring(0, selectionStart) + NEWLINE + indent + value.substring(selectionEnd);
  const cursor = selectionStart + 1 + indent.length;

  return {
    value: nextValue,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

export function applyShiftTabOutdent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentSize: number,
): TextEditorCommandResult {
  const lineStart =
    value.lastIndexOf(NEWLINE, selectionStart - 1) === -1
      ? 0
      : value.lastIndexOf(NEWLINE, selectionStart - 1) + 1;
  const adjustedSelectionEnd =
    selectionEnd > selectionStart &&
    value.slice(selectionEnd - 1, selectionEnd) === NEWLINE
      ? selectionEnd - 1
      : selectionEnd;
  let lineEnd = value.indexOf(NEWLINE, adjustedSelectionEnd);
  if (lineEnd === -1) {
    lineEnd = value.length;
  }

  const middle = value.substring(lineStart, lineEnd);
  const lines = middle.split(NEWLINE);

  const removedPerLine: number[] = [];
  const nextLines = lines.map((line, index) => {
    if (line.length === 0) {
      removedPerLine[index] = 0;
      return line;
    }

    if (line.startsWith("\t")) {
      removedPerLine[index] = 1;
      return line.substring(1);
    }

    const match = line.match(/^[ ]*/);
    const leadingSpaces = match ? match[0].length : 0;
    const remove = Math.min(leadingSpaces, indentSize);
    removedPerLine[index] = remove;
    return line.substring(remove);
  });

  const nextMiddle = nextLines.join(NEWLINE);
  const nextValue = value.substring(0, lineStart) + nextMiddle + value.substring(lineEnd);

  const selectionOffset = selectionStart - lineStart;
  let traversed = 0;
  let cursorLine = lines.length - 1;
  let cursorColumn = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const lineLength = lines[index].length;
    if (selectionOffset <= traversed + lineLength) {
      cursorLine = index;
      cursorColumn = selectionOffset - traversed;
      break;
    }
    traversed += lineLength + 1;
  }

  const removedBeforeCursor =
    removedPerLine.slice(0, cursorLine).reduce((total, removed) => total + removed, 0) +
    Math.min(removedPerLine[cursorLine] ?? 0, cursorColumn);
  const totalRemoved = removedPerLine.reduce((total, removed) => total + removed, 0);

  const nextSelectionStart = clampSelection(
    nextValue,
    selectionStart - removedBeforeCursor,
  );
  const nextSelectionEnd = clampSelection(
    nextValue,
    Math.max(nextSelectionStart, selectionEnd - totalRemoved),
  );

  return {
    value: nextValue,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
  };
}
