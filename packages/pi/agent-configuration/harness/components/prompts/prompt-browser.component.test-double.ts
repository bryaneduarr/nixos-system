import type { ClipboardWriter } from "../../types/prompts/clipboard-writer.interface.ts";
import type { PromptBrowserHost } from "../../types/prompts/prompt-browser-host.interface.ts";
import type { PromptTheme } from "../../types/prompts/prompt-theme.interface.ts";
import { PromptBrowser } from "./prompt-browser.component.ts";

const plainTheme: PromptTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
};

export function browser(text: string, clipboard: ClipboardWriter = () => {}) {
  let closed = 0;
  const terminal = { rows: 24 };
  const host: PromptBrowserHost = {
    terminal,
    requestRender: () => {},
  };
  const component = new PromptBrowser(
    [
      { text, label: "Draft" },
      { text: "older", label: "1." },
    ],
    host,
    plainTheme,
    () => {
      closed++;
    },
    clipboard,
  );
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
