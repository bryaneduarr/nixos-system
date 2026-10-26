import { copyToClipboard } from "@earendil-works/pi-coding-agent";
import { registerPromptsCommand } from "../../../commands/prompts/prompts.command.ts";
import {
  PROMPT_BROWSER_DESCRIPTION,
  PROMPT_BROWSER_NO_PROMPTS_MESSAGE,
  PROMPT_BROWSER_SHORTCUT,
} from "../../../constants/prompts/registration.constant.ts";
import { TURN_MENU_DESCRIPTION, TURN_MENU_SHORTCUT } from "../../../constants/transcript/turn/turn-view.constant.ts";
import { turnView } from "../../../stores/transcript/turn-view.store.ts";
import type { PromptSelection } from "../../../types/prompts/collection/prompt-selection.interface.ts";
import type { PromptContext } from "../../../types/prompts/install/prompt-context.interface.ts";
import type { PromptExtensionApi } from "../../../types/prompts/install/prompt-extension-api.interface.ts";
import { refreshTranscript } from "../../transcript/turn/refresh-transcript.service.ts";
import { collectAgentOutputs } from "../collection/collect-agent-outputs.service.ts";
import { collectPrompts } from "../collection/collect-prompts.service.ts";
import { viewPrompt } from "../view/view-prompt.service.ts";

export function installPromptPreviews(pi: PromptExtensionApi): void {
  let browserOpen = false;

  const openBrowser = async (ctx: PromptContext, selection: PromptSelection): Promise<void> => {
    if (ctx.mode !== "tui" || browserOpen) return;
    const branch = ctx.sessionManager.getBranch();
    const collections = {
      prompts: collectPrompts(branch, ctx.ui.getEditorText()),
      outputs: collectAgentOutputs(branch),
    };
    if (collections.prompts.length === 0 && collections.outputs.length === 0) {
      ctx.ui.notify(PROMPT_BROWSER_NO_PROMPTS_MESSAGE, "info");
      return;
    }
    browserOpen = true;
    try {
      await viewPrompt({ ui: ctx.ui, collections, clipboard: copyToClipboard, selection });
    } finally {
      browserOpen = false;
    }
  };
  const openPrompt = (ctx: PromptContext): Promise<void> => openBrowser(ctx, { kind: "read-only" });
  const openTurnMenu = (ctx: PromptContext): Promise<void> =>
    openBrowser(ctx, {
      kind: "choose-turn",
      choose: (turnsFromLatest) => {
        turnView.focus(turnsFromLatest);
        refreshTranscript(ctx.ui, "turn-start");
      },
    });

  pi.registerShortcut(PROMPT_BROWSER_SHORTCUT, {
    description: PROMPT_BROWSER_DESCRIPTION,
    handler: openPrompt,
  });
  pi.registerShortcut(TURN_MENU_SHORTCUT, {
    description: TURN_MENU_DESCRIPTION,
    handler: openTurnMenu,
  });
  registerPromptsCommand(pi, openPrompt);
}
