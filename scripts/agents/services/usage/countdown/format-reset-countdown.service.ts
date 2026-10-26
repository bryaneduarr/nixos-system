import { MINUTES_PER_DAY, MINUTES_PER_HOUR, MS_PER_MINUTE } from "../../../constants/usage/countdown-units.constant.ts";
import { resetsAtSchema } from "../../../schemas/usage/usage-window.schema.ts";
import type { ResetCountdown, ResetCountdownInput } from "../../../types/usage/countdown/reset-countdown.interface.ts";

function countRemainingMinutes(resetTimeMs: number, now: Date): number {
  return Math.max(0, Math.floor((resetTimeMs - now.getTime()) / MS_PER_MINUTE));
}

function describeRemaining(remainingMinutes: number): string {
  const days = Math.floor(remainingMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((remainingMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const minutes = remainingMinutes % MINUTES_PER_HOUR;
  const dayPart = remainingMinutes >= MINUTES_PER_DAY ? `${days}d ` : "";
  const hourPart = remainingMinutes >= MINUTES_PER_HOUR ? `${hours}h ` : "";
  return `${dayPart}${hourPart}${minutes}m`;
}

export function formatResetCountdown(input: ResetCountdownInput): ResetCountdown {
  const parsedResetsAt = resetsAtSchema.safeParse(input.resetsAt);
  if (!parsedResetsAt.success) return { state: "invalid-timestamp" };
  const remainingMinutes = countRemainingMinutes(Date.parse(parsedResetsAt.data), input.now);
  return { state: "formatted", text: `resets in ${describeRemaining(remainingMinutes)}` };
}
