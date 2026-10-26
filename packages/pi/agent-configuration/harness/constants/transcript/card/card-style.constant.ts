import type { CardFrame } from "../../../types/transcript/card/card-frame.interface.ts";
import type { CardKind } from "../../../types/transcript/card/card-kind.interface.ts";
import type { CardStyle } from "../../../types/transcript/card/card-style.interface.ts";
import type { CardTint } from "../../../types/transcript/card/card-tint.interface.ts";

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
