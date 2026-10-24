import type { PromptContext } from "./prompt-context.interface.ts";

/** Extension registration operations the prompt browser installs. */
export interface PromptExtensionApi {
  /** Registers a keyboard shortcut. */
  registerShortcut(
    key: string,
    options: { readonly description: string; readonly handler: (ctx: PromptContext) => Promise<void> },
  ): void;
  /** Registers a slash command. */
  registerCommand(
    name: string,
    options: { readonly description: string; readonly handler: (args: string, ctx: PromptContext) => Promise<void> },
  ): void;
}
