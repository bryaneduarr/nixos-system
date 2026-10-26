import { describe, expect, test } from "bun:test";
import {
  HELP_FLAG,
  JSON_FLAG,
  PROVIDER_FLAG,
  SHORT_HELP_FLAG,
  USAGE_FLAG,
  WATCH_FLAG,
} from "../../../constants/cli/command-flags.constant.ts";
import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";
import { buildHelpText } from "./build-help-text.service.ts";

const ESCAPE_CHARACTER = "\u001b";

describe("buildHelpText", () => {
  test("mentions every provider name", () => {
    const helpText = buildHelpText();
    for (const provider of PROVIDER_ORDER) {
      expect(helpText).toContain(provider);
    }
  });

  test("mentions every flag", () => {
    const helpText = buildHelpText();
    for (const flag of [USAGE_FLAG, JSON_FLAG, WATCH_FLAG, PROVIDER_FLAG, HELP_FLAG, SHORT_HELP_FLAG]) {
      expect(helpText).toContain(flag);
    }
  });

  test("contains no color escape sequences", () => {
    expect(buildHelpText()).not.toContain(ESCAPE_CHARACTER);
  });
});
