export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
