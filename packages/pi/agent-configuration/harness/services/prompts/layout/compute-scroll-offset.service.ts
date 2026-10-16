export function computeScrollOffset(
  offset: number,
  cursorRowIndex: number,
  pageSize: number,
  rowCount: number,
): number {
  const offsetAfterScrollUp = cursorRowIndex < offset ? cursorRowIndex : offset;
  const isBelowPage = cursorRowIndex >= offsetAfterScrollUp + pageSize;
  const offsetAfterScrollDown = isBelowPage ? cursorRowIndex - pageSize + 1 : offsetAfterScrollUp;
  return Math.max(0, Math.min(offsetAfterScrollDown, rowCount - pageSize));
}
