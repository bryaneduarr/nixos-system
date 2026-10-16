export function describeToolActivity(toolName: string, args: Record<string, unknown>): string {
  const targetLabel = Object.values(args).find((argument): argument is string => typeof argument === "string") ?? "";

  return `${toolName} ${targetLabel}`.trim();
}
