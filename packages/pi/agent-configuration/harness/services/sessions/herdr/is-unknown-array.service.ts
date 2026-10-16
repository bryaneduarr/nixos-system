export function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}
