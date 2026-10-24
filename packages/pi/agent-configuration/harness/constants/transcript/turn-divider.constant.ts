/** Character that draws the dashed line of a turn divider. */
export const TURN_DIVIDER_DASH = "╌";
/** Theme color of the dashes. */
export const TURN_DIVIDER_DASH_COLOR = "muted";
/** Theme color of the arrow, count, and wording. */
export const TURN_DIVIDER_LABEL_COLOR = "accent";
/** Theme color of the shortcut name. */
export const TURN_DIVIDER_KEY_COLOR = "warning";
/** Arrow that points toward the hidden turns, by direction. */
export const TURN_DIVIDER_ARROW = { earlier: "↑", later: "↓" } as const;
/** Word that names the hidden turns, by direction. */
export const TURN_DIVIDER_DIRECTION_WORD = { earlier: "earlier", later: "later" } as const;
/** Separator between the hidden count and the shortcut. */
export const TURN_DIVIDER_SEPARATOR = " · ";
/** Verb shown beside the shortcut. */
export const TURN_DIVIDER_ACTION = "show";
