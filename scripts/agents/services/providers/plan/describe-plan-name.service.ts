import type { PlanReport } from "../../../types/usage/provider-usage.interface.ts";

export function describePlanName(reportedPlanName: string): PlanReport {
  const planName = reportedPlanName.trim();
  return planName === "" ? { state: "unreported" } : { state: "reported", name: planName };
}
