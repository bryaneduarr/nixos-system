import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { MonitoredSession } from "./monitored-session.interface.ts";

/** Mutable state of the session monitor that persists across the events of one Pi process. */
export interface SessionMonitorState {
  /** Whether the conversation has user or agent history, latched once set. */
  historyEver: boolean;
  /** Whether Pi is compacting the conversation. */
  compacting: boolean;
  /** Whether an agent run is active and may notify on completion. */
  agentActive: boolean;
  /** Whether the user ran a shell command in this session. */
  userBash: boolean;
  /** Whether a session switch or creation is in progress. */
  open: boolean;
  /** Last known Git branch of the project, or the no-git label. */
  branch: string;
  /** Time of the last branch lookup in milliseconds since the epoch. */
  branchUpdatedAt: number;
  /** Session being monitored, absent before a start and after a stop. */
  session: ValueState<MonitoredSession>;
}
