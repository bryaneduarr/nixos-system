const TRUNCATED_LINE_MARKER = "[line truncated]";

export function takeLinesWithinBudget(lines: readonly string[], maxChars: number): string[] {
  const taken: string[] = [];
  let usedChars = 0;
  for (const line of lines) {
    const lineChars = line.length + 1;
    const exceedsBudget = usedChars + lineChars > maxChars;
    if (taken.length > 0 && exceedsBudget) break;
    taken.push(line.length > maxChars ? `${line.slice(0, maxChars)} ${TRUNCATED_LINE_MARKER}` : line);
    usedChars += lineChars;
  }
  return taken;
}
