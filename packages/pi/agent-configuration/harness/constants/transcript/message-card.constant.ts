import type { CardFrame, CardKind, CardStyle, CardTint } from "../../types/transcript/card/card-style.interface.ts";

/** Global key of the function Pi calls to draw a user or agent message card; must match pi-tools/patch-pi-message-cards.ts. */
export const MESSAGE_CARD_RENDERER_KEY = "pi.harness.renderMessageCard";
/** Global key of the function the powerline editor calls to draw the input card; must match pi-tools/patch-powerline-input-card.ts. */
export const INPUT_CARD_RENDERER_KEY = "pi.harness.renderInputCard";

/** Columns the card border and padding use on both sides of the content. */
export const CARD_SIDE_CHROME_WIDTH = 4;
/** Narrowest width that still fits a card frame; below it the content is drawn without one. */
export const MIN_CARD_WIDTH = 12;

/** Hex color of text inside a card, restored after every color reset in the content. */
export const CARD_BASE_TEXT_COLOR = "#cdd6f4";

const MUTED_BORDER_COLOR = "#45475a";
const MAUVE_TITLE_COLOR = "#cba6f7";
const ACTIVE_BLUE_COLOR = "#89b4fa";
// Catppuccin blue mixed 10% into the base color, so it stays faint behind text.
const FAINT_BLUE_TINT: CardTint = { tintState: "tinted", color: "#292d42" };
const NO_TINT: CardTint = { tintState: "plain" };
const ROUNDED_FRAME: CardFrame = {
  topLeft: "╭─",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
};
// Same characters as the tool boxes in box-frame.constant.ts.
const DASHED_FRAME: CardFrame = {
  topLeft: "+--",
  topRight: "+",
  bottomLeft: "+",
  bottomRight: "+",
  horizontal: "-",
  vertical: "|",
};

export const CARD_STYLES: Readonly<Record<CardKind, CardStyle>> = {
  user: {
    title: " user ",
    borderColor: MUTED_BORDER_COLOR,
    titleColor: MAUVE_TITLE_COLOR,
    frame: ROUNDED_FRAME,
    tint: FAINT_BLUE_TINT,
  },
  agent: {
    title: " agent ",
    borderColor: MUTED_BORDER_COLOR,
    titleColor: MAUVE_TITLE_COLOR,
    frame: ROUNDED_FRAME,
    tint: NO_TINT,
  },
  input: {
    title: " input ",
    borderColor: ACTIVE_BLUE_COLOR,
    titleColor: ACTIVE_BLUE_COLOR,
    frame: ROUNDED_FRAME,
    tint: NO_TINT,
  },
  thinking: {
    title: " thinking ",
    borderColor: MUTED_BORDER_COLOR,
    titleColor: MAUVE_TITLE_COLOR,
    frame: DASHED_FRAME,
    tint: NO_TINT,
  },
};
