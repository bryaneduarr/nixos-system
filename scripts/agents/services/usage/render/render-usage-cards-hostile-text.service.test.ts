import { describe, expect, test } from "bun:test";
import {
  ANSI_ESCAPE,
  ANSI_RESET_SEQUENCE,
  ANSI_SGR_PATTERN,
  BAR_LEVEL_SGR,
  DIM_SGR,
  MESSAGE_STATUS_SGR,
  PROVIDER_ACCENT_SGR,
} from "../../../constants/render/card-color.constant.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { measureVisibleLength } from "./measure-visible-length.service.ts";
import { renderUsageCards } from "./render-usage-cards.service.ts";
import { boxCard, now, renderPlain, wideInnerWidth, wideWidth } from "./render-usage-cards.test-double.ts";

const minCardWidth = 40;

const minInnerWidth = 36;

const hostileLabelUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "unreported" },
  windows: [{ label: "Ses\u001b[2J\rsion🙂", percentRemaining: 97, resetsAt: "2026-10-28T16:12:00Z" }],
};

const hostilePlanUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "reported", name: "ma\u001b[31mx\r" },
  windows: [{ label: "Monthly", percentRemaining: 80, resetsAt: "2026-10-28T16:12:00Z" }],
};

const blankPlanUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "reported", name: "\u001b\r" },
  windows: [],
};

const hostileMessageUsage: ProviderUsage = {
  status: "error",
  provider: "opencode",
  message: "Run\u001b[2J example\r\n\tagain",
};

const blankMessageUsage: ProviderUsage = {
  status: "error",
  provider: "opencode",
  message: "\r\n\t\u001b",
};

const hostileUsages: readonly ProviderUsage[] = [
  hostileLabelUsage,
  hostilePlanUsage,
  hostileMessageUsage,
  blankMessageUsage,
];

describe("renderUsageCards with hostile provider text", () => {
  test("keeps escapes and carriage returns out of labels, plan names and messages without color", () => {
    const output = renderPlain(hostileUsages);
    expect(output).not.toContain("\u001b");
    expect(output).not.toContain("\u001b[2J");
    expect(output).not.toContain("\r");
    expect(output).not.toContain("\t");
  });

  test("shows printable remnants in place of each control character", () => {
    expect(renderPlain([hostileLabelUsage])).toContain("Ses [2J sion🙂");
    expect(renderPlain([hostilePlanUsage])).toContain("Claude Code  ma [31mx");
    expect(renderPlain([hostileMessageUsage])).toContain("Run [2J example again");
  });

  test("omits the plan from the title when its name is blank after sanitizing", () => {
    expect(renderPlain([blankPlanUsage])).toBe(boxCard(["Claude Code", "", "no limits reported"], wideInnerWidth));
  });

  test("shows only the status word when the message is blank after sanitizing", () => {
    expect(renderPlain([blankMessageUsage], minCardWidth)).toBe(boxCard(["OpenCode Go", "", "error"], minInnerWidth));
  });

  test("draws hostile text cards with one visible width per line", () => {
    for (const width of [minCardWidth, wideWidth]) {
      for (const colorEnabled of [false, true]) {
        const output = renderUsageCards({ usages: hostileUsages, now, colorEnabled, width });
        const lines = output.split("\n").filter((line) => line !== "");
        expect([...new Set(lines.map(measureVisibleLength))]).toEqual([width]);
      }
    }
  });

  test("writes only the renderer's own SGR codes when color is enabled", () => {
    const output = renderUsageCards({ usages: hostileUsages, now, colorEnabled: true, width: wideWidth });
    const rendererSgrCodes = [
      ...Object.values(PROVIDER_ACCENT_SGR),
      ...Object.values(BAR_LEVEL_SGR),
      ...Object.values(MESSAGE_STATUS_SGR),
      DIM_SGR,
    ];
    const knownEscapes = [ANSI_RESET_SEQUENCE, ...rendererSgrCodes.map((sgr) => `${ANSI_ESCAPE}[${sgr}m`)];
    const writtenEscapes = Array.from(output.matchAll(ANSI_SGR_PATTERN), (match) => match[0]);
    expect(output.replace(ANSI_SGR_PATTERN, "")).not.toContain(ANSI_ESCAPE);
    expect(writtenEscapes.filter((sequence) => !knownEscapes.includes(sequence))).toEqual([]);
  });
});
