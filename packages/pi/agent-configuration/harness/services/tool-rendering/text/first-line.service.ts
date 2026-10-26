const LINE_BREAK_PATTERN = /\r?\n/;

export function firstLine(text: string): string {
  const lineBreak = text.search(LINE_BREAK_PATTERN);
  return lineBreak < 0 ? text : text.slice(0, lineBreak);
}
