const INTERACTIVE_MODE = "tui";

export function canReportSession(mode: string, isHerdrEnvironment: boolean): boolean {
  return mode === INTERACTIVE_MODE && isHerdrEnvironment;
}
