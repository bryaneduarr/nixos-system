import type { SessionStatus } from "../../../types/sessions/registry/live-session.interface.ts";

export function sessionStatus(working: boolean, editor: string): SessionStatus {
  if (working) return "working";
  if (editor.length > 0) return "draft";
  return "idle";
}
