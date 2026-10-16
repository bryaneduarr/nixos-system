export function formatOutput(text: string): string {
  if (!text) return "(empty)";

  try {
    const parsed: unknown = JSON.parse(text);
    return JSON.stringify(parsed, null, 2) ?? text;
  } catch {
    return text;
  }
}
