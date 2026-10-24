import { PI_INTERACTIVE_MODE } from "../../../../constants/sessions/environment.constant.ts";

export function canReportSession(mode: string, isHerdrEnvironment: boolean): boolean {
  return mode === PI_INTERACTIVE_MODE && isHerdrEnvironment;
}
