import { describe, expect, test } from "bun:test";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { rgbColor, visibleWidth } from "@earendil-works/pi-tui";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { selectSession } from "./select-session.service.ts";

type MenuComponent = {
  render(width: number): string[];
  handleInput(data: string): void;
  dispose(): void;
  readonly focused: boolean;
};

const firstRow = {
  identity: "one",
  pid: process.pid,
  cwd: "/tmp/project-a",
  name: "First",
  branch: "main",
  context: { usageState: "measured", tokens: 120, percent: 12, contextWindow: 1000 },
  status: "idle",
} as unknown as LiveSession; // Test row omits the fields the menu does not render.

const secondRow = {
  identity: "two",
  pid: 1,
  cwd: "/tmp/project-b",
  name: "Second",
  branch: "topic",
  context: { usageState: "tokens-unknown", contextWindow: 1000 },
  status: "draft",
} as unknown as LiveSession; // Test row omits the fields the menu does not render.

const rows = [firstRow, secondRow];

const menuRegistry = { list: async () => rows } as unknown as SessionRegistry; // Test double implements only list().

function menuContext(style: (text: string, options: { fg: unknown }) => string, colors: unknown[]) {
  let component: MenuComponent | undefined;
  const ctx = {
    ui: {
      custom: (factory: (...args: unknown[]) => MenuComponent, _options: unknown) =>
        new Promise((resolve) => {
          const tui = { terminal: { rows: 40 }, requestRender: () => {} };
          const theme = {
            fg: (_color: string, text: string) => text,
            bold: (text: string) => text,
            style: (text: string, options: { fg: unknown }) => {
              colors.push(options.fg);
              return style(text, options);
            },
          };
          component = factory(tui, theme, {}, resolve);
        }),
    },
  } as unknown as ExtensionContext; // Test double implements only the UI members the menu uses.
  return {
    ctx,
    component: () => {
      if (component === undefined) throw new Error("Menu component was not created");
      return component;
    },
  };
}

describe("selectSession", () => {
  test("session menu filters groups, uses one status, and bounds terminal widths", async () => {
    const colors: unknown[] = [];
    const menu = menuContext((text) => `\x1b[38;2;255;158;68m${text}\x1b[0m`, colors);
    const selection = selectSession(menu.ctx, menuRegistry);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const component = menu.component();
    const text = component.render(100).join("\n");
    expect(text).toContain("project-a");
    expect(text).toContain("idle");
    expect(text).toContain("draft");
    expect(text).not.toContain("No draft");
    expect(text).toContain("12%");
    expect(text).not.toContain("/tmp/project-a");
    expect(text).not.toContain("/tmp/project-b");
    expect(text).not.toContain("Main context:");
    expect(text).not.toContain("tokens");
    expect(text).not.toContain("Filter:");
    expect(text).toContain("N New   i Filter   Esc Close");
    expect(text).not.toContain("Select");
    expect(text).not.toContain("Switch");
    expect(text).not.toContain("Current");
    expect(colors).toContainEqual(rgbColor(255, 158, 68));
    for (const width of [1, 10, 40, 100]) {
      for (const line of component.render(width)) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
    }
    component.handleInput("i");
    expect(component.focused).toBe(true);
    component.handleInput("topic");
    component.handleInput("\r");
    expect(component.focused).toBe(false);
    expect(component.render(100).join("\n")).not.toContain("First");
    expect(component.render(100).join("\n")).not.toContain("tokens");
    component.handleInput("\r");
    expect(await selection).toBe(secondRow);
    component.dispose();
  });

  test("session menu uses Vim navigation and keeps command keys as text while filtering", async () => {
    const menu = menuContext((text) => text, []);
    const open = async () => {
      const selection = selectSession(menu.ctx, menuRegistry);
      await new Promise((resolve) => setTimeout(resolve, 0));
      return { selection };
    };
    const selectedName = () =>
      menu
        .component()
        .render(100)
        .find((line) => line.includes("> "));

    let session = await open();
    menu.component().handleInput("k");
    expect(selectedName()).toContain("First");
    menu.component().handleInput("j");
    expect(selectedName()).toContain("Second");
    menu.component().handleInput("j");
    expect(selectedName()).toContain("Second");
    menu.component().handleInput("k");
    expect(selectedName()).toContain("First");
    menu.component().handleInput("\r");
    expect(await session.selection).toBe(firstRow);
    menu.component().dispose();

    session = await open();
    menu.component().handleInput("i");
    menu.component().handleInput("j");
    menu.component().handleInput("k");
    menu.component().handleInput("n");
    expect(menu.component().render(100).join("\n")).toContain("jkn");
    menu.component().handleInput("\x1b");
    expect(menu.component().focused).toBe(false);
    menu.component().handleInput("\x1b");
    expect(await session.selection).toBe("cancel");
    menu.component().dispose();

    session = await open();
    menu.component().handleInput("n");
    expect(await session.selection).toBe("new");
    menu.component().dispose();
  });
});
