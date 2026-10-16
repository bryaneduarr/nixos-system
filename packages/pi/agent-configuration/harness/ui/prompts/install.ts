import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { collectPrompts } from "./collection.ts";
import { previewPrompt } from "./preview.ts";
import { viewPrompt } from "./viewer.ts";

export function installPromptPreviews(pi: ExtensionAPI): void {
	pi.registerMarkdownTransformer((markdown, context) => {
		if (context.messageType !== "user") return markdown;
		return previewPrompt(markdown, context.availableWidth);
	});

	let browserOpen = false;

	const openPrompt = async (ctx: ExtensionContext) => {
		if (ctx.mode !== "tui" || browserOpen) return;
		const prompts = collectPrompts(ctx);
		if (prompts.length === 0) {
			ctx.ui.notify("No prompts or draft in this branch.", "info");
			return;
		}
		browserOpen = true;
		try {
			await viewPrompt(ctx, prompts);
		} finally {
			browserOpen = false;
		}
	};

	pi.registerShortcut("ctrl+alt+u", {
		description: "Browse user prompts and the unsent draft",
		handler: openPrompt,
	});
	pi.registerCommand("prompts", {
		description: "Browse user prompts and the unsent draft",
		handler: (_args, ctx) => openPrompt(ctx),
	});
}
