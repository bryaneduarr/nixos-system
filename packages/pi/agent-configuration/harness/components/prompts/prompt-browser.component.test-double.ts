import type { PromptSelection } from "../../types/prompts/collection/prompt-selection.interface.ts";
import type { ClipboardWriter } from "../../types/prompts/input/clipboard-writer.interface.ts";
import type { PromptBrowserHost } from "../../types/prompts/view/prompt-browser-host.interface.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";
import { PromptBrowser } from "./prompt-browser.component.ts";

const plainTheme: SplitViewTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
  bold: (text) => text,
};

export function browser(
  text: string,
  clipboard: ClipboardWriter = () => {},
  selection: PromptSelection = { kind: "read-only" },
) {
  let closed = 0;
  const terminal = { rows: 24 };
  const host: PromptBrowserHost = {
    terminal,
    requestRender: () => {},
  };
  const component = new PromptBrowser({
    collections: {
      prompts: [
        { text, label: "Draft", turn: { kind: "draft" } },
        { text: "older", label: "1.", turn: { kind: "turn", turnsFromLatest: 0 } },
      ],
      outputs: [
        { text: "latest reply", label: "1.", turn: { kind: "turn", turnsFromLatest: 0 } },
        { text: "earlier reply", label: "2.", turn: { kind: "turn", turnsFromLatest: 1 } },
      ],
    },
    host,
    theme: plainTheme,
    done: () => {
      closed++;
    },
    clipboard,
    selection,
  });
  component.render(100);
  return { component, terminal, closed: () => closed };
}

export function keys(component: PromptBrowser, ...inputs: string[]) {
  for (const input of inputs) component.handleInput(input);
}

export async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}
