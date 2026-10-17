export function withLineNumbers(lines: readonly string[], startLine: number): string {
  const width = String(startLine + lines.length - 1).length;
  return lines
    .map((line, index) => {
      const lineNumber = String(startLine + index).padStart(width, " ");
      return `${lineNumber}: ${line}`;
    })
    .join("\n");
}
