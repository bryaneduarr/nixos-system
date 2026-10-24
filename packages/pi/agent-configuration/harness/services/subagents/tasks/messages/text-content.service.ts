export function textContent(content: unknown): string {
  if (!Array.isArray(content)) return "";

  const textParts = content.filter(
    (part): part is { type: "text"; text: string } =>
      typeof part === "object" && part !== null && part.type === "text" && typeof part.text === "string",
  );

  return textParts.map((part) => part.text).join("\n");
}
