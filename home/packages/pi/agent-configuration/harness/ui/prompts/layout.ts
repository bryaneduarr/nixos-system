import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { Grapheme, PromptNavigation } from "./model.ts";

export type DisplayCell = { index: number; text: string; column: number; width: number };
export type DisplayRow = DisplayCell[];

export function safeDisplay(text: string): string {
	return text.replace(/[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, (char) => char === "\t" ? "    " : "�");
}

export function wrapPrompt(units: Grapheme[], width: number): DisplayRow[] {
	width = Math.max(1, width);
	const rows: DisplayRow[] = [];
	let row: DisplayRow = [];
	let column = 0;
	for (const [index, unit] of units.entries()) {
		if (unit.text.includes("\n")) {
			row.push({ index, text: "", column, width: 0 });
			rows.push(row);
			row = [];
			column = 0;
			continue;
		}
		let text = safeDisplay(unit.text);
		let size = visibleWidth(text);
		if (size > width) {
			text = "�";
			size = 1;
		}
		if (column + size > width && row.length > 0) {
			rows.push(row);
			row = [];
			column = 0;
		}
		row.push({ index, text, column, width: size });
		column += size;
	}
	rows.push(row);
	return rows;
}

export function cursorRow(rows: DisplayRow[], cursor: number): number {
	return Math.max(0, rows.findIndex((row) => row.some((cell) => cell.index === cursor)));
}

export function moveVertical(navigation: PromptNavigation, rows: DisplayRow[], delta: number): void {
	const current = cursorRow(rows, navigation.cursor);
	const column = rows[current].find((cell) => cell.index === navigation.cursor)?.column ?? 0;
	const target = rows[Math.max(0, Math.min(rows.length - 1, current + delta))];
	const cell = target.find((cell) => cell.column + Math.max(1, cell.width) > column) ?? target.at(-1);
	if (cell) navigation.move(cell.index);
	else navigation.move(navigation.units.length - 1);
}

export function renderRow(row: DisplayRow, navigation: PromptNavigation, focused: boolean, theme: Theme): string {
	const range = navigation.range();
	return row.map((cell) => {
		const unit = navigation.units[cell.index];
		const selected = range && unit.start < range[1] && unit.end > range[0];
		const cursor = focused && cell.index === navigation.cursor;
		const text = cell.text || (selected || cursor ? " " : "");
		if (selected) return theme.bg("selectedBg", text);
		if (cursor) return theme.bg("selectedBg", theme.fg("accent", text));
		return text;
	}).join("");
}

export function fit(text: string, width: number): string {
	width = Math.max(0, width);
	const clipped = truncateToWidth(text, width, "", true);
	return clipped + " ".repeat(Math.max(0, width - visibleWidth(clipped)));
}

export function frame(lines: string[], width: number, theme: Theme): string[] {
	if (width < 2) return lines.map((line) => fit(line, width));
	const border = (text: string) => theme.fg("borderMuted", text);
	return [
		border(`╭${"─".repeat(width - 2)}╮`),
		...lines.map((line) => `${border("│")}${fit(line, width - 2)}${border("│")}`),
		border(`╰${"─".repeat(width - 2)}╯`),
	];
}
