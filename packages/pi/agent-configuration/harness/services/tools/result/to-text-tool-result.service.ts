export function toTextToolResult(text: string) {
  return { content: [{ type: "text" as const, text }], details: {} };
}
