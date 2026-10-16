import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export const MIN_BOX_WIDTH = 24;
export const MAX_BOX_WIDTH = 76;

export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function boxWidth(available: number, title: string, lines: readonly string[]): number {
  const titleWidth = visibleWidth(`+-- ${title} `) + 1;
  const bodyWidth = lines.reduce((max, line) => Math.max(max, visibleWidth(line)), 0) + 4;
  const desired = Math.max(MIN_BOX_WIDTH, titleWidth, bodyWidth);
  const maxAllowed = Math.max(8, Math.min(available, MAX_BOX_WIDTH));
  return Math.min(desired, maxAllowed);
}

export function renderBox(title: string, lines: readonly string[], width: number): string[] {
  if (width < 8) {
    return [`+-- ${title}`];
  }

  const prefix = `+-- ${title} `;
  const dashes = Math.max(0, width - visibleWidth(prefix) - 1);
  const bottom = `+${"-".repeat(Math.max(0, width - 2))}+`;
  const inner = Math.max(0, width - 4);

  const rendered = [`${prefix}${"-".repeat(dashes)}+`];
  for (const line of lines) {
    rendered.push(`| ${truncateToWidth(line, inner, "", true)} |`);
  }
  rendered.push(bottom);
  return rendered;
}

export function boxLines(available: number, title: string, lines: readonly string[]): string[] {
  return renderBox(title, lines, boxWidth(available, title, lines));
}
