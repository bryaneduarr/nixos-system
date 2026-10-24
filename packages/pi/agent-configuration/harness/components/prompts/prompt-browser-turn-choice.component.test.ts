import { expect, test } from "bun:test";
import { browser, keys } from "./prompt-browser.component.test-double.ts";

function choosingBrowser() {
  const chosen: number[] = [];
  const opened = browser("draft text", () => Promise.resolve(), {
    kind: "choose-turn",
    choose: (turnsFromLatest) => {
      chosen.push(turnsFromLatest);
    },
  });
  return { ...opened, chosen };
}

test("Enter on a prompt closes the browser and chooses its turn", () => {
  const { component, closed, chosen } = choosingBrowser();
  keys(component, "\t", "j", "\r");
  expect(chosen).toEqual([0]);
  expect(closed()).toBe(1);
});

test("Enter on an output chooses the turn the output belongs to", () => {
  const { component, chosen } = choosingBrowser();
  keys(component, "2", "\t", "j", "\r");
  expect(chosen).toEqual([1]);
});

test("Enter on the unsent draft does nothing", () => {
  const { component, closed, chosen } = choosingBrowser();
  keys(component, "\t", "\r");
  expect(chosen).toEqual([]);
  expect(closed()).toBe(0);
});

test("a read-only browser ignores Enter and shows no turn hint", () => {
  const { component, closed } = browser("draft text");
  keys(component, "\t", "j", "\r");
  expect(closed()).toBe(0);
  expect(component.render(100).join("\n")).not.toContain("Enter show turn");
});

test("the turn browser advertises Enter in its header", () => {
  const { component } = choosingBrowser();
  expect(component.render(100).join("\n")).toContain("Enter show turn");
});
