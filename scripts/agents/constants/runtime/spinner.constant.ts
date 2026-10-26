import { CARRIAGE_RETURN, ERASE_LINE_SEQUENCE } from "./terminal-sequence.constant.ts";

export const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

export const SPINNER_INTERVAL_MILLISECONDS = 80;

export const SPINNER_TEXT = "Reading usage...";

export const SPINNER_LINE_RESET_SEQUENCE = `${CARRIAGE_RETURN}${ERASE_LINE_SEQUENCE}`;
