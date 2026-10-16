export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  const precision = ms < 10_000 ? 1 : 0;
  return `${seconds.toFixed(precision)}s`;
}
