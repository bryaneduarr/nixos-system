export function isTextMatching(value: unknown, pattern: RegExp): value is string {
  return typeof value === "string" && pattern.test(value);
}
