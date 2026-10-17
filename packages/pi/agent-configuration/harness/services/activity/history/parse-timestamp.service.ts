export function parseTimestamp(timestamp: unknown): number {
  if (typeof timestamp !== "string") return Date.now();
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}
