import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** Content shown by a tool box; setting it replaces the previous content. */
export interface ToolBoxContent {
  /** Title shown in the top border of the box. */
  readonly title: string;
  /** Body lines shown inside the box. */
  readonly lines: readonly string[];
  /** Tool call whose recorded activity the box follows. */
  readonly toolCall: ValueState<string>;
  /** Color of the border and text. */
  readonly color: ThemeColor;
  /** Start time of a timer shown in the box, when the box has one. */
  readonly elapsedStartedAt: ValueState<number>;
}
