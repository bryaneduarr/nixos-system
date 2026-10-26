import { expect, test } from "bun:test";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { createWarningRendererFactory } from "./create-warning-renderer-factory.service.ts";

const plainTheme = { fg: (_color: string, text: string): string => text };
const warningText = "Claude rate limit warning: 80% used (seven_day)";

test("a warning is recorded once and drawn as a dashed box", () => {
  const before = activityStore.all().length;
  const render = createWarningRendererFactory("/tmp/example", plainTheme)(warningText);
  const lines = render(60).map(stripTerminalSequences);
  expect(activityStore.all().length).toBe(before + 1);
  expect(lines[0]).toBe("");
  expect(lines[1]).toStartWith("+-- WARNING ");
  expect(lines.join("\n")).toContain("seven_day");
  expect(lines.join("\n")).not.toContain("╭");
  render(60);
  expect(activityStore.all().length).toBe(before + 1);
});
