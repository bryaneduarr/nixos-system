export function stringValues(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.filter((item): item is string => typeof item === "string");
}
