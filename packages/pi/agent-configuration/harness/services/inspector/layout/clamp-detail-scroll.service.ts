export function clampDetailScroll(scroll: number, detailLength: number, viewportHeight: number): number {
  const maxScroll = Math.max(0, detailLength - viewportHeight);
  return Math.max(0, Math.min(scroll, maxScroll));
}
