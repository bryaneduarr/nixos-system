export function describeToolActivity(toolName: string, args: Record<string, unknown>): string {
  const stringArguments = Object.values(args).filter((argument): argument is string => typeof argument === "string");

  return [toolName, ...stringArguments.slice(0, 1)].join(" ").trim();
}
