export function formatValue(value: unknown): string {
  if (typeof value === "string") return value.replace(/\r?\n/g, "\n    ");
  if (value === undefined) return "";

  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
