import { describe, expect, test } from "bun:test";
import { rgbColor, visibleWidth } from "@earendil-works/pi-tui";
import { selectSession } from "./select-session.service.ts";
import { menuContext, menuRegistry, secondRow } from "./select-session.test-double.ts";

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
});
