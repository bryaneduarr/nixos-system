export function isTextMatching(candidate: unknown, pattern: RegExp): candidate is string {
  return typeof candidate === "string" && pattern.test(candidate);
}
