import { expect, test } from "bun:test";
import { browser, keys, settle } from "./prompt-browser.component.test-double.ts";

test("2 shows the agent outputs, copies them, and 1 returns to the prompts", async () => {
  const copied: string[] = [];
  const { component } = browser("draft", (text) => {
    copied.push(text);
  });

  keys(component, "2");
  expect(component.collection).toBe("outputs");
  expect(component.navigation.text).toBe("latest reply");
  expect(component.render(100).join("\n")).toContain("◆ 2 Outputs");

  keys(component, "\t", "j", "\t", "y", "y");
  await settle();
  expect(copied).toEqual(["earlier reply"]);

  keys(component, "1");
  expect(component.collection).toBe("prompts");
  expect(component.navigation.text).toBe("draft");
});
