export function describeToolActivity(toolName: string, args: Record<string, unknown>): string {
  const targetLabel = Object.values(args).find((value): value is string => typeof value === "string") ?? "";

  return `${toolName} ${targetLabel}`.trim();
}
