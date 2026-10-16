export function computeListScroll(previous: number, length: number, height: number, selected: number): number {
  const maxScroll = Math.max(0, length - height);
  let scroll = Math.min(previous, maxScroll);

  if (selected < scroll) {
    scroll = selected;
  } else if (selected >= scroll + height) {
    scroll = selected - height + 1;
  }

  return Math.max(0, Math.min(maxScroll, scroll));
}
