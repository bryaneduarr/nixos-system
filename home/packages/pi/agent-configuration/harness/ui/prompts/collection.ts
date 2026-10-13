import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { PromptItem } from "./model.ts";

export function collectPrompts(ctx: ExtensionContext): PromptItem[] {
	const sent = ctx.sessionManager.getBranch().flatMap((entry) => {
		if (entry.type !== "message" || entry.message.role !== "user") return [];
		const content = entry.message.content;
		const text = typeof content === "string"
			? content
			: content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
		return text ? [text] : [];
	}).reverse();
	const prompts = sent.map((text, index) => ({ text, label: `${index + 1}.` }));
	const draft = ctx.ui.getEditorText();
	if (draft.length > 0) prompts.unshift({ text: draft, label: "Draft" });
	return prompts;
}
