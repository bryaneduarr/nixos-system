import type { Component } from "@earendil-works/pi-tui";

class EmptyComponent implements Component {
  render(): string[] {
    return [];
  }

  invalidate(): void {
    return;
  }
}

export const EMPTY = new EmptyComponent();
