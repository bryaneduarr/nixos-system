import { KeybindingsManager } from "@earendil-works/pi-tui";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { SessionMenuComponent } from "../../../../types/sessions/menu/session/session-menu-component.interface.ts";
import type { SessionMenuContext } from "../../../../types/sessions/menu/session/session-menu-context.interface.ts";
import type { SessionMenuTheme } from "../../../../types/sessions/menu/session/session-menu-theme.interface.ts";
import type { SessionListing } from "../../../../types/sessions/registry/row/session-listing.interface.ts";
import { createLiveSession } from "../../registry/row/live-session.test-double.ts";

export const firstRow = createLiveSession({
  identity: "one",
  pid: process.pid,
  cwd: "/tmp/project-a",
  name: "First",
  branch: "main",
  context: { usageState: "measured", tokens: 120, percent: 12, contextWindow: 1000 },
  status: "idle",
});

export const secondRow = createLiveSession({
  identity: "two",
  pid: 1,
  cwd: "/tmp/project-b",
  name: "Second",
  branch: "topic",
  context: { usageState: "tokens-unknown", contextWindow: 1000 },
  status: "draft",
});

export const menuRegistry: SessionListing = { list: async () => [firstRow, secondRow] };

export function menuContext(renderStyle: (text: string) => string, colors: unknown[]) {
  let component: ValueState<SessionMenuComponent> = { state: "absent" };
  const ctx: SessionMenuContext = {
    ui: {
      custom: (factory, _options) =>
        new Promise((resolve) => {
          const tui = { terminal: { rows: 40 }, requestRender: () => {} };
          const theme: SessionMenuTheme = {
            fg: (_color, text) => text,
            bold: (text) => text,
            style: (text, options) => {
              colors.push(options.fg);
              return renderStyle(text);
            },
          };
          component = { state: "present", value: factory(tui, theme, new KeybindingsManager({}, {}), resolve) };
        }),
    },
  };
  return {
    ctx,
    component: (): SessionMenuComponent => {
      if (component.state === "absent") throw new Error("Menu component was not created");
      return component.value;
    },
  };
}
