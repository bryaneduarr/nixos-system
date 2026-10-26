import {
  DEFAULT_CARD_WIDTH,
  TERMINAL_MAX_WIDTH,
  TERMINAL_MIN_WIDTH,
} from "../../constants/runtime/terminal-settings.constant.ts";
import { noColorVariableSchema } from "../../schemas/runtime/no-color-variable.schema.ts";
import { terminalColumnsSchema } from "../../schemas/runtime/terminal-columns.schema.ts";
import type {
  TerminalSettings,
  TerminalSettingsInput,
  TerminalStream,
} from "../../types/runtime/terminal-settings.interface.ts";

function isNoColorRequested(environment: typeof process.env): boolean {
  return noColorVariableSchema.safeParse(environment.NO_COLOR).success;
}

function clampCardWidth(columns: number): number {
  return Math.min(Math.max(columns, TERMINAL_MIN_WIDTH), TERMINAL_MAX_WIDTH);
}

function readCardWidth(stdout: TerminalStream): number {
  if (!stdout.isTTY) return DEFAULT_CARD_WIDTH;
  const parsedColumns = terminalColumnsSchema.safeParse(stdout.columns);
  return parsedColumns.success ? clampCardWidth(parsedColumns.data) : DEFAULT_CARD_WIDTH;
}

export function readTerminalSettings(input: TerminalSettingsInput): TerminalSettings {
  const isColorAllowed = input.stdout.isTTY && !isNoColorRequested(input.environment);
  return { colorEnabled: isColorAllowed, width: readCardWidth(input.stdout) };
}
