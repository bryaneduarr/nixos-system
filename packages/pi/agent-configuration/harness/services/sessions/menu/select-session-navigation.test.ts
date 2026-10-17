import { describe, expect, test } from "bun:test";
import { selectSession } from "./select-session.service.ts";
import { firstRow, menuContext, menuRegistry } from "./select-session.test-double.ts";

describe("selectSession navigation", () => {
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

    let opened = await open();
    menu.component().handleInput("k");
    expect(selectedName()).toContain("First");
    menu.component().handleInput("j");
    expect(selectedName()).toContain("Second");
    menu.component().handleInput("j");
    expect(selectedName()).toContain("Second");
    menu.component().handleInput("k");
    expect(selectedName()).toContain("First");
    menu.component().handleInput("\r");
    expect(await opened.selection).toBe(firstRow);
    menu.component().dispose();

    opened = await open();
    menu.component().handleInput("i");
    menu.component().handleInput("j");
    menu.component().handleInput("k");
    menu.component().handleInput("n");
    expect(menu.component().render(100).join("\n")).toContain("jkn");
    menu.component().handleInput("\x1b");
    expect(menu.component().focused).toBe(false);
    menu.component().handleInput("\x1b");
    expect(await opened.selection).toBe("cancel");
    menu.component().dispose();

    opened = await open();
    menu.component().handleInput("n");
    expect(await opened.selection).toBe("new");
    menu.component().dispose();
  });
});
