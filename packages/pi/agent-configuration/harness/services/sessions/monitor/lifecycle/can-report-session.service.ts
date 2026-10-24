import { PI_INTERACTIVE_MODE } from "../../../../constants/sessions/install/environment.constant.ts";

export function canReportSession(mode: string, isHerdrEnvironment: boolean): boolean {
  return mode === PI_INTERACTIVE_MODE && isHerdrEnvironment;
}
