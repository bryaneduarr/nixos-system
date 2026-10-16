import type { PromptContext } from "./prompt-context.interface.ts";

/* Markdown rendering information passed to a transformer. */
export interface PromptMarkdownContext {
  /* Kind of message being rendered, such as user or assistant. */
  readonly messageType: string;
  /* Terminal columns available to the message. */
  readonly availableWidth: number;
}

/* Extension registration operations the prompt browser installs. */
export interface PromptExtensionApi {
  /* Registers a transformer applied to Markdown before it renders. */
  registerMarkdownTransformer(transform: (markdown: string, context: PromptMarkdownContext) => string): void;
  /* Registers a keyboard shortcut. */
  registerShortcut(
    key: string,
    options: { readonly description: string; readonly handler: (ctx: PromptContext) => Promise<void> },
  ): void;
  /* Registers a slash command. */
  registerCommand(
    name: string,
    options: { readonly description: string; readonly handler: (args: string, ctx: PromptContext) => Promise<void> },
  ): void;
}
