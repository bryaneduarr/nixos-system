/** Card that the transcript or the prompt area draws around its content. */
export type CardKind = "user" | "agent" | "input" | "thinking";

/** Card around a message that the transcript renders. */
export type MessageCardKind = Exclude<CardKind, "input">;

/** Background behind a whole card: a faint fill, or the terminal's own background. */
export type CardTint = { readonly tintState: "tinted"; readonly color: string } | { readonly tintState: "plain" };

/** Characters that draw a card border. */
export interface CardFrame {
  /** Start of the top border: the corner and the rule characters before the title. */
  readonly topLeft: string;
  /** End of the top border. */
  readonly topRight: string;
  /** Start of the bottom border. */
  readonly bottomLeft: string;
  /** End of the bottom border. */
  readonly bottomRight: string;
  /** Character repeated along the top and bottom borders. */
  readonly horizontal: string;
  /** Character repeated along the left and right borders. */
  readonly vertical: string;
}

/** Colors and title that make one card recognizable. */
export interface CardStyle {
  /** Lowercase label shown in the top border, including its surrounding spaces. */
  readonly title: string;
  /** Hex color of the border lines and corners. */
  readonly borderColor: string;
  /** Hex color of the bold title. */
  readonly titleColor: string;
  /** Characters that draw the border. */
  readonly frame: CardFrame;
  /** Background that fills every row of the card. */
  readonly tint: CardTint;
}
