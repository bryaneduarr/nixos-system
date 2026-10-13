import { expect, test } from "bun:test";
import { Markdown, type MarkdownTheme, visibleWidth } from "@earendil-works/pi-tui";
import { previewPrompt } from "../agent-configuration/harness/ui/prompts/preview.ts";
import { installPromptPreviews } from "../agent-configuration/harness/ui/prompts/install.ts";
import { viewPrompt } from "../agent-configuration/harness/ui/prompts/viewer.ts";

const identity = (text: string) => text;

const markdownTheme: MarkdownTheme = {
	heading: identity,
	link: identity,
	linkUrl: identity,
	code: identity,
	codeBlock: identity,
	codeBlockBorder: identity,
	quote: identity,
	quoteBorder: identity,
	hr: identity,
	listBullet: identity,
	bold: identity,
	italic: identity,
	strikethrough: identity,
	underline: identity,
};

const plainTheme = {
	fg: (_color: string, text: string) => text,
	bg: (_color: string, text: string) => text,
};

test("short prompts retain their Markdown and long prompts have a bounded preview", () => {
	expect(previewPrompt("**Hello**", 80)).toBe("**Hello**");
	const text = "first\nsecond\nthird\nfourth";
	const preview = previewPrompt(text, 80);
	expect(preview).toContain("third");
	expect(preview).not.toContain("fourth");
	expect(preview).toContain("... Ctrl+Alt+U");
	expect(text).toBe("first\nsecond\nthird\nfourth");
	expect(previewPrompt("word ".repeat(10000), 80).length).toBeLessThan(400);
});

test("previews account for wrapping, Unicode, narrow widths, and code fences", () => {
	for (const width of [5, 20, 80]) {
		const preview = previewPrompt("界🙂 ".repeat(100), width);
		const lines = preview.split("\n").slice(1, 4);
		for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(Math.max(2, width - 4));
	}
	expect(previewPrompt("```\na\nb\nc\n```", 80)).toStartWith("````\n");
});

test("real Markdown rendering keeps previews bounded and the hint outside code fences", () => {
	const text = "```\n" + "界🙂 word ".repeat(1000) + "\n```\nlast hidden line";
	const component = new Markdown(text, 1, 1, markdownTheme, undefined, {
		transform: (markdown, width) => previewPrompt(markdown, width),
	});

	for (const width of [10, 40, 80]) {
		component.invalidate();
		const lines = component.render(width);
		expect(lines.join("\n")).toContain("...");
		expect(lines.join("\n")).not.toContain("last hidden line");
		expect(lines.length).toBeLessThan(25);
		for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
	}
});

test("viewer scrolls the complete prompt, resizes, and closes without editing", async () => {
	let component: any;
	let renders = 0;
	const terminal = { rows: 8 };
	const text = Array.from({ length: 20 }, (_, index) => `line ${index}`).join("\n");
	const ctx: any = {
		ui: {
			custom: (factory: any) => new Promise((resolve) => {
				component = factory({ terminal, requestRender: () => renders++ }, plainTheme, {}, resolve);
			}),
		},
	};
	const viewing = viewPrompt(ctx, text);
	expect(component.render(40).join("\n")).toContain("line 0");
	expect(component.render(40).join("\n")).not.toContain("line 19");
	component.handleInput("\x1b[F");
	expect(component.render(40).join("\n")).toContain("line 19");
	component.handleInput("\x1b[H");
	expect(component.render(40).join("\n")).toContain("line 0");
	component.handleInput("\x1b[6~");
	expect(component.render(40).join("\n")).toContain("line 1");
	terminal.rows = 6;
	component.invalidate();
	for (const line of component.render(5)) expect(visibleWidth(line)).toBeLessThanOrEqual(5);
	expect(renders).toBe(3);
	component.handleInput("\x1b");
	await viewing;
});

test("installation transforms only user display and reads original branch text", async () => {
	let transform: any;
	let shortcut: any;
	let command: any;
	let component: any;
	const latest = "original\n".repeat(30);
	const notifications: string[] = [];
	let mode = "tui";
	let entries: any[] = [
		{ type: "message", message: { role: "user", content: "earlier" } },
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "response" }] } },
		{ type: "message", message: { role: "user", content: [{ type: "text", text: latest }, { type: "image" }] } },
	];
	const ctx: any = {
		get mode() { return mode; },
		sessionManager: { getBranch: () => entries },
		ui: {
			notify: (text: string) => notifications.push(text),
			getEditorText: () => "",
			custom: (factory: any) => new Promise((resolve) => {
				component = factory({ terminal: { rows: 100 }, requestRender: () => {} }, plainTheme, {}, resolve);
			}),
		},
	};
	installPromptPreviews({
		registerMarkdownTransformer: (callback: any) => { transform = callback; },
		registerShortcut: (key: string, options: any) => {
			expect(key).toBe("ctrl+alt+u");
			shortcut = options.handler;
		},
		registerCommand: (name: string, options: any) => {
			expect(name).toBe("prompts");
			command = options.handler;
		},
	} as any);

	for (const messageType of ["assistant", "assistant-thinking"]) {
		expect(transform(latest, { messageType, availableWidth: 80 })).toBe(latest);
	}
	expect(transform(latest, { messageType: "user", availableWidth: 80 })).not.toBe(latest);
	const viewing = shortcut(ctx);
	const firstBrowser = component;
	await shortcut(ctx);
	expect(component).toBe(firstBrowser);
	expect(component.render(80).join("\n")).toContain("original");
	component.handleInput("G");
	expect(component.render(80).join("\n")).toContain("original");
	component.handleInput("\x1b");
	await viewing;
	const choosing = command("", ctx);
	await Promise.resolve();
	component.handleInput("\t");
	component.handleInput("j");
	expect(component.render(80).join("\n")).toContain("earlier");
	component.handleInput("\x1b");
	await choosing;
	expect(entries[2].message.content[0].text).toBe(latest);
	entries = [];
	await shortcut(ctx);
	expect(notifications).toEqual(["No prompts or draft in this branch."]);
	mode = "rpc";
	await shortcut(ctx);
	expect(notifications).toHaveLength(1);
});
