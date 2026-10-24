const FENCE_PATTERN = /^\s{0,3}(?:```|~~~)/;

export function mapMarkdownProse(markdown: string, transformProse: (prose: string) => string): string {
  const segments: string[] = [];
  let proseLines: string[] = [];
  let isInsideFence = false;

  for (const line of markdown.split("\n")) {
    const isFenceLine = FENCE_PATTERN.test(line);
    if (isFenceLine || isInsideFence) {
      if (proseLines.length > 0) segments.push(transformProse(proseLines.join("\n")));
      proseLines = [];
      segments.push(line);
    } else {
      proseLines.push(line);
    }
    if (isFenceLine) isInsideFence = !isInsideFence;
  }
  if (proseLines.length > 0) segments.push(transformProse(proseLines.join("\n")));

  return segments.join("\n");
}
