export function isUnknownArray(candidate: unknown): candidate is readonly unknown[] {
  return Array.isArray(candidate);
}
