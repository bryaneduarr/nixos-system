import { describe, expect, test } from "bun:test";
import { describePlanName } from "./describe-plan-name.service.ts";

describe("describePlanName", () => {
  test("reports the plan name as provided", () => {
    expect(describePlanName("max")).toEqual({ state: "reported", name: "max" });
  });

  test("trims surrounding whitespace from the plan name", () => {
    expect(describePlanName("  plus  ")).toEqual({ state: "reported", name: "plus" });
  });

  test.each(["", "   ", "\t\n"])("reports no plan for the blank plan name %j", (planName) => {
    expect(describePlanName(planName)).toEqual({ state: "unreported" });
  });
});
