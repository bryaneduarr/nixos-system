import { describe, expect, test } from "bun:test";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { buildUsageJson } from "./build-usage-json.service.ts";

describe("buildUsageJson", () => {
  test("writes every item with the same keys in the given order", () => {
    const usages: readonly ProviderUsage[] = [
      {
        status: "ok",
        provider: "claude",
        plan: { state: "reported", name: "max" },
        windows: [{ label: "5-hour", percentRemaining: 97, resetsAt: "2026-10-25T16:00:00.000Z" }],
      },
      { status: "login-expired", provider: "claude", message: "Example sign-in message." },
      { status: "error", provider: "opencode", message: "Example failure message." },
    ];

    expect(buildUsageJson(usages)).toBe(`[
  {
    "provider": "claude",
    "status": "ok",
    "plan": "max",
    "windows": [
      {
        "label": "5-hour",
        "percentRemaining": 97,
        "resetsAt": "2026-10-25T16:00:00.000Z"
      }
    ],
    "message": null
  },
  {
    "provider": "claude",
    "status": "login-expired",
    "plan": null,
    "windows": [],
    "message": "Example sign-in message."
  },
  {
    "provider": "opencode",
    "status": "error",
    "plan": null,
    "windows": [],
    "message": "Example failure message."
  }
]`);
  });

  test("writes an empty list as an empty JSON array", () => {
    expect(buildUsageJson([])).toBe("[]");
  });
});
