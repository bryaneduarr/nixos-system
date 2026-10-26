import type { CardFrame } from "./card-frame.interface.ts";
import type { CardTint } from "./card-tint.interface.ts";

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
