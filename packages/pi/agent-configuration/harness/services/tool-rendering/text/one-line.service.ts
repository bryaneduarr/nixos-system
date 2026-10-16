export function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
