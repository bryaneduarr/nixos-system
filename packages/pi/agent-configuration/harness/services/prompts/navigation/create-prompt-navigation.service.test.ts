import { expect, test } from "bun:test";
import { createPromptNavigation } from "./create-prompt-navigation.service.ts";

test("reverse character and line ranges include both endpoints", () => {
  const navigation = createPromptNavigation("a🙂\nb界\nc");
  navigation.move(4);
  navigation.toggleSelection("character");
  navigation.move(1);
  expect(navigation.selectedText()).toEqual({ found: true, text: "🙂\nb界" });
  navigation.toggleSelection("line");
  expect(navigation.selectedText()).toEqual({ found: true, text: "a🙂\nb界\n" });
});
