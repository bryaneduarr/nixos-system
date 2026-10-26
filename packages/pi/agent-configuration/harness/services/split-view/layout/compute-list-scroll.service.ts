import type { ListScrollRequest } from "../../../types/split-view/list-scroll-request.interface.ts";

export function computeListScroll({ previous, length, height, selected }: ListScrollRequest): number {
  const maxScroll = Math.max(0, length - height);
  let scroll = Math.min(previous, maxScroll);

  if (selected < scroll) {
    scroll = selected;
  } else if (selected >= scroll + height) {
    scroll = selected - height + 1;
  }

  return Math.max(0, Math.min(maxScroll, scroll));
}
